package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Admin quản lý users:
 * - Xem danh sách / tìm kiếm
 * - Khoá / mở khoá tài khoản
 * - Đổi role (không được hạ cấp SUPER_ADMIN)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserUseCase {

    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public Page<User> listUsers(String keyword, UserRole role, Pageable pageable) {
        if (keyword != null && !keyword.isBlank())
            return userRepo.searchByKeyword(keyword, pageable);
        if (role != null)
            return userRepo.findByRole(role, pageable);
        return userRepo.findAll(pageable);
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

        if (user.getRole() == UserRole.SUPER_ADMIN)
            throw new BusinessRuleException(
                    "Không thể khoá tài khoản SUPER_ADMIN.", "FORBIDDEN");

        if (user.isActive())
            user.deactivate();
        else
            user.activate();

        log.info("User {} → active={}", userId, user.isActive());
        return userRepo.save(user);
    }

    /** Đổi role */
    @Transactional
    public User changeRole(UUID userId, UserRole newRole) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (user.getRole() == UserRole.SUPER_ADMIN)
            throw new BusinessRuleException(
                    "Không thể thay đổi role của SUPER_ADMIN.", "FORBIDDEN");

        if (newRole == UserRole.SUPER_ADMIN)
            throw new BusinessRuleException(
                    "Không thể gán role SUPER_ADMIN qua API.", "FORBIDDEN");

        user.changeRole(newRole);
        log.info("User {} role changed to {}", userId, newRole);
        return userRepo.save(user);
    }

}
