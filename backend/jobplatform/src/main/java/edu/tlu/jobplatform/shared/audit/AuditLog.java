package edu.tlu.jobplatform.shared.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity lưu lịch sử mọi hành động quan trọng trong hệ thống.
 *
 * Bảng audit_logs được partition theo quý để query hiệu quả.
 * Record > 1 năm được archive định kỳ bởi scheduled job.
 *
 * Tự động ghi bởi @AuditAspect khi method có @Loggable.
 * Không gọi trực tiếp trong business code.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID của user thực hiện. NULL = system action (scheduler...) */
    @Column(name = "actor_id")
    private String actorId;

    /** Tên hành động: USER_LOGIN, JOB_PUBLISHED, APPLICATION_SUBMITTED... */
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    /** Loại entity bị tác động: User, JobPost, Application... */
    @Column(name = "resource_type", length = 50)
    private String resourceType;

    /** ID của entity bị tác động */
    @Column(name = "resource_id", length = 36)
    private String resourceId;

    /** JSON snapshot trước khi thay đổi */
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    /** JSON snapshot sau khi thay đổi */
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    /** IP của client */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /** Liên kết với request log */
    @Column(name = "trace_id", length = 36)
    private String traceId;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    /** SUCCESS | FAILURE */
    @Column(name = "result", length = 20)
    private String result;

    @Column(name = "error_message", length = 500)
    private String errorMessage;
}
