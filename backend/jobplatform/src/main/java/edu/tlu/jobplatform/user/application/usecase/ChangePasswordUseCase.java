package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Đổi mật khẩu khi đã đăng nhập (settings page).
 *
 * Khác với ResetPasswordUseCase (quên mật khẩu):
 * - UseCase này yêu cầu nhập mật khẩu HIỆN TẠI để xác thực
 * - Không cần token email
 * - User đã đăng nhập (có JWT)
 *
 * Flow:
 * 1. Xác minh mật khẩu hiện tại
 * 2. Validate mật khẩu mới
 * 3. Đổi mật khẩu
 * 4. Revoke tất cả session khác (giữ session hiện tại)
 * 5. Gửi email thông báo
 *
 * Business Rules:
 * BR-01: OAuth2-only account không thể đổi mật khẩu (không có passwordHash)
 * BR-02: Mật khẩu hiện tại phải đúng
 * BR-03: Mật khẩu mới phải đủ mạnh (≥8 ký tự, hoa, thường, số)
 * BR-04: Mật khẩu mới không được trùng mật khẩu cũ
 * BR-05: Revoke tất cả session KHÁC (giữ session hiện tại — UX tốt hơn)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChangePasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenStorePort tokenStore;
    private final EmailPort emailPort;

    @Transactional
    public void execute(Command cmd) {
        var user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> ResourceNotFoundException.user(cmd.userId()));

        // BR-01: OAuth2-only không có password
        if (user.isOAuth2Only()) {
            throw new BusinessRuleException(
                    "Tài khoản đăng nhập bằng mạng xã hội không có mật khẩu để đổi.",
                    "OAUTH2_ACCOUNT");
        }

        // BR-02: Xác minh mật khẩu hiện tại
        if (!passwordEncoder.matches(cmd.currentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException(
                    "Mật khẩu hiện tại không đúng.", "WRONG_CURRENT_PASSWORD");
        }

        // BR-03: Validate mật khẩu mới
        validatePassword(cmd.newPassword());

        // BR-04: Mật khẩu mới không được trùng mật khẩu cũ
        if (passwordEncoder.matches(cmd.newPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException(
                    "Mật khẩu mới không được trùng với mật khẩu hiện tại.", "SAME_PASSWORD");
        }

        user.changePassword(passwordEncoder.encode(cmd.newPassword()));
        userRepository.save(user);

        // BR-05: Revoke toàn bộ session khác (trừ session hiện tại)
        // Xóa tất cả rồi save lại currentTokenId → giữ session hiện tại
        tokenStore.deleteAllExcept(cmd.userId(), cmd.currentTokenId());

        emailPort.sendPasswordChangedNotification(user.getEmail(), user.getFullName());

        log.info("Password changed for userId={}", cmd.userId());
    }

    // ── Dùng lại rule giống RegisterUseCase / ResetPasswordUseCase ─

    private void validatePassword(String pw) {
        if (pw == null || pw.length() < 8)
            throw new BusinessRuleException("Mật khẩu phải có ít nhất 8 ký tự.", "WEAK_PASSWORD");
        if (!pw.matches(".*[A-Z].*"))
            throw new BusinessRuleException("Mật khẩu phải có ít nhất 1 chữ hoa.", "WEAK_PASSWORD");
        if (!pw.matches(".*[a-z].*"))
            throw new BusinessRuleException("Mật khẩu phải có ít nhất 1 chữ thường.", "WEAK_PASSWORD");
        if (!pw.matches(".*\\d.*"))
            throw new BusinessRuleException("Mật khẩu phải có ít nhất 1 chữ số.", "WEAK_PASSWORD");
    }

    /**
     * @param userId          user đang thực hiện
     * @param currentPassword mật khẩu hiện tại để xác minh
     * @param newPassword     mật khẩu mới
     * @param currentTokenId  tokenId của session hiện tại (lấy từ JWT claim "tid")
     *                        → revoke tất cả session khác, giữ session này
     */
    public record Command(UUID userId, String currentPassword, String newPassword, String currentTokenId) {
    }
}