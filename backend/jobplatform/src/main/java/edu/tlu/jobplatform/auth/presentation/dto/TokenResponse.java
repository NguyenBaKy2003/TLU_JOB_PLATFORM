package edu.tlu.jobplatform.auth.presentation.dto;

import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * HTTP response DTO cho login / refresh token endpoints.
 *
 * Map từ domain AuthToken → JSON response.
 * Tách DTO riêng để domain model không phụ thuộc Jackson annotations.
 */
@Getter
@Builder
@Schema(description = "Token response sau khi đăng nhập hoặc refresh thành công")
public class TokenResponse {

    @Schema(description = "JWT access token (15 phút)", example = "eyJhbGciOiJIUzI1NiJ9...")
    private final String accessToken;

    @Schema(description = "Refresh token (30 ngày) — dùng để lấy access token mới")
    private final String refreshToken;

    @Schema(description = "Loại token", example = "Bearer")
    private final String tokenType;

    @Schema(description = "Số giây access token còn hiệu lực", example = "900")
    private final long expiresIn;

    @Schema(description = "Thông tin user đã đăng nhập")
    private final UserInfo user;

    // ── Factory ─

    public static TokenResponse from(AuthToken token) {
        AuthToken.UserSummary u = token.getUser();
        return TokenResponse.builder()
                .accessToken(token.getAccessToken())
                .refreshToken(token.getRefreshToken())
                .tokenType(token.getTokenType())
                .expiresIn(token.getExpiresIn())
                .user(UserInfo.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .role(u.getRole())
                        .avatarUrl(u.getAvatarUrl())
                        .verified(u.isVerified())
                        .build())
                .build();
    }

    // ── Inner DTO ──

    @Getter
    @Builder
    @Schema(description = "Thông tin cơ bản của user đã đăng nhập")
    public static class UserInfo {
        private final UUID id;
        private final String email;
        private final String fullName;
        private final String role;
        private final String avatarUrl;
        private final boolean verified;
    }
}
