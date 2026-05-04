package edu.tlu.jobplatform.user.presentation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

// ── Request DTOs ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/settings/name
 */
@Getter
class UpdateNameRequest {
    @NotBlank(message = "Họ và tên không được để trống.")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự.")
    private String fullName;
}

/**
 * POST /api/v1/settings/email/change-request
 */
@Getter
class RequestEmailChangeRequest {
    @NotBlank(message = "Email mới không được để trống.")
    @Email(message = "Email không đúng định dạng.")
    private String newEmail;
}

/**
 * PATCH /api/v1/settings/password
 */
@Getter
class ChangePasswordRequest {
    @NotBlank(message = "Mật khẩu hiện tại không được để trống.")
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống.")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự.")
    private String newPassword;

    @NotBlank(message = "Vui lòng xác nhận mật khẩu mới.")
    private String confirmPassword;
}

/**
 * PATCH /api/v1/settings/notifications
 */
@Getter
class UpdateNotificationRequest {
    private boolean newJobs;
    private boolean applications;
    private boolean messages;
}