package edu.tlu.jobplatform.shared.security;

import java.lang.annotation.*;

/**
 * Inject UUID của user đang đăng nhập vào controller parameter.
 *
 * Dùng thay cho SecurityUtils.getCurrentUserIdOrThrow() trong controller:
 * 
 * <pre>
 *   public ResponseEntity<?> getProfile(@CurrentUser UUID userId) { ... }
 * </pre>
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {
}