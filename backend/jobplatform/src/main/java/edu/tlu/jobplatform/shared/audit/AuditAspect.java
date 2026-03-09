package edu.tlu.jobplatform.shared.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

/**
 * Tự động ghi audit log cho method có annotation @Loggable.
 *
 * Cách dùng:
 * 
 * <pre>
 *   {@literal @}Loggable(action = "JOB_PUBLISHED", resourceType = "JobPost")
 *   public JobPost publishJob(UUID jobId) { ... }
 * </pre>
 *
 * Aspect tự động:
 * 1. Lấy actor từ SecurityContext
 * 2. Gọi method gốc
 * 3. Ghi log SUCCESS hoặc FAILURE vào DB
 *
 * Lỗi audit không được làm hỏng business flow — dùng try-catch riêng.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Around("@annotation(loggable)")
    public Object audit(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {

        String actorId = SecurityUtils.getCurrentUserId()
                .map(Object::toString)
                .orElse("system");

        AuditLog auditLog = AuditLog.builder()
                .actorId(actorId)
                .action(loggable.action())
                .resourceType(loggable.resourceType())
                .traceId(MDC.get("traceId"))
                .ipAddress(getClientIp())
                .userAgent(getUserAgent())
                .occurredAt(LocalDateTime.now())
                .build();

        try {
            Object result = joinPoint.proceed();

            if (loggable.logResult() && result != null) {
                try {
                    auditLog.setNewValue(objectMapper.writeValueAsString(result));
                } catch (Exception ignored) {
                    // Không để lỗi serialize ảnh hưởng flow
                }
            }

            auditLog.setResult("SUCCESS");
            saveQuietly(auditLog);
            return result;

        } catch (Exception ex) {
            auditLog.setResult("FAILURE");
            auditLog.setErrorMessage(truncate(ex.getMessage(), 500));
            saveQuietly(auditLog);
            throw ex;
        }
    }

    private void saveQuietly(AuditLog auditLog) {
        try {
            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.error("Failed to save audit log: {}", ex.getMessage());
        }
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null)
                return null;
            HttpServletRequest req = attrs.getRequest();
            String xff = req.getHeader("X-Forwarded-For");
            return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null)
                return null;
            return truncate(attrs.getRequest().getHeader("User-Agent"), 500);
        } catch (Exception e) {
            return null;
        }
    }

    private String truncate(String s, int max) {
        if (s == null)
            return null;
        return s.length() > max ? s.substring(0, max) : s;
    }
}
