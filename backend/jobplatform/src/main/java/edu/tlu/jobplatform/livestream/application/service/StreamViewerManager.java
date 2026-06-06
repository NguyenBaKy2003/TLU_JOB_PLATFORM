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

@Service
@RequiredArgsConstructor
@Slf4j
public class StreamViewerManager {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamEventPublisher eventPublisher;
    private final StreamAnalyticsRepository analyticsRepository;

    private final Map<UUID, UUID> activeViewers = new ConcurrentHashMap<>();
    private final Map<UUID, AtomicInteger> sessionCounts = new ConcurrentHashMap<>();
    private final Map<UUID, Set<UUID>> sessionViewerSets = new ConcurrentHashMap<>();
    private final Map<UUID, AtomicInteger> peakViewerCounts = new ConcurrentHashMap<>();
    /** "sessionId:viewerId" → joinTimeMillis */
    private final Map<String, Long> viewerJoinTimes = new ConcurrentHashMap<>(); // ← THÊM

    // ── Public API ─────────────

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

        // ✅ Ghi nhận thời điểm join
        viewerJoinTimes.put(joinKey(sessionId, viewerId), System.currentTimeMillis());

        int newCount = sessionCounts
                .computeIfAbsent(sessionId, k -> new AtomicInteger(0))
                .incrementAndGet();

        peakViewerCounts
                .computeIfAbsent(sessionId, k -> new AtomicInteger(0))
                .accumulateAndGet(newCount, Math::max);

        persistAndPublish(sessionId, newCount);

        try {
            analyticsRepository.incrementTotalViewers(sessionId);
        } catch (Exception e) {
            log.warn("Failed to increment totalViewerCount for session {}", sessionId, e);
        }

        log.debug("Viewer {} joined session {}, count={}", viewerId, sessionId, newCount);
        return newCount;
    }

    public int viewerLeft(UUID sessionId, UUID viewerId) {
        activeViewers.remove(viewerId);
        // ✅ Tính watch time khi rời
        persistWatchTime(sessionId, viewerId);
        return removeFromSession(sessionId, viewerId);
    }

    public void viewerDisconnected(UUID viewerId) {
        UUID sessionId = activeViewers.remove(viewerId);
        if (sessionId == null)
            return;
        persistWatchTime(sessionId, viewerId);
        int newCount = removeFromSession(sessionId, viewerId);
        log.debug("Viewer {} disconnected from session {}, count={}", viewerId, sessionId, newCount);
    }

    public int getCurrentViewerCount(UUID sessionId) {
        AtomicInteger counter = sessionCounts.get(sessionId);
        return counter != null ? counter.get() : 0;
    }

    public int getPeakViewerCount(UUID sessionId) {
        AtomicInteger peak = peakViewerCounts.get(sessionId);
        return peak != null ? peak.get() : 0;
    }

    public int getTotalViewerCount(UUID sessionId) {
        return analyticsRepository.findBySessionId(sessionId)
                .map(a -> a.getTotalViewerCount())
                .orElse(0);
    }

    /**
     * Drain watch time của tất cả viewer còn lại khi stream kết thúc.
     * Gọi từ EndLiveStreamUseCase trước cleanupSession().
     * 
     * @return tổng giây xem của tất cả viewer còn trong session
     */
    public long drainTotalWatchSeconds(UUID sessionId) {
        Set<UUID> viewers = sessionViewerSets.getOrDefault(sessionId, Set.of());
        long now = System.currentTimeMillis();
        long total = 0L;
        for (UUID viewerId : viewers) {
            Long joinTime = viewerJoinTimes.remove(joinKey(sessionId, viewerId));
            if (joinTime != null) {
                total += (now - joinTime) / 1000;
            }
        }
        return total;
    }

    public void cleanupSession(UUID sessionId) {
        Set<UUID> viewers = sessionViewerSets.remove(sessionId);
        if (viewers != null) {
            viewers.forEach(viewerId -> {
                activeViewers.remove(viewerId, sessionId);
                viewerJoinTimes.remove(joinKey(sessionId, viewerId)); // ← THÊM
            });
        }
        sessionCounts.remove(sessionId);
        peakViewerCounts.remove(sessionId);

        try {
            eventPublisher.publishViewerCount(sessionId, 0);
        } catch (Exception e) {
            log.warn("Failed to publish cleanup event for session {}", sessionId, e);
        }

        log.info("Cleaned up viewer tracking for session {}", sessionId);
    }

    // ── Private helpers ────────

    private void persistWatchTime(UUID sessionId, UUID viewerId) {
        Long joinTime = viewerJoinTimes.remove(joinKey(sessionId, viewerId));
        if (joinTime == null)
            return;
        long seconds = (System.currentTimeMillis() - joinTime) / 1000;
        if (seconds <= 0)
            return;
        try {
            analyticsRepository.findBySessionId(sessionId).ifPresent(analytics -> {
                analytics.addWatchTime(seconds);
                analyticsRepository.save(analytics);
            });
        } catch (Exception e) {
            log.warn("Failed to persist watch time for viewer {} in session {}", viewerId, sessionId, e);
        }
    }

    private int removeFromSession(UUID sessionId, UUID viewerId) {
        Set<UUID> viewers = sessionViewerSets.get(sessionId);
        if (viewers == null || !viewers.remove(viewerId)) {
            return getCurrentViewerCount(sessionId);
        }

        AtomicInteger counter = sessionCounts.get(sessionId);
        int newCount = counter != null
                ? Math.max(0, counter.decrementAndGet())
                : 0;

        if (counter != null && counter.get() < 0) {
            counter.set(0);
            newCount = 0;
        }

        persistAndPublish(sessionId, newCount);
        return newCount;
    }

    private void persistAndPublish(UUID sessionId, int count) {
        try {
            sessionRepository.updateViewerCount(sessionId, count);
        } catch (Exception e) {
            log.error("Failed to persist viewer count {} for session {}", count, sessionId, e);
        }
        try {
            eventPublisher.publishViewerCount(sessionId, count);
        } catch (Exception e) {
            log.error("Failed to publish viewer count event for session {}", sessionId, e);
        }
    }

    private static String joinKey(UUID sessionId, UUID viewerId) {
        return sessionId + ":" + viewerId;
    }
}