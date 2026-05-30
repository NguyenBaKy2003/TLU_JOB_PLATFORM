package edu.tlu.jobplatform.message.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.infrastructure.persistence.mapper.MessageMapper;
import edu.tlu.jobplatform.message.infrastructure.persistence.repository.ConversationJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ConversationRepositoryAdapter implements ConversationRepository {

    private final ConversationJpaRepository jpa;
    private final MessageMapper mapper;

    @Override
    public Conversation save(Conversation conversation) {
        return mapper.toDomain(jpa.save(mapper.toEntity(conversation)));
    }

    @Override
    public Optional<Conversation> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Conversation> findByParticipants(UUID a, UUID b) {
        log.debug("Finding conversation: participantA={}, participantB={}", a, b);
        Optional<Conversation> result = jpa.findByParticipants(a, b).map(mapper::toDomain);
        log.debug("Conversation found: {}", result.isPresent());
        return result;
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