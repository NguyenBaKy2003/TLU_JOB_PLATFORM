package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.StreamAnalyticsJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface StreamAnalyticsJpaRepository extends JpaRepository<StreamAnalyticsJpaEntity, UUID> {

    Optional<StreamAnalyticsJpaEntity> findBySessionId(UUID sessionId);

    boolean existsBySessionId(UUID sessionId);

    @Modifying
    @Query("""
            UPDATE StreamAnalyticsJpaEntity a
            SET a.totalViewerCount = a.totalViewerCount + 1
            WHERE a.sessionId = :sessionId
            """)
    void incrementTotalViewers(@Param("sessionId") UUID sessionId);
}