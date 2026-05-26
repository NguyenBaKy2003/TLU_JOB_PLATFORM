// edu/tlu/jobplatform/admin/application/usecase/AdminCreateUserUseCase.java
package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.service.ProfileCreationService;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCreateUserUseCase {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final ProfileCreationService profileCreationService;

    public record Command(
            String email,
            String fullName,
            String password,
            UserRole role) {
    }

    @Transactional
    public User execute(Command cmd) {
        // Guard: SUPER_ADMIN không được tạo qua API
        if (cmd.role() == UserRole.SUPER_ADMIN)
            throw new BusinessRuleException(
                    "Không thể tạo tài khoản SUPER_ADMIN qua API.", "FORBIDDEN");

        // Guard: email đã tồn tại
        if (userRepo.existsByEmail(cmd.email()))
            throw new BusinessRuleException(
                    "Email đã được sử dụng: " + cmd.email(), "EMAIL_TAKEN");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(cmd.email().toLowerCase().trim())
                .fullName(cmd.fullName().trim())
                .passwordHash(passwordEncoder.encode(cmd.password()))
                .role(cmd.role())
                .verified(true)
                .active(true)
                .authProvider("local")
                .failedLoginAttempts(0)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepo.save(user);
        log.info("Admin created user: id={} email={} role={}", saved.getId(), saved.getEmail(), saved.getRole());

        // Tạo profile + gán Free plan tương ứng với role
        profileCreationService.createProfileForUser(saved);

        return saved;
    }
}