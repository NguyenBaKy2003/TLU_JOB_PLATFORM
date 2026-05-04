package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.application.port.out.NotificationPreferencesPort;
import edu.tlu.jobplatform.user.domain.model.NotificationPreferences;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * UseCase: Cập nhật cài đặt thông báo.
 *
 * Không cần transaction phức tạp — chỉ upsert preferences.
 * User phải tồn tại để tránh lưu preferences cho userId không có thật.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateNotificationPreferencesUseCase {

    private final UserRepository userRepository;
    private final NotificationPreferencesPort preferencesPort;

    public void execute(Command cmd) {
        // Verify user tồn tại
        if (!userRepository.existsById(cmd.userId())) {
            throw ResourceNotFoundException.user(cmd.userId());
        }

        var preferences = NotificationPreferences.builder()
                .newJobs(cmd.newJobs())
                .applications(cmd.applications())
                .messages(cmd.messages())
                .build();

        preferencesPort.save(cmd.userId(), preferences);

        log.info("Notification preferences updated for userId={}", cmd.userId());
    }

    public record Command(
            UUID userId,
            boolean newJobs,
            boolean applications,
            boolean messages) {
    }
}