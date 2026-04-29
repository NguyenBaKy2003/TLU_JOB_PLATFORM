// livestream/infrastructure/persistence/adapter/ChatMessageStreamRepositoryAdapter.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream;
import edu.tlu.jobplatform.livestream.domain.repository.ChatMessageStreamRepository;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper.ChatMessageStreamMapper;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.repository.ChatMessageStreamJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ChatMessageStreamRepositoryAdapter implements ChatMessageStreamRepository {

    private final ChatMessageStreamJpaRepository jpaRepository;
    private final ChatMessageStreamMapper mapper;

    @Override
    public ChatMessageStream save(ChatMessageStream message) {
        return mapper.toDomain(
                jpaRepository.save(mapper.toEntity(message)));
    }

    @Override
    public List<ChatMessageStream> findRecentBySessionId(UUID sessionId, int limit) {
        return jpaRepository
                .findRecentBySessionId(sessionId, limit)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}