package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.application.port.out.MediaServerPort;
import edu.tlu.jobplatform.livestream.application.port.out.StreamQuotaServicePort;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;
import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamAnalyticsRepository;
import edu.tlu.jobplatform.livestream.domain.service.SessionDomainService;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StartLiveStreamUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamAnalyticsRepository analyticsRepository;
    private final MediaServerPort mediaServerPort;
    private final StreamQuotaServicePort quotaServicePort;
    private final SessionDomainService sessionDomainService;

    @Value("${livekit.url:ws://localhost:7880}")
    private String livekitUrl;

    public record Result(String hostToken, String livekitUrl) {
    }

    @Transactional
    public Result execute(UUID sessionId, UUID requestingUserId) {
        LiveStreamSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiên stream: " + sessionId));

        // Idempotent: session đã LIVE (ví dụ host reload trang) →
        // chỉ validate host rồi generate lại token, không đổi state.
        if (session.getStatus() == SessionStatus.LIVE) {
            sessionDomainService.validateIsHost(session, requestingUserId);
            String hostToken = mediaServerPort.generateHostToken(sessionId, requestingUserId);
            return new Result(hostToken, livekitUrl);
        }

        // Normal flow: SCHEDULED → LIVE
        sessionDomainService.validateCanStart(session, requestingUserId);
        session.start();

        if (!session.isQuotaConsumed()) {
            quotaServicePort.consumeStreamQuota(session.getCompanyId());
            session.markQuotaConsumed();
        }

        // Guard tránh duplicate analytics record nếu gọi lại
        if (!analyticsRepository.existsBySessionId(sessionId)) {
            analyticsRepository.save(StreamAnalytics.createFor(sessionId));
        }

        sessionRepository.save(session);

        String hostToken = mediaServerPort.generateHostToken(sessionId, requestingUserId);
        return new Result(hostToken, livekitUrl);
    }
}