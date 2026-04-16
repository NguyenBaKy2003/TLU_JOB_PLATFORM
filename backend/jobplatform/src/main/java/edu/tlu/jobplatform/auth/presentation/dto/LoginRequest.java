package edu.tlu.jobplatform.auth.presentation.dto;

import javax.validation.constraints.Pattern;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Request body cho POST /api/auth/login */
@Data
@Schema(description = "Thông tin đăng nhập")
public class LoginRequest {

    @Schema(example = "nguyenvana@example.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @Schema(example = "Password123")
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    /**
     * Portal đang đăng nhập vào.
     * CANDIDATE | EMPLOYER | ADMIN
     * null = không validate (mobile app, Swagger testing...)
     */
    @Schema(example = "CANDIDATE", allowableValues = { "CANDIDATE", "EMPLOYER", "ADMIN" })
    @Pattern(regexp = "CANDIDATE|EMPLOYER|ADMIN", message = "portalType phải là CANDIDATE, EMPLOYER hoặc ADMIN")
    private String portalType;
}