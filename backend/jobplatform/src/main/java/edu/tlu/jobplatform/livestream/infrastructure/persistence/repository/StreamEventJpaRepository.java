package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.StreamEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StreamEventJpaRepository extends JpaRepository<StreamEventJpaEntity, UUID> {

    List<StreamEventJpaEntity> findBySessionIdOrderByOccurredAtAsc(UUID sessionId);
}
