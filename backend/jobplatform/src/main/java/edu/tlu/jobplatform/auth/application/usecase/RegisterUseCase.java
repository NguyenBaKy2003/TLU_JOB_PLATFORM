package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.OtpStorePort;
import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import edu.tlu.jobplatform.shared.email.EmailService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private static final String OTP_PURPOSE = "verify-email";
    private static final Duration OTP_TTL = Duration.ofMinutes(10);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpStorePort otpStore;
    private final EmailService emailService;

    @Transactional
    public Result execute(Command cmd) {

        if (userRepository.existsByEmail(cmd.email())) {
            throw new BusinessRuleException(
                    "Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.",
                    "EMAIL_ALREADY_EXISTS");
        }

        validatePassword(cmd.password());

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(cmd.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(cmd.password()))
                .fullName(cmd.fullName().trim())
                .role(cmd.role() != null ? cmd.role() : UserRole.CANDIDATE)
                .authProvider("local")
                .active(true)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);

        String otp = generateOtp();
        otpStore.save(OTP_PURPOSE, saved.getEmail(), otp, OTP_TTL);
        emailService.sendVerificationOtp(saved.getEmail(), saved.getFullName(), otp);

        log.info("User registered (pending verification): {} [{}]",
                saved.getEmail(), saved.getRole());

        return new Result(saved.getId(), saved.getEmail(), saved.getRole().name());
    }

    private String generateOtp() {
        int code = new SecureRandom().nextInt(900_000) + 100_000;
        return String.valueOf(code);
    }

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

    public record Command(String email, String password, String fullName, UserRole role) {
    }

    public record Result(UUID userId, String email, String role) {
    }
}