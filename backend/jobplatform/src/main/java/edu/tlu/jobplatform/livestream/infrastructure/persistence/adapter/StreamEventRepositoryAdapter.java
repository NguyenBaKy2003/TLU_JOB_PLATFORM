package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.repository.*;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper.LiveStreamMapper;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

//  StreamEvent Adapter ─
@Component
@RequiredArgsConstructor
public class StreamEventRepositoryAdapter implements StreamEventRepository {

    private final StreamEventJpaRepository jpaRepository;
    private final LiveStreamMapper mapper;

    @Override
    public StreamEvent save(StreamEvent event) {
        var saved = jpaRepository.save(mapper.toJpa(event));
        return mapper.toDomain(saved);
    }

    @Override
    public List<StreamEvent> findBySessionId(UUID sessionId) {
        return jpaRepository.findBySessionIdOrderByOccurredAtAsc(sessionId)
                .stream().map(mapper::toDomain).toList();
    }
}
