package edu.tlu.jobplatform.user.domain.model;

/**
 * Vai trò của user trong hệ thống.
 *
 * Spring Security sẽ prefix "ROLE_" khi check hasRole(),
 * nhưng ở domain layer chỉ dùng enum thuần.
 */
public enum UserRole {
    CANDIDATE, // Ứng viên tìm việc
    EMPLOYER, // Nhà tuyển dụng đăng bài
    ADMIN; // Quản trị viên

    /** Trả về tên đầy đủ cho Spring Security */
    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}
