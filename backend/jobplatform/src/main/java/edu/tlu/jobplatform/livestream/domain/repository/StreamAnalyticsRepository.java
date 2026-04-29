package edu.tlu.jobplatform.livestream.domain.repository;

import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;

import java.util.Optional;
import java.util.UUID;

public interface StreamAnalyticsRepository {
    StreamAnalytics save(StreamAnalytics analytics);

    Optional<StreamAnalytics> findBySessionId(UUID sessionId);

    boolean existsBySessionId(UUID sessionId);
}
