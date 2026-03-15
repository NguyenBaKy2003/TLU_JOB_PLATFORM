package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.OtpStorePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UseCase: Xác thực email bằng OTP sau khi đăng ký.
 *
 * Business Rules:
 * BR-01: Email phải tồn tại trong hệ thống
 * BR-02: OTP phải khớp và còn hiệu lực (chưa hết TTL trong Redis)
 * BR-03: Sau khi verify thành công → xóa OTP khỏi Redis (tránh reuse)
 * BR-04: Đánh dấu user.verified = true
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VerifyEmailUseCase {

    private static final String PURPOSE = "verify-email";

    private final UserRepository userRepository;
    private final OtpStorePort otpStore;

    @Transactional
    public void execute(Command cmd) {
        String email = cmd.email().toLowerCase().trim();

        // BR-01: User phải tồn tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException(
                        "Email không tồn tại trong hệ thống.", "USER_NOT_FOUND"));

        // Nếu đã verified rồi thì không cần làm gì
        if (user.isVerified()) {
            log.info("Email already verified: {}", email);
            return;
        }

        // BR-02: OTP phải tồn tại và còn hiệu lực
        String storedOtp = otpStore.find(PURPOSE, email)
                .orElseThrow(() -> new BusinessRuleException(
                        "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.",
                        "OTP_INVALID_OR_EXPIRED"));

        if (!storedOtp.equals(cmd.code())) {
            throw new BusinessRuleException(
                    "Mã OTP không chính xác. Vui lòng kiểm tra lại.",
                    "OTP_MISMATCH");
        }

        // BR-03: Xóa OTP sau khi dùng
        otpStore.delete(PURPOSE, email);

        // BR-04: Đánh dấu verified
        user.markVerified();
        userRepository.save(user);

        log.info("Email verified successfully: {}", email);
    }

    public record Command(String email, String code) {
    }
}