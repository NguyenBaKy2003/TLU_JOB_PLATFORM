package edu.tlu.jobplatform.company.domain.model;

/**
 * Trạng thái xác thực hồ sơ công ty.
 *
 * Flow:
 * UNVERIFIED → VERIFIED (admin approve)
 * UNVERIFIED → REJECTED (admin reject + lý do)
 * VERIFIED → SUSPENDED (admin khoá vi phạm)
 * REJECTED → UNVERIFIED (company nộp lại hồ sơ)
 */
public enum VerificationStatus {

    /** Chờ admin xem xét — mặc định khi mới tạo */
    UNVERIFIED,

    /** Đã được admin xác thực — có thể đăng tin */
    VERIFIED,

    /** Admin từ chối — cần sửa và nộp lại */
    REJECTED,

    /** Bị khoá tạm thời — vi phạm điều khoản */
    SUSPENDED
}