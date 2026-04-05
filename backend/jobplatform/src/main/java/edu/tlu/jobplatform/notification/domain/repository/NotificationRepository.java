package edu.tlu.jobplatform.notification.domain.repository;

import edu.tlu.jobplatform.notification.domain.model.Notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository {

    Notification save(Notification notification);

    Optional<Notification> findById(UUID id);

    List<Notification> findByUserId(UUID userId, int page, int size);

    int countUnreadByUserId(UUID userId);

    int markAllReadByUserId(UUID userId);

    void deleteById(UUID id);
}