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
    private String phone;
    private String avatarUrl;
    private UserRole role;
    private boolean active;
    private boolean verified;
    private LocalDateTime lastLoginAt;
    private final LocalDateTime createdAt;

    // ── Business Rules ────────────────────────────────────────────

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
     * Cập nhật số điện thoại.
     */
    public void updatePhone(String phone) {
        this.phone = phone;
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
        return passwordHash == null || passwordHash.isBlank();
    }

    /**
     * Ghi nhận đăng nhập thành công.
     */
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
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
}