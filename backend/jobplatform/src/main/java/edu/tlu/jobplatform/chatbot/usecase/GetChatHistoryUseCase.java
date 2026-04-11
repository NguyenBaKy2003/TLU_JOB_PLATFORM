package edu.tlu.jobplatform.chatbot.usecase;

import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import edu.tlu.jobplatform.chatbot.domain.port.ChatSessionRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetChatHistoryUseCase {

    private final ChatSessionRepository sessionRepo;

    @Transactional(readOnly = true)
    public Page<ChatSession> listSessions(UUID userId, Pageable pageable) {
        return sessionRepo.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public ChatSession getSession(UUID sessionId, UUID userId) {
        ChatSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> ResourceNotFoundException.of("ChatSession", sessionId));
        if (!session.getUserId().equals(userId))
            throw new BusinessRuleException("Phiên chat không hợp lệ.", "FORBIDDEN");
        return session;
    }
}
