package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.OtpStorePort;
import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

/**
 * UseCase: Xác thực email bằng OTP.
 *
 * Sau khi verify thành công → trả về AuthToken luôn.
 * Frontend nhận token → lưu vào storage → chuyển thẳng vào /home.
 * Không cần quay lại trang login.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VerifyEmailUseCase {

    private static final String PURPOSE = "verify-email";
    private static final Duration REFRESH_TTL = Duration.ofDays(30);

    private final UserRepository userRepository;
    private final OtpStorePort otpStore;
    private final TokenStorePort tokenStore;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthToken execute(Command cmd) {
        String email = cmd.email().toLowerCase().trim();

        // BR-01: User phải tồn tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException(
                        "Email không tồn tại trong hệ thống.", "USER_NOT_FOUND"));

        // Đã verified rồi → cấp token luôn (idempotent)
        if (!user.isVerified()) {

            // BR-02: OTP phải còn hiệu lực
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

            log.info("Email verified: {}", email);
        }

        // Cấp token → frontend đăng nhập luôn
        String tokenId = UUID.randomUUID().toString();
        String accessToken = jwtTokenProvider.generateAccessToken(user, tokenId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user, tokenId);

        tokenStore.save(user.getId(), tokenId, refreshToken, REFRESH_TTL);
        user.recordLogin();
        userRepository.save(user);

        log.info("Auto-login after verify: userId={}", user.getId());

        return AuthToken.of(
                accessToken, refreshToken,
                jwtTokenProvider.getAccessTokenExpirySeconds(),
                toUserSummary(user));
    }

    private AuthToken.UserSummary toUserSummary(User u) {
        return AuthToken.UserSummary.builder()
                .id(u.getId()).email(u.getEmail())
                .fullName(u.getFullName()).role(u.getRole().name())
                .avatarUrl(u.getAvatarUrl()).verified(u.isVerified())
                .build();
    }

    public record Command(String email, String code) {
    }
}