package edu.tlu.jobplatform.notification.presentation.dto;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String body,
        String link,
        boolean read,
        LocalDateTime createdAt) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(),
                n.getTitle(), n.getBody(), n.getLink(),
                n.isRead(), n.getCreatedAt());
    }
}