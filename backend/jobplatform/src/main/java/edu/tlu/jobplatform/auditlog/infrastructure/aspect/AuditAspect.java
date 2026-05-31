package edu.tlu.jobplatform.auditlog.infrastructure.aspect;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogWriter auditLogWriter;

    @Around("@annotation(loggable)")
    public Object audit(ProceedingJoinPoint pjp, Loggable loggable) throws Throwable {

        String actorId = resolveActorId();
        String ipAddress = resolveIpAddress();
        String userAgent = resolveUserAgent();
        String traceId = resolveTraceId();

        try {
            Object result = pjp.proceed();

            auditLogWriter.save(AuditLog.success(
                    actorId,
                    loggable.action(),
                    loggable.resourceType(),
                    null,
                    null,
                    ipAddress,
                    userAgent,
                    traceId));

            return result;

        } catch (Exception ex) {
            auditLogWriter.save(AuditLog.failure(
                    actorId,
                    loggable.action(),
                    loggable.resourceType(),
                    ipAddress,
                    userAgent,
                    traceId,
                    sanitizeErrorMessage(ex)));
            throw ex;
        }
    }

    // ── Resolvers ─────────────────────────────────────────────────────

    private String resolveActorId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getPrincipal().toString();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private String resolveIpAddress() {
        return currentRequest().map(req -> {
            String forwarded = req.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return req.getRemoteAddr();
        }).orElse(null);
    }

    private String resolveUserAgent() {
        return currentRequest()
                .map(req -> req.getHeader("User-Agent"))
                .orElse(null);
    }

    private String resolveTraceId() {
        String fromMdc = MDC.get("traceId");
        if (fromMdc != null && !fromMdc.isBlank())
            return fromMdc;

        return currentRequest()
                .map(req -> req.getHeader("X-Trace-Id"))
                .orElse(null);
    }

    private String sanitizeErrorMessage(Exception ex) {
        String msg = ex.getMessage();
        if (msg == null)
            return ex.getClass().getSimpleName();
        return msg.length() > 490 ? msg.substring(0, 490) + "…" : msg;
    }

    private Optional<HttpServletRequest> currentRequest() {
        return Optional.ofNullable(RequestContextHolder.getRequestAttributes())
                .filter(a -> a instanceof ServletRequestAttributes)
                .map(a -> ((ServletRequestAttributes) a).getRequest());
    }
}