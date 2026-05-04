package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.application.port.out.EmailChangeTokenPort;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * UseCase: Bước 1 — Yêu cầu đổi email.
 *
 * Flow:
 * 1. Validate email mới (format + chưa tồn tại trong hệ thống)
 * 2. Tạo token → lưu Redis (TTL 15 phút)
 * 3. Gửi link xác nhận đến email mới
 *
 * Business Rules:
 * BR-01: Email mới phải khác email hiện tại
 * BR-02: Email mới chưa được đăng ký bởi tài khoản khác
 * BR-03: OAuth2-only account không thể đổi email (chưa có local credential)
 * BR-04: Token cũ bị ghi đè nếu user request nhiều lần
 *
 * Security:
 * ► Link xác nhận gửi đến email MỚI (không phải email cũ).
 * ► Token UUID opaque, TTL 15 phút.
 * ► 1 user chỉ có 1 pending request tại 1 thời điểm.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RequestEmailChangeUseCase {

    private final UserRepository userRepository;
    private final EmailChangeTokenPort emailChangeTokenPort;
    private final EmailPort emailPort;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void execute(Command cmd) {
        var user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> ResourceNotFoundException.user(cmd.userId()));

        String newEmail = cmd.newEmail().toLowerCase().trim();

        // BR-01: Phải khác email hiện tại
        if (newEmail.equals(user.getEmail())) {
            throw new BusinessRuleException(
                    "Email mới phải khác email hiện tại.", "SAME_EMAIL");
        }

        // BR-02: Email mới chưa tồn tại
        if (userRepository.existsByEmail(newEmail)) {
            throw new BusinessRuleException(
                    "Email này đã được sử dụng bởi tài khoản khác.", "EMAIL_ALREADY_EXISTS");
        }

        // BR-03: OAuth2-only không thể đổi email
        if (user.isOAuth2Only()) {
            throw new BusinessRuleException(
                    "Tài khoản đăng nhập bằng mạng xã hội không thể đổi email tại đây.",
                    "OAUTH2_ACCOUNT");
        }

        // BR-04: Tạo token, ghi đè request cũ
        String token = UUID.randomUUID().toString();
        emailChangeTokenPort.save(user.getId(), newEmail, token);

        String confirmLink = buildConfirmLink(user.getId(), token, user.getRole().name());
        emailPort.sendEmailChangeConfirmation(user.getEmail(), user.getFullName(), newEmail, confirmLink);

        log.info("Email change requested: userId={}, newEmail={}", user.getId(), newEmail);
    }

    private String buildConfirmLink(UUID userId, String token, String role) {
        return frontendUrl
                + "/settings/confirm-email"
                + "?token=" + token
                + "&userId=" + userId
                + "&role=" + role.toLowerCase(); // "candidate" | "employer" | "admin"
    }

    public record Command(UUID userId, String newEmail) {
    }
}