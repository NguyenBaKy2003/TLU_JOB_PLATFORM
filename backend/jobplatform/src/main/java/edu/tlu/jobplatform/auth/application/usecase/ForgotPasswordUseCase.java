package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.PasswordResetTokenPort;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * UseCase: Bước 1 — Yêu cầu đặt lại mật khẩu (Forgot Password).
 *
 * Flow:
 * 1. Tìm user theo email
 * 2. Kiểm tra account hợp lệ (active, không phải OAuth2-only)
 * 3. Tạo reset token ngẫu nhiên (UUID) → lưu Redis (TTL 15 phút)
 * 4. Gửi email chứa link reset
 * 5. Trả về response thành công (dù email không tồn tại — tránh enumeration)
 *
 * Security considerations:
 * ► Response LUÔN trả về thành công dù email không tồn tại.
 * Kẻ tấn công không thể biết email nào đã đăng ký.
 *
 * ► Token là UUID ngẫu nhiên, không phải JWT.
 * Lý do: JWT chứa thông tin có thể đọc được, UUID hoàn toàn opaque.
 *
 * ► 1 user chỉ có 1 token tại 1 thời điểm.
 * Request mới ghi đè token cũ → link email cũ tự động vô hiệu.
 *
 * ► TTL 15 phút — đủ ngắn để giảm rủi ro nếu email bị chặn.
 *
 * Business Rules:
 * BR-01: Email không tồn tại → trả về thành công (không báo lỗi)
 * BR-02: OAuth2-only account → trả về thành công kèm gợi ý dùng Google
 * BR-03: Account bị khóa (inactive) → không gửi email, trả về thành công
 * BR-04: Mỗi request tạo token mới, ghi đè token cũ
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ForgotPasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenPort resetTokenPort;
    private final EmailPort emailPort;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Xử lý yêu cầu forgot password.
     * Luôn trả về thành công — không tiết lộ email có tồn tại hay không.
     */
    public void execute(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        // Tìm user — nếu không có thì dừng lặng lẽ (BR-01)
        userRepository.findByEmail(normalizedEmail).ifPresentOrElse(
                user -> processRequest(user),
                () -> log.debug("Forgot password: email not found [{}] — silent ignore", normalizedEmail));
    }

    // ── Private helpers ───────────────────────────────────────────

    private void processRequest(User user) {

        // BR-02: OAuth2-only — không có password để reset
        if (user.isOAuth2Only()) {
            log.debug("Forgot password: OAuth2-only account [{}] — sending hint email",
                    user.getEmail());
            // Gửi email gợi ý dùng Google/LinkedIn thay vì link reset
            // emailPort.sendOAuth2HintEmail(user.getEmail(), user.getFullName());
            // Sprint 4: implement email này. Sprint 1: ignore.
            return;
        }

        // BR-03: Account bị khóa — không gửi email (nhưng không báo lỗi)
        if (!user.isActive()) {
            log.debug("Forgot password: inactive account [{}] — silent ignore", user.getEmail());
            return;
        }

        // BR-04: Tạo token mới, ghi đè token cũ nếu có
        String resetToken = UUID.randomUUID().toString();
        resetTokenPort.save(user.getId(), resetToken);

        // Tạo link reset gửi về frontend
        // Frontend nhận token + userId → gọi POST /api/auth/reset-password
        String resetLink = buildResetLink(user.getId(), resetToken);

        emailPort.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);

        log.info("Password reset email sent to: {}", user.getEmail());
    }

    private String buildResetLink(java.util.UUID userId, String token) {
        return frontendUrl
                + "/reset-password"
                + "?token=" + token
                + "&userId=" + userId;
    }
}
