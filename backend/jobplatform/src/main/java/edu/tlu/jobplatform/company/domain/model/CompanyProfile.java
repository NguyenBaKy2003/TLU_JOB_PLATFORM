
package edu.tlu.jobplatform.company.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate Root của Company domain.
 *
 * Đây là "hồ sơ công ty" — chứa toàn bộ thông tin nhà tuyển dụng.
 * Pure Java, không có @Entity, không phụ thuộc Spring/JPA.
 *
 * Vòng đời xác thực (verification):
 * UNVERIFIED → (admin duyệt) → VERIFIED → có thể đăng tin
 * UNVERIFIED → (admin từ chối) → REJECTED
 * VERIFIED → (admin khoá) → SUSPENDED
 */
@Getter
@Builder
public class CompanyProfile {

    private final UUID id;
    private final UUID ownerId; // FK → User.id (EMPLOYER)

    // ── Thông tin cơ bản ──
    private String name;
    private String slug; // url-friendly, unique
    private String description;
    private String website;
    private String email;
    private String phone;

    // ── Địa chỉ
    private String address;
    private String city;
    private String country;

    // ── Phân loại ─
    private String industry; // Lĩnh vực (IT, Finance...)
    private CompanySize size; // Quy mô nhân sự
    private Integer foundedYear;

    // ── Media ──
    private String logoUrl;
    private String coverImageUrl;

    // ── Trạng thái xác thực
    private VerificationStatus verificationStatus;
    private String rejectionReason; // lý do từ chối (nếu có)
    private LocalDateTime verifiedAt;
    private UUID verifiedBy; // adminId

    // ── Metadata ──
    private boolean active;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Rules ─

    /** Công ty được phép đăng tin tuyển dụng */
    public boolean canPostJobs() {
        return active && verificationStatus == VerificationStatus.VERIFIED;
    }

    /** Công ty đã được xác thực */
    public boolean isVerified() {
        return verificationStatus == VerificationStatus.VERIFIED;
    }

    /** Công ty đang bị đình chỉ */

    public boolean isSuspended() {
        return verificationStatus == VerificationStatus.SUSPENDED;
    }

    /** Admin duyệt xác thực công ty */
    public void verify(UUID adminId) {
        this.verificationStatus = VerificationStatus.VERIFIED;
        this.verifiedAt = LocalDateTime.now();
        this.verifiedBy = adminId;
        this.rejectionReason = null;
    }

    /** Admin từ chối xác thực */
    public void reject(String reason) {
        this.verificationStatus = VerificationStatus.REJECTED;
        this.rejectionReason = reason;
        this.verifiedAt = null;
        this.verifiedBy = null;
    }

    /** Admin tạm khoá công ty */
    public void suspend() {
        this.verificationStatus = VerificationStatus.SUSPENDED;
    }

    /** Cập nhật thông tin cơ bản */
    public void updateInfo(String name, String description, String website,
            String email, String phone, String address,
            String city, String country, String industry,
            CompanySize size, Integer foundedYear) {
        this.name = name;
        this.description = description;
        this.website = website;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.country = country;
        this.industry = industry;
        this.size = size;
        this.foundedYear = foundedYear;
        this.updatedAt = LocalDateTime.now();
    }

    /** Cập nhật logo/cover */
    public void updateMedia(String logoUrl, String coverImageUrl) {
        if (logoUrl != null)
            this.logoUrl = logoUrl;
        if (coverImageUrl != null)
            this.coverImageUrl = coverImageUrl;
        this.updatedAt = LocalDateTime.now();
    }

    /** Soft delete */
    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }
}