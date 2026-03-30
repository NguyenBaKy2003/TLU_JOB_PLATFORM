package edu.tlu.jobplatform.ratelimit.presentation.annotation;

import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy.Scope;

import java.lang.annotation.*;

/**
 * Đặt trên method của @RestController để áp dụng rate limit.
 *
 * Ví dụ:
 * {@code @RateLimit(policy = "send-message", scope = USER)}
 * {@code @RateLimit(policy = "register-otp", scope = IP)}
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {

    /** Tên policy — phải khớp key trong rate-limit.policies.* */
    String policy();

    /** Phạm vi key: IP (anonymous) hoặc USER (authenticated) */
    Scope scope() default Scope.IP;
}