package edu.tlu.jobplatform.chatbot.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.chatbot.domain.model.ChatMessage;
import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import edu.tlu.jobplatform.chatbot.domain.port.ChatSessionRepository;
import edu.tlu.jobplatform.chatbot.infrastructure.persistence.entity.ChatMessageJpaEntity;
import edu.tlu.jobplatform.chatbot.infrastructure.persistence.entity.ChatSessionJpaEntity;
import edu.tlu.jobplatform.chatbot.infrastructure.persistence.repository.ChatSessionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ChatSessionRepositoryAdapter implements ChatSessionRepository {

    private final ChatSessionJpaRepository jpaRepo;

    @Override
    public Optional<ChatSession> findById(UUID id) {
        return jpaRepo.findById(id).map(this::toDomain);
    }

    @Override
    public Page<ChatSession> findByUserId(UUID userId, Pageable pageable) {
        return jpaRepo.findByUserIdOrderByLastMessageAtDesc(userId, pageable)
                .map(this::toDomain);
    }

    @Override
    public ChatSession save(ChatSession session) {
        Optional<ChatSessionJpaEntity> existing = jpaRepo.findById(session.getId());
        ChatSessionJpaEntity entity = existing.isPresent()
                ? updateEntity(existing.get(), session)
                : toNewEntity(session);
        return toDomain(jpaRepo.save(entity));
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }

    // ── Mapper ────────────────────────────────────────────────

    private ChatSession toDomain(ChatSessionJpaEntity e) {
        List<ChatMessage> messages = e.getMessages() == null ? List.of()
                : e.getMessages().stream().map(m -> ChatMessage.builder()
                        .id(m.getId()).sessionId(m.getSessionId())
                        .role(m.getRole()).content(m.getContent())
                        .createdAt(m.getCreatedAt()).build()).toList();

        return ChatSession.builder()
                .id(e.getId()).userId(e.getUserId())
                .title(e.getTitle()).messages(new java.util.ArrayList<>(messages))
                .createdAt(e.getCreatedAt()).lastMessageAt(e.getLastMessageAt())
                .build();
    }

    private ChatSessionJpaEntity toNewEntity(ChatSession d) {
        ChatSessionJpaEntity entity = ChatSessionJpaEntity.builder()
                .userId(d.getUserId())
                .title(d.getTitle())
                .lastMessageAt(d.getLastMessageAt())
                .build();

        entity.setId(d.getId());

        syncMessages(entity, d);
        return entity;
    }

    private ChatSessionJpaEntity updateEntity(ChatSessionJpaEntity e, ChatSession d) {
        e.setTitle(d.getTitle());
        e.setLastMessageAt(d.getLastMessageAt());
        syncMessages(e, d);
        return e;
    }

    private void syncMessages(ChatSessionJpaEntity entity, ChatSession session) {
        entity.getMessages().clear();
        if (session.getMessages() != null) {
            UUID sessionId = entity.getId() != null ? entity.getId() : session.getId();
            session.getMessages().forEach(m -> entity.getMessages().add(ChatMessageJpaEntity.builder()
                    .sessionId(sessionId)
                    .role(m.getRole())
                    .content(m.getContent())
                    .createdAt(m.getCreatedAt())
                    .build()));
        }
    }
}
