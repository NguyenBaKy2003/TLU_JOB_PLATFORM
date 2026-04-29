package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.StreamAnalyticsJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StreamAnalyticsJpaRepository extends JpaRepository<StreamAnalyticsJpaEntity, UUID> {

    Optional<StreamAnalyticsJpaEntity> findBySessionId(UUID sessionId);

    boolean existsBySessionId(UUID sessionId);
}