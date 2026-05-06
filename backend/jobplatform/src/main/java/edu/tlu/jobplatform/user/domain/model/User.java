package edu.tlu.jobplatform.user.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain model của User — Pure Java, không có annotation Spring hay JPA.
 *
 * Đây là "trái tim" của domain: chứa business state và business rules.
 * Không biết database tồn tại, không biết HTTP tồn tại.
 *
 * Khác với UserJpaEntity (infrastructure layer):
 * - UserJpaEntity: có @Entity, @Column → gắn với DB
 * - User (domain): pure Java object → dễ test, dễ hiểu
 */
@Getter
@Builder
public class User {

    private final UUID id;
    private String email;
    private String passwordHash;
    private String fullName;
    private String avatarUrl;
    private UserRole role;
    private boolean active;
    private boolean verified;
    private String authProvider;
    private String authProviderId;
    private LocalDateTime lastLoginAt;
    private int failedLoginAttempts;
    private LocalDateTime lockedUntil;
    private final LocalDateTime createdAt;

    // ── Business Rules

    /**
     * Kiểm tra user có thể đăng nhập không.
     * Phải đồng thời: active + verified.
     */
    public boolean canLogin() {
        return active && verified;
    }

    /**
     * Cập nhật họ tên.
     */
    public void updateFullName(String fullName) {
        this.fullName = fullName;
    }

    /**
     * Cập nhật avatar.
     */
    public void updateAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    /**
     * Kiểm tra user có phải OAuth2-only không (chưa set password).
     */
    public boolean isOAuth2Only() {
        return "google".equalsIgnoreCase(authProvider)
                || "facebook".equalsIgnoreCase(authProvider)
                || "linkedin".equalsIgnoreCase(authProvider);
    }

    /**
     * Reset counter sau khi login thành công.
     */
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    /**
     * Kiểm tra tài khoản có đang bị tạm khóa không.
     * Tự gỡ ban nếu đã qua 30 phút.
     */
    public boolean isTemporarilyLocked() {
        if (lockedUntil == null)
            return false;
        if (LocalDateTime.now().isAfter(lockedUntil)) {
            // Tự gỡ ban
            this.lockedUntil = null;
            this.failedLoginAttempts = 0;
            return false;
        }
        return true;
    }

    public void changeRole(UserRole newRole) {
        this.role = newRole;
    }

    /**
     * Còn bao nhiêu phút bị khóa (để trả về client).
     */
    public long minutesUntilUnlock() {
        if (lockedUntil == null)
            return 0;
        return java.time.Duration.between(LocalDateTime.now(), lockedUntil).toMinutes() + 1;
    }

    /**
     * Xác thực email thành công.
     */
    public void markVerified() {
        this.verified = true;
    }

    /**
     * Soft deactivate tài khoản.
     */
    public void deactivate() {
        this.active = false;
    }

    // ── Activate ──
    public void activate() {
        this.active = true;
    }

    // ── Failed login tracking ──

    /**
     * Ghi nhận login thất bại.
     * Sau 5 lần → lock 30 phút.
     */
    public void recordFailedLogin() {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
        }
    }

    /**
     * Cập nhật password hash sau khi reset.
     */
    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    /**
     * Kiểm tra có phải admin không.
     */
    public boolean isAdmin() {
        return role == UserRole.ADMIN || role == UserRole.SUPER_ADMIN;
    }

    /**
     * Kiểm tra có phải employer không.
     */
    public boolean isEmployer() {
        return role == UserRole.EMPLOYER;
    }

    /**
     * Kiểm tra có phải candidate không.
     */
    public boolean isCandidate() {
        return role == UserRole.CANDIDATE;
    }

    // User.java — thêm 2 method
    public void linkOAuth2Provider(String provider, String providerId) {
        if (this.authProvider == null || "local".equalsIgnoreCase(this.authProvider)) {
            this.authProvider = provider;
            this.authProviderId = providerId;
        }
    }

    public void syncOAuth2Profile(String avatarUrl) {
        if (this.avatarUrl == null && avatarUrl != null) {
            this.avatarUrl = avatarUrl;
        }
    }

    /** Cập nhật email sau khi xác nhận token. */
    public void updateEmail(String newEmail) {
        this.email = newEmail;
    }
}