package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.application.port.out.MediaServerPort;
import edu.tlu.jobplatform.livestream.application.service.StreamViewerManager;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
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
    private final StreamViewerManager viewerManager; // Thêm vào

    @Transactional
    public void execute(UUID sessionId, UUID requestingUserId) {
        LiveStreamSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên stream: " + sessionId));

        if (!session.isHostedBy(requestingUserId)) {
            throw new IllegalStateException("Chỉ host mới có thể kết thúc stream");
        }

        session.end();
        sessionRepository.save(session);

        // Clean up viewer tracking
        viewerManager.cleanupSession(sessionId);

        // Kết thúc room trên LiveKit
        mediaServerPort.endRoom(sessionId);

        log.info("Stream session {} ended by user {}", sessionId, requestingUserId);
    }
}