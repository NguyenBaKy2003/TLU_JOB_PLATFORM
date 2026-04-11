package edu.tlu.jobplatform.chatbot.usecase;

import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import edu.tlu.jobplatform.chatbot.domain.port.ChatSessionRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteSessionUseCase {

    private final ChatSessionRepository sessionRepo;

    @Transactional
    public void execute(UUID sessionId, UUID userId) {
        ChatSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> ResourceNotFoundException.of("ChatSession", sessionId));
        if (!session.getUserId().equals(userId))
            throw new BusinessRuleException("Phiên chat không hợp lệ.", "FORBIDDEN");
        sessionRepo.deleteById(sessionId);
    }
}
