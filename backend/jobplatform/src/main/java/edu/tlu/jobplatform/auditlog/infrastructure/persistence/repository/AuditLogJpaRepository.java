package edu.tlu.jobplatform.auditlog.infrastructure.persistence.repository;

import edu.tlu.jobplatform.auditlog.infrastructure.persistence.entity.AuditLogJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogJpaRepository
                extends JpaRepository<AuditLogJpaEntity, Long>,
                JpaSpecificationExecutor<AuditLogJpaEntity> {

        Page<AuditLogJpaEntity> findByResourceTypeAndResourceIdOrderByOccurredAtDesc(
                        String resourceType, String resourceId, Pageable pageable);

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

        long countByActionAndActorIdAndResultAndOccurredAtAfter(
                        String action, String actorId, String result, LocalDateTime after);
}