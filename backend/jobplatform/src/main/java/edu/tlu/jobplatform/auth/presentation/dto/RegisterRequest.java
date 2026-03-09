package edu.tlu.jobplatform.auth.presentation.dto;

import edu.tlu.jobplatform.user.domain.model.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/** Request body cho POST /api/auth/register */
@Data
@Schema(description = "Thông tin đăng ký tài khoản mới")
public class RegisterRequest {

    @Schema(example = "nguyenvana@example.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 255)
    private String email;

    @Schema(example = "Password123",
            description = "Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 số")
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 100, message = "Mật khẩu từ 8 đến 100 ký tự")
    private String password;

    @Schema(example = "Nguyễn Văn A")
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên từ 2 đến 100 ký tự")
    private String fullName;

    @Schema(example = "CANDIDATE", description = "CANDIDATE (mặc định) | EMPLOYER")
    private UserRole role;  // null → RegisterUseCase default là CANDIDATE
}
