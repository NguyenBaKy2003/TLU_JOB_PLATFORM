package edu.tlu.jobplatform.auth.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/** Request body cho POST /api/auth/reset-password */
@Data
@Schema(description = "Đặt lại mật khẩu mới")
public class ResetPasswordRequest {

    @Schema(description = "UUID của user — lấy từ query param ?userId= trong link email", example = "550e8400-e29b-41d4-a716-446655440000")
    @NotNull(message = "userId không được để trống")
    private UUID userId;

    @Schema(description = "Reset token — lấy từ query param ?token= trong link email", example = "a3bb189e-8bf9-3888-9912-ace4e6543002")
    @NotBlank(message = "Token không được để trống")
    private String token;

    @Schema(description = "Mật khẩu mới. Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số", example = "NewPassword123", minLength = 8, maxLength = 100)
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, max = 100, message = "Mật khẩu từ 8 đến 100 ký tự")
    private String newPassword;
}