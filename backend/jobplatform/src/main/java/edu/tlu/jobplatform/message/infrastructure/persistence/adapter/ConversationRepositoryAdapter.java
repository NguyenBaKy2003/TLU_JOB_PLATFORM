package edu.tlu.jobplatform.message.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.infrastructure.persistence.entity.ConversationJpaEntity;
import edu.tlu.jobplatform.message.infrastructure.persistence.mapper.MessageMapper;
import edu.tlu.jobplatform.message.infrastructure.persistence.repository.ConversationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ConversationRepositoryAdapter implements ConversationRepository {

    private final ConversationJpaRepository jpa;
    private final MessageMapper mapper;

    @Override
    public Conversation save(Conversation conversation) {
        ConversationJpaEntity entity = mapper.toEntity(conversation);
        // Preserve id nếu là update
        if (conversation.getId() != null) {
            entity = jpa.findById(conversation.getId())
                    .map(existing -> {
                        existing.setStatus(conversation.getStatus());
                        existing.setLastMessagePreview(conversation.getLastMessagePreview());
                        existing.setLastMessageAt(conversation.getLastMessageAt());
                        existing.setUnreadCountA(conversation.getUnreadCountA());
                        existing.setUnreadCountB(conversation.getUnreadCountB());
                        existing.setUpdatedAt(conversation.getUpdatedAt());
                        return existing;
                    })
                    .orElse(entity);
        }
        return mapper.toDomain(jpa.save(entity));
    }

    @Override
    public Optional<Conversation> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Conversation> findByParticipantsAndJobPost(UUID a, UUID b, UUID jobPostId) {
        return jpa.findByParticipantsAndJobPost(a, b, jobPostId).map(mapper::toDomain);
    }

    @Override
    public List<Conversation> findByParticipant(UUID userId, int page, int size) {
        return jpa.findByParticipant(userId, PageRequest.of(page, size))
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public int countUnreadByParticipant(UUID userId) {
        return jpa.countUnreadByParticipant(userId);
    }
}