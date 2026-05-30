package edu.tlu.jobplatform.auditlog.domain.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    private Long id;

    /** UUID của user thực hiện. null = system action (scheduler...) */
    private String actorId;

    /** SCREAMING_SNAKE_CASE: USER_LOGIN, JOB_PUBLISHED, APPLICATION_SUBMITTED... */
    private String action;

    /** Loại entity bị tác động: User, JobPost, Application... */
    private String resourceType;

    /** ID của entity bị tác động */
    private String resourceId;

    /** JSON snapshot trước khi thay đổi — chỉ dùng nội bộ, không expose API */
    private String oldValue;

    /** JSON snapshot sau khi thay đổi — chỉ dùng nội bộ, không expose API */
    private String newValue;

    private String ipAddress;

    private String userAgent;

    /** Liên kết với distributed trace */
    private String traceId;

    private LocalDateTime occurredAt;

    /** SUCCESS | FAILURE */
    private String result;

    private String errorMessage;

    // ── Factory methods ──────────────────────────────────────────────

    public static AuditLog success(String actorId, String action,
            String resourceType, String resourceId,
            String newValue, String ipAddress,
            String userAgent, String traceId) {
        return AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .traceId(traceId)
                .occurredAt(LocalDateTime.now())
                .result("SUCCESS")
                .build();
    }

    public static AuditLog failure(String actorId, String action,
            String resourceType, String ipAddress,
            String userAgent, String traceId,
            String errorMessage) {
        return AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .resourceType(resourceType)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .traceId(traceId)
                .occurredAt(LocalDateTime.now())
                .result("FAILURE")
                .errorMessage(errorMessage)
                .build();
    }
}