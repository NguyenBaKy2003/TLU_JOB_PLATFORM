package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.OtpStorePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResendOtpUseCase {

    private static final String PURPOSE = "verify-email";
    private static final int OTP_TTL_MINUTES = 10;

    private final UserRepository userRepository;
    private final OtpStorePort otpStore;
    private final EmailPort emailPort;

    public void execute(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessRuleException(
                        "Email không tồn tại trong hệ thống.", "USER_NOT_FOUND"));

        if (user.isVerified()) {
            throw new BusinessRuleException(
                    "Tài khoản này đã được xác thực.", "ALREADY_VERIFIED");
        }

        String otp = generateOtp();
        otpStore.save(PURPOSE, normalizedEmail, otp, Duration.ofMinutes(OTP_TTL_MINUTES));

        emailPort.sendOtpEmail(normalizedEmail, otp);

        log.info("OTP resent to: {}", normalizedEmail);
    }

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(1_000_000));
    }
}