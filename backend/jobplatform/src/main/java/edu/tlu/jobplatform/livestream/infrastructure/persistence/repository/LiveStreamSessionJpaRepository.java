package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.LiveStreamSessionJpaEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiveStreamSessionJpaRepository extends JpaRepository<LiveStreamSessionJpaEntity, UUID> {

    List<LiveStreamSessionJpaEntity> findByCompanyId(UUID companyId);

    List<LiveStreamSessionJpaEntity> findByStatus(SessionStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM LiveStreamSessionJpaEntity s WHERE s.id = :id")
    Optional<LiveStreamSessionJpaEntity> findByIdForUpdate(@Param("id") UUID id);

    @Query("""
            SELECT s FROM LiveStreamSessionJpaEntity s
            WHERE s.status = 'SCHEDULED'
            AND s.scheduledAt >= :from
            AND s.scheduledAt <= :to
            ORDER BY s.scheduledAt ASC
            """)
    List<LiveStreamSessionJpaEntity> findUpcoming(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("""
            SELECT s FROM LiveStreamSessionJpaEntity s
            WHERE s.status = 'LIVE'
               OR (s.status = 'SCHEDULED'
                   AND s.scheduledAt >= :from
                   AND s.scheduledAt <= :to)
            ORDER BY
                CASE WHEN s.status = 'LIVE' THEN 0 ELSE 1 END,
                s.scheduledAt ASC
            """)
    List<LiveStreamSessionJpaEntity> findUpcomingAndLive(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("""
            SELECT s FROM LiveStreamSessionJpaEntity s
            WHERE s.status IN ('LIVE', 'SCHEDULED')
            AND s.scheduledAt < :cutoffTime
            """)
    List<LiveStreamSessionJpaEntity> findStaleSessions(
            @Param("cutoffTime") LocalDateTime cutoffTime);

    @Modifying
    @Query("""
            UPDATE LiveStreamSessionJpaEntity s
            SET s.viewerCount = :count
            WHERE s.id = :sessionId
            """)
    void updateViewerCount(@Param("sessionId") UUID sessionId,
            @Param("count") int count);
}