package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Đăng ký tài khoản mới.
 *
 * Flow:
 * 1. Validate email unique (BR-01)
 * 2. Validate password đủ mạnh (BR-02)
 * 3. Hash password, tạo User (verified=true) (Sprint 1 tạm thời)
 * 4. Lưu DB
 * 5. Trả về userId + email + role
 *
 * TODO Sprint 4: đổi verified=false, thêm OTP email flow.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Result execute(Command cmd) {

        // BR-01: Email unique
        if (userRepository.existsByEmail(cmd.email())) {
            throw new BusinessRuleException(
                    "Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.",
                    "EMAIL_ALREADY_EXISTS");
        }

        // BR-02: Password đủ mạnh
        validatePassword(cmd.password());

        // Tạo User
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(cmd.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(cmd.password()))
                .fullName(cmd.fullName().trim())
                .role(cmd.role() != null ? cmd.role() : UserRole.CANDIDATE)
                .active(true)
                .verified(true) // TODO Sprint 4: false + gửi OTP
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        log.info("User registered: {} [{}]", saved.getEmail(), saved.getRole());

        return new Result(saved.getId(), saved.getEmail(), saved.getRole().name());
    }

    // ── Business rule ─────────────────────────────────────────────

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

    // ── Command / Result records ──────────────────────────────────

    /**
     * Input — immutable, parse từ HTTP request bởi AuthController.
     * role = null → default CANDIDATE.
     */
    public record Command(String email, String password, String fullName, UserRole role) {
    }

    /** Output — không trả token vì Sprint 4 sẽ cần verify email trước. */
    public record Result(UUID userId, String email, String role) {
    }
}
