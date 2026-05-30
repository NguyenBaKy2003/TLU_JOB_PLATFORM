package edu.tlu.jobplatform.auditlog.presentation.dto;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;

import java.time.LocalDateTime;

/**
 * oldValue / newValue KHÔNG expose ra ngoài API —
 * chỉ admin xem qua internal DB tool khi điều tra.
 */
public record AuditLogResponse(
        Long id,
        String actorId,
        String action,
        String resourceType,
        String resourceId,
        String result,
        String errorMessage,
        String ipAddress,
        String traceId,
        LocalDateTime occurredAt) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorId(),
                log.getAction(),
                log.getResourceType(),
                log.getResourceId(),
                log.getResult(),
                log.getErrorMessage(),
                log.getIpAddress(),
                log.getTraceId(),
                log.getOccurredAt());
    }
}