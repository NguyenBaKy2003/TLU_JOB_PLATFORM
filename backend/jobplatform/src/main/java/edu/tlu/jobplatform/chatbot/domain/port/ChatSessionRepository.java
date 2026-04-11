package edu.tlu.jobplatform.chatbot.domain.port;

import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ChatSessionRepository {
    Optional<ChatSession> findById(UUID id);

    Page<ChatSession> findByUserId(UUID userId, Pageable pageable);

    ChatSession save(ChatSession session);

    void deleteById(UUID id);
}
