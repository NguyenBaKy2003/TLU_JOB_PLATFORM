package edu.tlu.jobplatform.auditlog.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.domain.repository.AuditLogRepository;
import edu.tlu.jobplatform.auditlog.infrastructure.persistence.entity.AuditLogJpaEntity;
import edu.tlu.jobplatform.auditlog.infrastructure.persistence.repository.AuditLogJpaRepository;
import edu.tlu.jobplatform.auditlog.infrastructure.persistence.repository.AuditLogSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuditLogRepositoryAdapter implements AuditLogRepository {

    private final AuditLogJpaRepository jpa;

    // ── Write ─────────────────────────────────────────────────────────

    @Override
    public void save(AuditLog log) {
        jpa.save(toEntity(log));
    }

    // ── Read — by actor ───────────────────────────────────────────────

    @Override
    public Page<AuditLog> findByActorId(String actorId, String action,
                                         String resourceType,
                                         LocalDateTime from, LocalDateTime to,
                                         Pageable pageable) {
        return jpa.findAll(
                AuditLogSpec.filter(actorId, action, resourceType, null, null, from, to),
                pageable
        ).map(this::toDomain);
    }

    // ── Read — by resource ────────────────────────────────────────────

    @Override
    public Page<AuditLog> findByResource(String resourceType, String resourceId,
                                          Pageable pageable) {
        return jpa.findByResourceTypeAndResourceIdOrderByOccurredAtDesc(
                resourceType, resourceId, pageable
        ).map(this::toDomain);
    }

    // ── Read — system wide ────────────────────────────────────────────

    @Override
    public Page<AuditLog> findAll(String actorId, String action,
                                   String resourceType, String result,
                                   LocalDateTime from, LocalDateTime to,
                                   Pageable pageable) {
        return jpa.findAll(
                AuditLogSpec.filter(actorId, action, resourceType, null, result, from, to),
                pageable
        ).map(this::toDomain);
    }

    // ── Stats ─────────────────────────────────────────────────────────

    @Override
    public Map<String, Long> countByAction(LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = jpa.countGroupByAction(from, to);
        Map<String, Long> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            result.put((String) row[0], (Long) row[1]);
        }
        return result;
    }

    // ── Brute-force detection ─────────────────────────────────────────

    @Override
    public long countFailures(String actorId, String action, LocalDateTime after) {
        return jpa.countByActionAndActorIdAndResultAndOccurredAtAfter(
                action, actorId, "FAILURE", after);
    }

    // ── Mappers ───────────────────────────────────────────────────────

    private AuditLogJpaEntity toEntity(AuditLog d) {
        return AuditLogJpaEntity.builder()
                .id(d.getId())
                .actorId(d.getActorId())
                .action(d.getAction())
                .resourceType(d.getResourceType())
                .resourceId(d.getResourceId())
                .oldValue(d.getOldValue())
                .newValue(d.getNewValue())
                .ipAddress(d.getIpAddress())
                .userAgent(d.getUserAgent())
                .traceId(d.getTraceId())
                .occurredAt(d.getOccurredAt())
                .result(d.getResult())
                .errorMessage(d.getErrorMessage())
                .build();
    }

    private AuditLog toDomain(AuditLogJpaEntity e) {
        return AuditLog.builder()
                .id(e.getId())
                .actorId(e.getActorId())
                .action(e.getAction())
                .resourceType(e.getResourceType())
                .resourceId(e.getResourceId())
                .oldValue(e.getOldValue())
                .newValue(e.getNewValue())
                .ipAddress(e.getIpAddress())
                .userAgent(e.getUserAgent())
                .traceId(e.getTraceId())
                .occurredAt(e.getOccurredAt())
                .result(e.getResult())
                .errorMessage(e.getErrorMessage())
                .build();
    }
}