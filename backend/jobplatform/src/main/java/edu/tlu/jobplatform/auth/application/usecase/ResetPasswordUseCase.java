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

        User user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
                        "TOKEN_INVALID"));

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

        validatePassword(cmd.newPassword());

        if (user.getPasswordHash() != null
                && passwordEncoder.matches(cmd.newPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException(
                    "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
                    "SAME_PASSWORD");
        }

        user.changePassword(passwordEncoder.encode(cmd.newPassword()));
        userRepository.save(user);

        resetTokenPort.delete(cmd.userId());

        tokenStore.deleteAll(cmd.userId());

        emailPort.sendPasswordChangedNotification(user.getEmail(), user.getFullName());

        log.info("Password reset successfully for userId={}", cmd.userId());
    }

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

    public record Command(UUID userId, String token, String newPassword) {
    }
}
