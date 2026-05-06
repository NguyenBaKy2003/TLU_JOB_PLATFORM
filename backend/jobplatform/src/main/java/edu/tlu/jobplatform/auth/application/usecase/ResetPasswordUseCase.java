package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.PasswordResetTokenPort;
import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Bước 2 — Đặt lại mật khẩu mới bằng reset token.
 *
 * Flow:
 * 1. Tìm user theo userId
 * 2. Lấy reset token từ Redis, kiểm tra khớp và còn hạn
 * 3. Validate mật khẩu mới (cùng rule với đăng ký)
 * 4. Kiểm tra mật khẩu mới ≠ mật khẩu cũ
 * 5. Hash và lưu mật khẩu mới
 * 6. Xóa reset token (link chỉ dùng được 1 lần)
 * 7. Revoke tất cả JWT session (bảo mật: session cũ không dùng được)
 * 8. Gửi email thông báo đổi mật khẩu thành công
 *
 * Business Rules:
 * BR-01: userId không tồn tại → TOKEN_INVALID (không báo rõ lý do)
 * BR-02: Token Redis không tồn tại / hết hạn (15p) → TOKEN_EXPIRED
 * BR-03: Token trong request ≠ token trong Redis → TOKEN_INVALID
 * BR-04: Mật khẩu mới phải đủ mạnh (≥8 ký tự, hoa, thường, số)
 * BR-05: Mật khẩu mới không được trùng mật khẩu cũ
 * BR-06: Sau khi đổi → xóa token + revoke toàn bộ JWT session
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResetPasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenPort resetTokenPort;
    private final PasswordEncoder passwordEncoder;
    private final TokenStorePort tokenStore;
    private final EmailPort emailPort;

    @Transactional
    public void execute(Command cmd) {

        // BR-01: Tìm user (dùng message chung, không tiết lộ lý do cụ thể)
        User user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
                        "TOKEN_INVALID"));

        // BR-02 + BR-03: Lấy token từ Redis và so sánh
        String storedToken = resetTokenPort.find(cmd.userId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Liên kết đặt lại mật khẩu đã hết hạn (15 phút). Vui lòng gửi lại yêu cầu.",
                        "TOKEN_EXPIRED"));

        if (!storedToken.equals(cmd.token())) {
            log.warn("Reset password: token mismatch for userId={}", cmd.userId());
            throw new BusinessRuleException(
                    "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
                    "TOKEN_INVALID");
        }

        // BR-04: Validate độ mạnh mật khẩu mới
        validatePassword(cmd.newPassword());

        // BR-05: Mật khẩu mới không được trùng mật khẩu cũ
        if (user.getPasswordHash() != null
                && passwordEncoder.matches(cmd.newPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException(
                    "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
                    "SAME_PASSWORD");
        }

        // Đổi mật khẩu
        user.changePassword(passwordEncoder.encode(cmd.newPassword()));
        userRepository.save(user);

        // BR-06a: Xóa reset token (link dùng 1 lần)
        resetTokenPort.delete(cmd.userId());

        // BR-06b: Revoke tất cả JWT session — buộc đăng nhập lại trên mọi thiết bị
        tokenStore.deleteAll(cmd.userId());

        // Gửi email thông báo
        emailPort.sendPasswordChangedNotification(user.getEmail(), user.getFullName());

        log.info("Password reset successfully for userId={}", cmd.userId());
    }

    // ── Business Rule validation ──

    private void validatePassword(String pw) {
        if (pw == null || pw.length() < 8)
            throw new BusinessRuleException(
                    "Mật khẩu phải có ít nhất 8 ký tự.", "WEAK_PASSWORD");
        if (!pw.matches(".*[A-Z].*"))
            throw new BusinessRuleException(
                    "Mật khẩu phải có ít nhất 1 chữ hoa.", "WEAK_PASSWORD");
        if (!pw.matches(".*[a-z].*"))
            throw new BusinessRuleException(
                    "Mật khẩu phải có ít nhất 1 chữ thường.", "WEAK_PASSWORD");
        if (!pw.matches(".*\\d.*"))
            throw new BusinessRuleException(
                    "Mật khẩu phải có ít nhất 1 chữ số.", "WEAK_PASSWORD");
    }

    // ── Command ─

    /**
     * @param userId      UUID của user (từ query param link email)
     * @param token       Reset token UUID (từ query param link email)
     * @param newPassword Mật khẩu mới người dùng nhập
     */
    public record Command(UUID userId, String token, String newPassword) {
    }
}
