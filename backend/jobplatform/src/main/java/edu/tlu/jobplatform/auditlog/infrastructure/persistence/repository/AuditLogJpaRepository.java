package edu.tlu.jobplatform.auditlog.infrastructure.persistence.repository;

import edu.tlu.jobplatform.auditlog.infrastructure.persistence.entity.AuditLogJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogJpaRepository extends JpaRepository<AuditLogJpaEntity, Long> {

        // ── By actor ─────────────────────────────────────────────────────

        @Query("""
                        SELECT a FROM AuditLogJpaEntity a
                        WHERE a.actorId = :actorId
                          AND (:action       IS NULL OR a.action       = :action)
                          AND (:resourceType IS NULL OR a.resourceType = :resourceType)
                          AND (:from         IS NULL OR a.occurredAt  >= :from)
                          AND (:to           IS NULL OR a.occurredAt  <= :to)
                        ORDER BY a.occurredAt DESC
                        """)
        Page<AuditLogJpaEntity> findByActorId(
                        @Param("actorId") String actorId,
                        @Param("action") String action,
                        @Param("resourceType") String resourceType,
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to,
                        Pageable pageable);

        // ── By resource ───────────────────────────────────────────────────

        Page<AuditLogJpaEntity> findByResourceTypeAndResourceIdOrderByOccurredAtDesc(
                        String resourceType, String resourceId, Pageable pageable);

        // ── System-wide ───────────────────────────────────────────────────

        @Query("""
                        SELECT a FROM AuditLogJpaEntity a
                        WHERE (:actorId       IS NULL OR a.actorId       = :actorId)
                          AND (:action        IS NULL OR a.action        = :action)
                          AND (:resourceType  IS NULL OR a.resourceType  = :resourceType)
                          AND (:result        IS NULL OR a.result        = :result)
                          AND (:from          IS NULL OR a.occurredAt   >= :from)
                          AND (:to            IS NULL OR a.occurredAt   <= :to)
                        ORDER BY a.occurredAt DESC
                        """)
        Page<AuditLogJpaEntity> findAllFiltered(
                        @Param("actorId") String actorId,
                        @Param("action") String action,
                        @Param("resourceType") String resourceType,
                        @Param("result") String result,
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to,
                        Pageable pageable);

        // ── Stats ─────────────────────────────────────────────────────────

        @Query("""
                        SELECT a.action, COUNT(a)
                        FROM AuditLogJpaEntity a
                        WHERE a.occurredAt BETWEEN :from AND :to
                        GROUP BY a.action
                        ORDER BY COUNT(a) DESC
                        """)
        List<Object[]> countGroupByAction(
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to);

        // ── Brute-force detection ─────────────────────────────────────────

        long countByActionAndActorIdAndResultAndOccurredAtAfter(
                        String action, String actorId, String result, LocalDateTime after);
}