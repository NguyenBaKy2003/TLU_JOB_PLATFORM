package edu.tlu.jobplatform.notification.infrastructure.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationWsData(
        UUID notificationId,
        String title,
        String body,
        String link,
        LocalDateTime createdAt) {
}