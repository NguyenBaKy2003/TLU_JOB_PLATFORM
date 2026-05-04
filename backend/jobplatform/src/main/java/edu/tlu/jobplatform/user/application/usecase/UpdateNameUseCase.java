package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Cập nhật họ và tên.
 *
 * Business Rules:
 * BR-01: Tên không được rỗng hoặc vượt quá 100 ký tự
 * BR-02: User phải tồn tại và đang active
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateNameUseCase {

    private static final int MAX_NAME_LENGTH = 100;

    private final UserRepository userRepository;

    @Transactional
    public void execute(Command cmd) {
        // BR-01: Validate
        if (cmd.fullName() == null || cmd.fullName().isBlank()) {
            throw new BusinessRuleException("Họ và tên không được để trống.", "NAME_BLANK");
        }
        String trimmed = cmd.fullName().trim();
        if (trimmed.length() > MAX_NAME_LENGTH) {
            throw new BusinessRuleException(
                    "Họ và tên không được vượt quá %d ký tự.".formatted(MAX_NAME_LENGTH),
                    "NAME_TOO_LONG");
        }

        // BR-02: Load user
        var user = userRepository.findById(cmd.userId())
                .orElseThrow(() -> ResourceNotFoundException.user(cmd.userId()));

        user.updateFullName(trimmed);
        userRepository.save(user);

        log.info("Name updated for userId={}", cmd.userId());
    }

    public record Command(UUID userId, String fullName) {
    }
}