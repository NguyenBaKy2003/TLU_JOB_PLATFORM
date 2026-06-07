package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.application.port.out.MediaServerPort;
import edu.tlu.jobplatform.livestream.application.service.StreamViewerManager;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamAnalyticsRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EndLiveStreamUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final MediaServerPort mediaServerPort;
    private final StreamViewerManager viewerManager;
    private final StreamAnalyticsRepository analyticsRepository;

    @Transactional
    public void execute(UUID sessionId, UUID requestingUserId) {

        // Lớp 2: pessimistic lock — chỉ 1 request chạy vào tại một thời điểm
        LiveStreamSession session = sessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiên stream: " + sessionId));

        if (!session.isHostedBy(requestingUserId)) {
            throw new IllegalStateException("Chỉ host mới có thể kết thúc stream");
        }

        // Lớp 1: idempotent guard — request thứ 2 thoát sớm sau khi lock được release
        if (session.isEnded()) {
            log.warn("[End] Session {} already ended, skipping duplicate call", sessionId);
            return;
        }

        session.end();
        sessionRepository.save(session);

        // Đọc stats TRƯỚC khi cleanup
        int peakViewers = viewerManager.getPeakViewerCount(sessionId);
        int totalViewers = viewerManager.getTotalViewerCount(sessionId);
        long extraWatchSec = viewerManager.drainTotalWatchSeconds(sessionId);

        StreamAnalytics analytics = analyticsRepository
                .findBySessionId(sessionId)
                .orElseGet(() -> StreamAnalytics.createFor(sessionId));

        analytics.updatePeakViewers(peakViewers);
        analytics.restoreTotalViewerCount(totalViewers);
        if (extraWatchSec > 0) {
            analytics.addWatchTime(extraWatchSec);
        }

        // Lớp 3: upsert thay vì save — safety net tránh duplicate key tuyệt đối
        analyticsRepository.upsert(analytics);

        log.info("[End] sessionId={} — peakViewers={}, totalViewers={}, extraWatchSec={}",
                sessionId, peakViewers, totalViewers, extraWatchSec);

        // Cleanup SAU khi đã lưu stats
        viewerManager.cleanupSession(sessionId);
        mediaServerPort.endRoom(sessionId);

        log.info("Stream session {} ended by user {}", sessionId, requestingUserId);
    }
}