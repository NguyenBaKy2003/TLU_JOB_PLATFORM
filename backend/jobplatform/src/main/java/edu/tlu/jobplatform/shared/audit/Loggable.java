package edu.tlu.jobplatform.shared.audit;

import java.lang.annotation.*;

/**
 * Đánh dấu method cần ghi audit log tự động.
 *
 * AuditAspect sẽ intercept method này và ghi log vào bảng audit_logs.
 *
 * Cách dùng:
 * 
 * <pre>
 *   // Chỉ log action
 *   {@literal @}Loggable(action = "USER_BANNED", resourceType = "User")
 *   public void banUser(UUID userId) { ... }
 *
 *   // Log cả kết quả trả về vào new_value
 *   {@literal @}Loggable(action = "JOB_PUBLISHED", resourceType = "JobPost", logResult = true)
 *   public JobPost publishJob(UUID jobId) { ... }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Loggable {

    /** Tên hành động. Dùng SCREAMING_SNAKE_CASE: "JOB_PUBLISHED", "USER_BANNED" */
    String action();

    /** Loại entity bị tác động: "JobPost", "User", "Application"... */
    String resourceType() default "";

    /** Có ghi kết quả trả về vào cột new_value không */
    boolean logResult() default false;
}
