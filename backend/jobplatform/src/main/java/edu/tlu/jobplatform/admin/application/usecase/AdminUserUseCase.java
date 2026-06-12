package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.cache.UserCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.tlu.jobplatform.shared.service.ProfileCreationService;
import java.util.UUID;

/**
 * Admin quản lý users:
 * - Xem danh sách / tìm kiếm
 * - Khoá / mở khoá tài khoản
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserUseCase {

    private final UserRepository userRepo;
    private final UserCacheService userCacheService;
    private final ProfileCreationService profileCreationService;

    @Transactional(readOnly = true)
    public Page<User> listUsers(String keyword, UserRole role, Boolean active, Pageable pageable) {
        return userRepo.searchUsers(
                (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                role,
                active,
                pageable);
    }

    @Transactional(readOnly = true)
    public User getUser(UUID userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }

    /** Khoá / mở khoá tài khoản */
    @Transactional
    public User toggleActive(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (user.getRole() == UserRole.ADMIN)
            throw new BusinessRuleException(
                    "Không thể khoá tài khoản ADMIN.", "FORBIDDEN");

        if (user.isActive())
            user.deactivate();
        else
            user.activate();

        User saved = userRepo.save(user);
        userCacheService.evict(userId);
        log.info("User {} → active={}", userId, saved.isActive());
        return saved;
    }

    /** Đổi role */
    @Transactional
    public User changeRole(UUID userId, UserRole newRole) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (user.getRole() == UserRole.ADMIN)
            throw new BusinessRuleException(
                    "Không thể thay đổi role của ADMIN.", "FORBIDDEN");

        if (newRole == UserRole.ADMIN)
            throw new BusinessRuleException(
                    "Không thể gán role ADMIN qua API.", "FORBIDDEN");

        UserRole oldRole = user.getRole();

        user.changeRole(newRole);
        User saved = userRepo.save(user);
        userCacheService.evict(userId);

        // ← Xóa profile cũ
        profileCreationService.removeProfileForRole(userId, oldRole);

        // ← Tạo profile mới nếu chưa có
        profileCreationService.ensureProfileExists(saved);

        log.info("User {} role changed {} → {} — old profile removed, new profile ensured",
                userId, oldRole, newRole);

        return saved;
    }

}
