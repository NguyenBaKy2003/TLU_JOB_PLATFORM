package edu.tlu.jobplatform.message.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.domain.repository.MessageRepository;
import edu.tlu.jobplatform.message.infrastructure.persistence.mapper.MessageMapper;
import edu.tlu.jobplatform.message.infrastructure.persistence.repository.MessageJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class MessageRepositoryAdapter implements MessageRepository {

    private final MessageJpaRepository jpa;
    private final MessageMapper mapper;

    @Override
    public Message save(Message message) {
        return mapper.toDomain(jpa.save(mapper.toEntity(message)));
    }

    @Override
    public Optional<Message> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Message> findByConversationId(UUID conversationId, int page, int size) {
        return jpa.findByConversationIdOrderByCreatedAtAsc(
                conversationId, PageRequest.of(page, size))
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public int markAllReadInConversation(UUID conversationId, UUID readerId) {
        return jpa.markAllReadInConversation(conversationId, readerId);
    }
}