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
        LiveStreamSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiên stream: " + sessionId));

        if (!session.isHostedBy(requestingUserId)) {
            throw new IllegalStateException("Chỉ host mới có thể kết thúc stream");
        }

        session.end();
        sessionRepository.save(session);

        // ── Đọc stats TRƯỚC khi cleanup ──────────────────────────────────────
        int peakViewers = viewerManager.getPeakViewerCount(sessionId);
        int totalViewers = viewerManager.getTotalViewerCount(sessionId);

        long extraWatchSeconds = viewerManager.drainTotalWatchSeconds(sessionId);

        // ── Upsert analytics ──────────────────────────────────────────────────
        StreamAnalytics analytics = analyticsRepository
                .findBySessionId(sessionId)
                .orElseGet(() -> StreamAnalytics.createFor(sessionId));

        analytics.updatePeakViewers(peakViewers);
        analytics.restoreTotalViewerCount(totalViewers);

        if (extraWatchSeconds > 0) {
            analytics.addWatchTime(extraWatchSeconds);
        }

        analyticsRepository.save(analytics);

        log.info("[End] sessionId={} — peakViewers={}, totalViewers={}, extraWatchSeconds={}",
                sessionId, peakViewers, totalViewers, extraWatchSeconds);

        // ── Cleanup SAU khi đã đọc stats ─────────────────────────────────────
        viewerManager.cleanupSession(sessionId);
        mediaServerPort.endRoom(sessionId);

        log.info("Stream session {} ended by user {}", sessionId, requestingUserId);
    }
}