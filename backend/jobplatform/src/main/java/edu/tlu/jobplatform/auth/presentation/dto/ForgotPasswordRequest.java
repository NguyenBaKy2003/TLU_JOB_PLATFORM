package edu.tlu.jobplatform.auth.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Request body cho POST /api/auth/forgot-password */
@Data
@Schema(description = "Yêu cầu đặt lại mật khẩu")
public class ForgotPasswordRequest {

    @Schema(description = "Email đã đăng ký tài khoản", example = "nguyenvana@example.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
}