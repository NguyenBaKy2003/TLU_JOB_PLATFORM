package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.LiveStreamSessionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LiveStreamSessionJpaRepository extends JpaRepository<LiveStreamSessionJpaEntity, UUID> {

        List<LiveStreamSessionJpaEntity> findByCompanyId(UUID companyId);

        List<LiveStreamSessionJpaEntity> findByStatus(SessionStatus status);

        /**
         * Lấy phiên SCHEDULED trong khoảng thời gian (dùng cho backward compatibility)
         */
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

        /**
         * Lấy phiên LIVE + SCHEDULED trong khoảng thời gian cho Candidate
         * Sắp xếp: LIVE trước (CASE = 0), SCHEDULED sau (CASE = 1),
         * sau đó theo scheduledAt ASC
         */
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

        /**
         * Xóa phiên đã ENDED quá thời hạn (cleanup job)
         */
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