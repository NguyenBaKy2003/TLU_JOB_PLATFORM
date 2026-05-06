package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.cache.UserCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Cập nhật thông tin cá nhân của user.
 *
 * Business Rules:
 * BR-01: Chỉ chính user hoặc ADMIN mới được cập nhật
 * BR-02: Không được đổi email (cần flow riêng có xác thực)
 * BR-03: Không được tự thay đổi role của mình
 * BR-04: Sau khi update → invalidate cache
 *
 * Các field được phép cập nhật:
 * fullName, phone, avatarUrl
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateUserUseCase {

    private final UserRepository userRepository;
    private final UserCacheService userCacheService;

    @Transactional
    public User execute(UUID targetUserId, Command cmd) {

        // BR-01: Chỉ owner hoặc admin mới được cập nhật
        if (!SecurityUtils.isOwnerOrAdmin(targetUserId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền cập nhật thông tin người dùng này.",
                    "FORBIDDEN");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> ResourceNotFoundException.user(targetUserId));

        // Áp dụng thay đổi — chỉ update field không null
        if (cmd.fullName() != null && !cmd.fullName().isBlank()) {
            validateFullName(cmd.fullName());
            user.updateFullName(cmd.fullName().trim());
        }
        if (cmd.avatarUrl() != null) {
            user.updateAvatarUrl(cmd.avatarUrl().isBlank() ? null : cmd.avatarUrl().trim());
        }

        User saved = userRepository.save(user);

        // BR-04: Invalidate cache sau khi update
        userCacheService.evict(targetUserId);

        log.info("User updated: {} by actor={}", targetUserId,
                SecurityUtils.getCurrentUserId().map(UUID::toString).orElse("system"));

        return saved;
    }

    // ── Validation helpers ─

    private void validateFullName(String fullName) {
        if (fullName.length() < 2 || fullName.length() > 100) {
            throw new BusinessRuleException(
                    "Họ tên phải từ 2 đến 100 ký tự.", "INVALID_FULL_NAME");
        }
    }

    // ── Command record

    /**
     * Tất cả field đều nullable — null nghĩa là "không thay đổi" (PATCH semantics).
     * Chỉ field được truyền giá trị mới sẽ được cập nhật.
     */
    public record Command(
            String fullName,
            String phone,
            String avatarUrl) {
    }
}