package edu.tlu.jobplatform.livestream.application.service;

import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamAnalyticsRepository;
import edu.tlu.jobplatform.livestream.infrastructure.realtime.StreamEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory viewer tracking cho livestream sessions.
 *
 * Design:
 * - activeViewers : viewerId → sessionId (biết viewer đang ở session nào)
 * - sessionCounts : sessionId → AtomicInteger (counter per-session, atomic)
 * - sessionViewers : sessionId → Set<viewerId> (dedup — tránh count 2 lần cùng
 * userId)
 *
 * Source of truth: viewer được tính khi join qua HTTP (JoinLiveStreamUseCase)
 * HOẶC subscribe STOMP — dedup hoàn toàn theo viewerId, không đếm 2 lần.
 *
 * Thread safety:
 * - ConcurrentHashMap cho tất cả map
 * - AtomicInteger cho counter (increment/decrement atomic, không dùng merge)
 * - Set<viewerId> per session là ConcurrentHashMap.newKeySet() (thread-safe)
 * - updateViewerCount() trong DB dùng method riêng (không load aggregate)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StreamViewerManager {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamEventPublisher eventPublisher;
    private final StreamAnalyticsRepository analyticsRepository;

    /** viewerId → sessionId — biết viewer đang xem session nào */
    private final Map<UUID, UUID> activeViewers = new ConcurrentHashMap<>();

    /** sessionId → AtomicInteger count */
    private final Map<UUID, AtomicInteger> sessionCounts = new ConcurrentHashMap<>();

    /** sessionId → Set<viewerId> — dedup per session */
    private final Map<UUID, Set<UUID>> sessionViewerSets = new ConcurrentHashMap<>();

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Ghi nhận viewer tham gia session.
     * Idempotent: gọi nhiều lần với cùng (viewerId, sessionId) chỉ tính 1 lần.
     * Nếu viewer đang ở session khác, tự động rời trước.
     *
     * @return viewer count hiện tại sau khi join
     */
    public int viewerJoined(UUID sessionId, UUID viewerId) {
        UUID previousSession = activeViewers.get(viewerId);
        if (previousSession != null && !previousSession.equals(sessionId)) {
            removeFromSession(previousSession, viewerId);
        }

        Set<UUID> viewers = sessionViewerSets.computeIfAbsent(
                sessionId, k -> ConcurrentHashMap.newKeySet());

        boolean added = viewers.add(viewerId);
        if (!added) {
            activeViewers.put(viewerId, sessionId);
            return getCurrentViewerCount(sessionId);
        }

        activeViewers.put(viewerId, sessionId);
        int newCount = sessionCounts
                .computeIfAbsent(sessionId, k -> new AtomicInteger(0))
                .incrementAndGet();

        persistAndPublish(sessionId, newCount);

        // ← THÊM: chỉ tăng khi added == true (viewer mới thật sự)
        try {
            analyticsRepository.incrementTotalViewers(sessionId);
        } catch (Exception e) {
            log.warn("Failed to increment totalViewerCount for session {}", sessionId, e);
        }

        log.debug("Viewer {} joined session {}, count={}", viewerId, sessionId, newCount);
        return newCount;
    }

    /**
     * Ghi nhận viewer rời session.
     *
     * @return viewer count hiện tại sau khi rời
     */
    public int viewerLeft(UUID sessionId, UUID viewerId) {
        activeViewers.remove(viewerId);
        return removeFromSession(sessionId, viewerId);
    }

    /**
     * Xử lý WebSocket disconnect — viewer bị ngắt kết nối không chủ động rời.
     * Tra theo viewerId để tìm session đang xem.
     */
    public void viewerDisconnected(UUID viewerId) {
        UUID sessionId = activeViewers.remove(viewerId);
        if (sessionId == null)
            return;
        int newCount = removeFromSession(sessionId, viewerId);
        log.debug("Viewer {} disconnected from session {}, count={}", viewerId, sessionId, newCount);
    }

    /**
     * Lấy viewer count hiện tại từ in-memory (không query DB).
     */
    public int getCurrentViewerCount(UUID sessionId) {
        AtomicInteger counter = sessionCounts.get(sessionId);
        return counter != null ? counter.get() : 0;
    }

    /**
     * Dọn dẹp toàn bộ dữ liệu của session khi session kết thúc.
     * Gọi sau khi session chuyển sang ENDED/CANCELLED.
     *
     * Không có race condition với viewerJoined vì:
     * - Sau khi session ENDED, server không chấp nhận join mới
     * - Các viewer đang xem sẽ nhận event và disconnect
     */
    public void cleanupSession(UUID sessionId) {
        Set<UUID> viewers = sessionViewerSets.remove(sessionId);
        if (viewers != null) {
            viewers.forEach(viewerId -> activeViewers.remove(viewerId, sessionId) // chỉ remove nếu vẫn map đến session
                                                                                  // này
            );
        }
        sessionCounts.remove(sessionId);

        // Publish count = 0 để client cập nhật UI
        try {
            eventPublisher.publishViewerCount(sessionId, 0);
        } catch (Exception e) {
            log.warn("Failed to publish cleanup event for session {}", sessionId, e);
        }

        log.info("Cleaned up viewer tracking for session {}", sessionId);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Xóa viewer khỏi session set và giảm counter.
     * Trả về count mới. Không thay đổi activeViewers map (caller tự xử lý).
     */
    private int removeFromSession(UUID sessionId, UUID viewerId) {
        Set<UUID> viewers = sessionViewerSets.get(sessionId);
        if (viewers == null || !viewers.remove(viewerId)) {
            // Viewer không thực sự ở trong set này — không giảm count
            return getCurrentViewerCount(sessionId);
        }

        AtomicInteger counter = sessionCounts.get(sessionId);
        int newCount = counter != null
                ? Math.max(0, counter.decrementAndGet())
                : 0;

        // Fix counter nếu bị âm (edge case)
        if (counter != null && counter.get() < 0) {
            counter.set(0);
            newCount = 0;
        }

        persistAndPublish(sessionId, newCount);
        return newCount;
    }

    /**
     * Persist count vào DB (dùng updateViewerCount — không load aggregate)
     * và publish realtime event.
     *
     * Fire-and-forget cho DB: lỗi DB không nên block luồng realtime.
     */
    private void persistAndPublish(UUID sessionId, int count) {
        // Persist
        try {
            sessionRepository.updateViewerCount(sessionId, count);
        } catch (Exception e) {
            log.error("Failed to persist viewer count {} for session {}", count, sessionId, e);
            // Không ném exception — in-memory vẫn đúng, DB sync sau
        }

        // Publish realtime
        try {
            eventPublisher.publishViewerCount(sessionId, count);
        } catch (Exception e) {
            log.error("Failed to publish viewer count event for session {}", sessionId, e);
        }
    }
}