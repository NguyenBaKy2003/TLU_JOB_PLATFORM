package edu.tlu.jobplatform.notification.application.usecase;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.domain.repository.NotificationRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarkNotificationReadUseCase {

    private final NotificationRepository repository;

    @Transactional
    public void executeOne(UUID notificationId, UUID userId) {
        Notification n = repository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!n.getUserId().equals(userId)) {
            throw new SecurityException("Access denied");
        }

        n.markAsRead();
        repository.save(n);
    }

    @Transactional
    public int executeAll(UUID userId) {
        return repository.markAllReadByUserId(userId);
    }
}