package edu.tlu.jobplatform.user.presentation;

import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.user.application.usecase.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller: Cài đặt tài khoản.
 *
 * Authentication: tất cả endpoint yêu cầu JWT.
 * UserId được lấy từ SecurityContext (principal = userId string từ
 * JwtAuthFilter).
 *
 * Base path: /api/v1/settings
 */
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Settings", description = "Cài đặt tài khoản cá nhân")
public class SettingsController {

    private final UpdateNameUseCase updateNameUseCase;
    private final RequestEmailChangeUseCase requestEmailChangeUseCase;
    private final ConfirmEmailChangeUseCase confirmEmailChangeUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final UpdateNotificationPreferencesUseCase updateNotificationUseCase;
    private final DeleteAccountUseCase deleteAccountUseCase;
    private final JwtTokenProvider jwtTokenProvider;

    // ── PATCH /api/v1/settings/name ───────────────────────────────────────────

    @Operation(summary = "Cập nhật họ và tên")
    @PatchMapping("/name")
    public ResponseEntity<ApiResponse<Void>> updateName(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateNameRequest req) {

        updateNameUseCase.execute(
                new UpdateNameUseCase.Command(UUID.fromString(userId), req.getFullName()));

        return ResponseEntity.ok(ApiResponse.success("Họ và tên đã được cập nhật."));
    }

    // ── POST /api/v1/settings/email/change-request ───────────────────────────

    @Operation(summary = "Yêu cầu đổi email — gửi link xác nhận đến email mới", description = """
            Gửi link xác nhận đến email mới (TTL 15 phút).
            User phải click link trong email mới để hoàn tất đổi email.

            **Lưu ý:** Link xác nhận gửi đến email MỚI, không phải email cũ.
            """)
    @PostMapping("/email/change-request")
    public ResponseEntity<ApiResponse<Void>> requestEmailChange(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody RequestEmailChangeRequest req) {

        requestEmailChangeUseCase.execute(
                new RequestEmailChangeUseCase.Command(UUID.fromString(userId), req.getNewEmail()));

        return ResponseEntity.ok(ApiResponse.success(
                "Link xác nhận đã được gửi đến " + req.getNewEmail() + ". Vui lòng kiểm tra hộp thư."));
    }

    // ── GET /api/v1/settings/email/confirm ───────────────────────────────────

    @Operation(summary = "Xác nhận đổi email bằng token từ link email", description = """
            Endpoint này được gọi khi user click link trong email xác nhận.

            Frontend nhận token + userId từ URL:
            `/settings/confirm-email?token={token}&userId={userId}`
            → gọi endpoint này để hoàn tất đổi email.

            **Sau khi thành công:** Tất cả session bị revoke, cần đăng nhập lại.
            """)
    @PostMapping("/email/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmEmailChange(
            @RequestParam UUID userId,
            @RequestParam String token) {

        confirmEmailChangeUseCase.execute(
                new ConfirmEmailChangeUseCase.Command(userId, token));

        return ResponseEntity.ok(ApiResponse.success(
                "Email đã được cập nhật thành công. Vui lòng đăng nhập lại."));
    }

    // ── PATCH /api/v1/settings/password ──────────────────────────────────────

    @Operation(summary = "Đổi mật khẩu khi đã đăng nhập", description = """
            Yêu cầu nhập mật khẩu hiện tại để xác minh danh tính.

            **Mật khẩu mới yêu cầu:** ≥8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số.

            **Sau khi đổi:** Tất cả session trên các thiết bị khác bị revoke.
            Session hiện tại vẫn giữ nguyên.
            """)
    @PatchMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal String userId,
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ChangePasswordRequest req) {

        // Validate confirmPassword khớp với newPassword
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new BusinessRuleException("Mật khẩu xác nhận không khớp.", "PASSWORD_MISMATCH");
        }

        // Lấy tokenId từ JWT để giữ session hiện tại sau khi đổi mật khẩu
        String accessToken = extractToken(authHeader);
        String currentTokenId = jwtTokenProvider.extractTokenId(accessToken);

        changePasswordUseCase.execute(new ChangePasswordUseCase.Command(
                UUID.fromString(userId),
                req.getCurrentPassword(),
                req.getNewPassword(),
                currentTokenId));

        return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được đổi thành công."));
    }

    // ── PATCH /api/v1/settings/notifications ─────────────────────────────────

    @Operation(summary = "Cập nhật cài đặt thông báo")
    @PatchMapping("/notifications")
    public ResponseEntity<ApiResponse<Void>> updateNotifications(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateNotificationRequest req) {

        updateNotificationUseCase.execute(new UpdateNotificationPreferencesUseCase.Command(
                UUID.fromString(userId),
                req.isNewJobs(),
                req.isApplications(),
                req.isMessages()));

        return ResponseEntity.ok(ApiResponse.success("Cài đặt thông báo đã được lưu."));
    }

    // ── DELETE /api/v1/settings/account ──────────────────────────────────────

    @Operation(summary = "Xóa tài khoản", description = """
            Soft delete tài khoản. Hành động **không thể hoàn tác**.

            Tất cả session bị revoke ngay lập tức.
            Data sẽ bị xóa hoàn toàn sau 30 ngày (GDPR compliance).
            """)
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal String userId) {

        deleteAccountUseCase.execute(new DeleteAccountUseCase.Command(UUID.fromString(userId)));

        return ResponseEntity.ok(ApiResponse.success(
                "Tài khoản đã được xóa. Chúng tôi rất tiếc khi bạn rời đi."));
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private String extractToken(String authHeader) {
        return authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
    }

    // ── Inner DTOs ────────────────────────────────────────────────────────────

    @Getter
    static class UpdateNameRequest {
        @NotBlank(message = "Họ và tên không được để trống.")
        @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự.")
        private String fullName;
    }

    @Getter
    static class RequestEmailChangeRequest {
        @NotBlank(message = "Email mới không được để trống.")
        @Email(message = "Email không đúng định dạng.")
        private String newEmail;
    }

    @Getter
    static class ChangePasswordRequest {
        @NotBlank(message = "Mật khẩu hiện tại không được để trống.")
        private String currentPassword;

        @NotBlank(message = "Mật khẩu mới không được để trống.")
        @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự.")
        private String newPassword;

        @NotBlank(message = "Vui lòng xác nhận mật khẩu mới.")
        private String confirmPassword;
    }

    @Getter
    static class UpdateNotificationRequest {
        private boolean newJobs;
        private boolean applications;
        private boolean messages;
    }
}