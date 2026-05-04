package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.application.port.out.EmailChangeTokenPort;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Bước 2 — Xác nhận đổi email bằng token từ link email.
 *
 * Flow:
 * 1. Tìm pending request trong Redis theo userId
 * 2. So sánh token
 * 3. Cập nhật email trong DB
 * 4. Xóa token (link 1 lần dùng)
 * 5. Revoke tất cả session (buộc đăng nhập lại với email mới)
 * 6. Gửi thông báo đến email cũ
 *
 * Business Rules:
 * BR-01: Token không tồn tại / hết hạn → TOKEN_EXPIRED
 * BR-02: Token không khớp → TOKEN_INVALID
 * BR-03: Email mới bị đăng ký bởi người khác trong lúc chờ →
 * EMAIL_ALREADY_EXISTS
 * BR-04: Sau khi đổi → revoke toàn bộ session, buộc đăng nhập lại
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfirmEmailChangeUseCase {

    private final UserRepository userRepository;
    private final EmailChangeTokenPort emailChangeTokenPort;
    private final TokenStorePort tokenStore;
    private final EmailPort emailPort;

    @Transactional
    public void execute(Command cmd) {
        var user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> ResourceNotFoundException.user(cmd.userId()));

        // BR-01: Tìm pending request
        var pending = emailChangeTokenPort.find(cmd.userId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Liên kết xác nhận đã hết hạn (15 phút). Vui lòng gửi lại yêu cầu.",
                        "TOKEN_EXPIRED"));

        // BR-02: Kiểm tra token khớp
        if (!pending.token().equals(cmd.token())) {
            log.warn("Email change: token mismatch for userId={}", cmd.userId());
            throw new BusinessRuleException(
                    "Liên kết xác nhận không hợp lệ.", "TOKEN_INVALID");
        }

        // BR-03: Double-check email mới chưa bị đăng ký bởi người khác
        if (userRepository.existsByEmail(pending.newEmail())) {
            emailChangeTokenPort.delete(cmd.userId());
            throw new BusinessRuleException(
                    "Email này đã được sử dụng bởi tài khoản khác.", "EMAIL_ALREADY_EXISTS");
        }

        String oldEmail = user.getEmail();
        user.updateEmail(pending.newEmail());
        userRepository.save(user);

        // BR-04: Xóa token + revoke tất cả session
        emailChangeTokenPort.delete(cmd.userId());
        tokenStore.deleteAll(cmd.userId());

        // Thông báo đến email cũ
        emailPort.sendEmailChangedNotification(oldEmail, user.getFullName(), pending.newEmail());

        log.info("Email changed: userId={}, oldEmail={}, newEmail={}", cmd.userId(), oldEmail, pending.newEmail());
    }

    public record Command(UUID userId, String token) {
    }
}