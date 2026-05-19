package edu.tlu.jobplatform.shared.security;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * Helper lấy thông tin user đang đăng nhập từ SecurityContext.
 *
 * Cách dùng trong UseCase:
 * 
 * <pre>
 * UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
 * </pre>
 *
 * Cách dùng trong Controller (ưu tiên hơn):
 * 
 * <pre>
 *   public ResponseEntity<?> myProfile({@literal @}CurrentUserId UUID userId) { ... }
 * </pre>
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /** Authentication hiện tại */
    public static Optional<Authentication> getAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return Optional.of(auth);
    }

    /**
     * UserId của user đang đăng nhập.
     * JwtAuthFilter set principal = userId (UUID string).
     */
    public static Optional<UUID> getCurrentUserId() {
        return getAuthentication().map(auth -> {
            try {
                return UUID.fromString(auth.getName());
            } catch (IllegalArgumentException e) {
                return null;
            }
        });
    }

    /**
     * Lấy userId hoặc throw nếu chưa đăng nhập.
     * Dùng trong endpoint bắt buộc xác thực.
     */
    public static UUID getCurrentUserIdOrThrow() {
        return getCurrentUserId().orElseThrow(
                () -> new BusinessRuleException("Vui lòng đăng nhập để tiếp tục.", "UNAUTHORIZED"));
    }

    /** Kiểm tra có role cụ thể không */
    public static boolean hasRole(String role) {
        return getAuthentication()
                .map(auth -> auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals(role)))
                .orElse(false);
    }

    public static boolean isAdmin() {
        return hasRole("ROLE_ADMIN") || hasRole("ROLE_SUPER_ADMIN");
    }

    public static boolean isEmployer() {
        return hasRole("ROLE_EMPLOYER");
    }

    public static boolean isCandidate() {
        return hasRole("ROLE_CANDIDATE");
    }

    /** Kiểm tra user hiện tại có phải chủ của resource không */
    public static boolean isOwner(UUID ownerId) {
        return getCurrentUserId().map(id -> id.equals(ownerId)).orElse(false);
    }

    /** Cho phép nếu là owner HOẶC admin */
    public static boolean isOwnerOrAdmin(UUID ownerId) {
        return isAdmin() || isOwner(ownerId);
    }
}
