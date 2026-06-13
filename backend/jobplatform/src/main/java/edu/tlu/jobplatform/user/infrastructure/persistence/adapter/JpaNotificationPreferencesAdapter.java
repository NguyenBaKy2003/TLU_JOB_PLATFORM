package edu.tlu.jobplatform.user.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.user.application.port.out.NotificationPreferencesPort; // ← fix
import edu.tlu.jobplatform.user.domain.model.NotificationPreferences;
import edu.tlu.jobplatform.user.infrastructure.persistence.entity.NotificationPreferencesJpaEntity;
import edu.tlu.jobplatform.user.infrastructure.persistence.repository.NotificationPreferencesJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaNotificationPreferencesAdapter implements NotificationPreferencesPort {

    private final NotificationPreferencesJpaRepository repo;

    @Override
    public void save(UUID userId, NotificationPreferences preferences) {
        var entity = repo.findById(userId)
                .orElse(new NotificationPreferencesJpaEntity());
        entity.setUserId(userId);
        entity.setNewJobs(preferences.isNewJobs());
        entity.setApplications(preferences.isApplications());
        entity.setMessages(preferences.isMessages());
        repo.save(entity);
    }

    @Override
    public NotificationPreferences findByUserId(UUID userId) {
        return repo.findById(userId)
                .map(e -> NotificationPreferences.builder()
                        .newJobs(e.isNewJobs())
                        .applications(e.isApplications())
                        .messages(e.isMessages())
                        .build())
                .orElse(NotificationPreferences.defaultPreferences());
    }
}