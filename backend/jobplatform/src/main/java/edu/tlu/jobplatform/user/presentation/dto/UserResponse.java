package edu.tlu.jobplatform.user.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.user.domain.model.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HTTP response DTO cho User.
 *
 * Tách biệt với domain User để:
 * - Tự do thêm/xóa field response mà không ảnh hưởng domain
 * - Không lộ passwordHash hay thông tin nhạy cảm ra API
 * - Thêm computed fields (displayName, initials...) chỉ cần thiết ở
 * presentation
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin người dùng")
public class UserResponse {

    @Schema(description = "ID user", example = "550e8400-e29b-41d4-a716-446655440000")
    private final UUID id;

    @Schema(description = "Email", example = "nguyenvana@example.com")
    private final String email;

    @Schema(description = "Họ và tên", example = "Nguyễn Văn A")
    private final String fullName;

    @Schema(description = "Ký tự viết tắt để hiển thị avatar placeholder", example = "NV")
    private final String initials;

    @Schema(description = "URL ảnh đại diện")
    private final String avatarUrl;

    @Schema(description = "Vai trò", example = "CANDIDATE")
    private final String role;

    @Schema(description = "Email đã xác thực chưa")
    private final boolean verified;

    @Schema(description = "Tài khoản đang hoạt động không")
    private final boolean active;

    @Schema(description = "Đăng nhập bằng OAuth2 (Google/LinkedIn), không có password")
    private final boolean oauth2Only;

    @Schema(description = "Thời điểm đăng nhập gần nhất")
    private final LocalDateTime lastLoginAt;

    @Schema(description = "Thời điểm tạo tài khoản")
    private final LocalDateTime createdAt;

    // ── Factory ───────────────────────────────────────────────────

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .initials(buildInitials(user.getFullName()))
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .verified(user.isVerified())
                .active(user.isActive())
                .oauth2Only(user.isOAuth2Only())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * Tạo chữ viết tắt từ họ tên để hiển thị avatar placeholder.
     * "Nguyễn Văn An" → "NA"
     * "John" → "J"
     */
    private static String buildInitials(String fullName) {
        if (fullName == null || fullName.isBlank())
            return "?";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1)
            return parts[0].substring(0, 1).toUpperCase();
        // Lấy chữ đầu của từ đầu tiên và từ cuối cùng
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1))
                .toUpperCase();
    }
}