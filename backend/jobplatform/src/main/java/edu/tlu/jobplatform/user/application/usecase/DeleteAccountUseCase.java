package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Xóa tài khoản (soft delete).
 *
 * Flow:
 * 1. Verify user tồn tại
 * 2. Soft delete: deactivate() — không xóa data khỏi DB
 * 3. Revoke tất cả session
 * 4. Gửi email xác nhận đã xóa
 *
 * Business Rules:
 * BR-01: Admin account không thể tự xóa (tránh lock out hệ thống)
 * BR-02: Soft delete — giữ data để audit, có thể khôi phục
 * BR-03: Revoke toàn bộ session ngay lập tức
 *
 * Lưu ý: hard delete data (GDPR) nên xử lý bằng async job sau 30 ngày.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteAccountUseCase {

    private final UserRepository userRepository;
    private final TokenStorePort tokenStore;
    private final EmailPort emailPort;

    @Transactional
    public void execute(Command cmd) {
        var user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> ResourceNotFoundException.user(cmd.userId()));

        // BR-01: Admin không thể tự xóa tài khoản
        if (user.isAdmin()) {
            throw new BusinessRuleException(
                    "Tài khoản Admin không thể tự xóa. Liên hệ Super Admin.",
                    "ADMIN_CANNOT_DELETE_SELF");
        }

        // BR-02: Soft delete
        user.deactivate();
        userRepository.save(user);

        // BR-03: Revoke tất cả session
        tokenStore.deleteAll(cmd.userId());

        emailPort.sendAccountDeletedNotification(user.getEmail(), user.getFullName());

        log.info("Account deleted (soft): userId={}, email={}", cmd.userId(), user.getEmail());
    }

    public record Command(UUID userId) {
    }
}