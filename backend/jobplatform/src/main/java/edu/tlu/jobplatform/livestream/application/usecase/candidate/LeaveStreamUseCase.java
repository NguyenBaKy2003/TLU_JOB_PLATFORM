package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.application.service.StreamViewerManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveStreamUseCase {

    private final StreamViewerManager viewerManager;

    public void execute(UUID sessionId, UUID candidateId) {
        int newCount = viewerManager.viewerLeft(sessionId, candidateId);
        log.info("[Leave] candidateId={} left sessionId={}, count={}", candidateId, sessionId, newCount);
    }
}