package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.repository.*;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper.LiveStreamMapper;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

// ─── StreamAnalytics Adapter ──────────────────────────────────
@Component
@RequiredArgsConstructor
public class StreamAnalyticsRepositoryAdapter implements StreamAnalyticsRepository {

    private final StreamAnalyticsJpaRepository jpaRepository;
    private final LiveStreamMapper mapper;

    @Override
    public StreamAnalytics save(StreamAnalytics analytics) {
        var saved = jpaRepository.save(mapper.toJpa(analytics));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<StreamAnalytics> findBySessionId(UUID sessionId) {
        return jpaRepository.findBySessionId(sessionId).map(mapper::toDomain);
    }

    @Override
    public boolean existsBySessionId(UUID sessionId) {
        return jpaRepository.existsBySessionId(sessionId);
    }
}