package edu.tlu.jobplatform.auth.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Value Object đại diện cho cặp JWT token sau khi xác thực thành công.
 *
 * Đặc điểm Value Object:
 * - Immutable (tất cả field final)
 * - Không có ID riêng
 * - Không được lưu DB — chỉ tồn tại trong HTTP response
 *
 * Refresh token được lưu Redis thông qua TokenStorePort (infrastructure).
 */
@Getter
@Builder
public class AuthToken {

    /** JWT access token — gửi trong header: Authorization: Bearer {token} */
    private final String accessToken;

    /** Refresh token — dùng khi access token hết hạn để xin cái mới */
    private final String refreshToken;

    /** Luôn là "Bearer" theo chuẩn OAuth2 RFC 6750 */
    private final String tokenType;

    /** Số giây access token còn hiệu lực. Ví dụ: 900 = 15 phút */
    private final long expiresIn;

    /** Thông tin user tóm tắt — frontend không cần gọi thêm /api/me */
    private final UserSummary user;

    // ── Factory method

    public static AuthToken of(String accessToken, String refreshToken,
            long expiresIn, UserSummary user) {
        return AuthToken.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }

    // ── Nested Value Object

    /**
     * Thông tin tóm tắt của user — nhúng trong AuthToken response.
     * Frontend dùng để render tên, avatar, điều hướng theo role ngay sau login.
     */
    @Getter
    @Builder
    public static class UserSummary {
        private final UUID id;
        private final String email;
        private final String fullName;
        private final String role;
        private final String avatarUrl;
        private final boolean verified;
    }
}
