package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.presentation.dto.response.SessionResponse;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetSessionUseCase {

    private final LiveStreamSessionRepository sessionRepository;

    @Transactional(readOnly = true)
    public SessionResponse execute(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .map(SessionResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiên stream: " + sessionId));
    }
}