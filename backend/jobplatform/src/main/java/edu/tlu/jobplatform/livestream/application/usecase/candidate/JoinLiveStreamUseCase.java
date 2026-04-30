package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.application.port.out.MediaServerPort;
import edu.tlu.jobplatform.livestream.application.service.StreamViewerManager;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JoinLiveStreamUseCase {

        private final LiveStreamSessionRepository sessionRepository;
        private final MediaServerPort mediaServerPort;
        private final StreamViewerManager viewerManager;

        @Value("${livekit.url:ws://localhost:7880}")
        private String livekitUrl;

        public record Result(
                        String viewerToken,
                        String livekitUrl,
                        int currentViewerCount) {
        }

        @Transactional
        public Result execute(UUID sessionId, UUID candidateId) {
                LiveStreamSession session = sessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy phiên stream: " + sessionId));

                if (session.getStatus() != SessionStatus.LIVE) {
                        throw new BusinessRuleException(
                                        "Phiên stream chưa bắt đầu hoặc đã kết thúc.",
                                        "SESSION_NOT_LIVE");
                }

                int currentCount = viewerManager.viewerJoined(sessionId, candidateId);
                String viewerToken = mediaServerPort.generateViewerToken(sessionId, candidateId);

                log.info("[Join] candidateId={} joined sessionId={}, currentCount={}",
                                candidateId, sessionId, currentCount);

                return new Result(viewerToken, livekitUrl, currentCount);
        }
}