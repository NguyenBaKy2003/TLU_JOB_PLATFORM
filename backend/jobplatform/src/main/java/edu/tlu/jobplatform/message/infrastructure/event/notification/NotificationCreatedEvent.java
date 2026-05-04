// shared/event/notification/NotificationCreatedEvent.java
package edu.tlu.jobplatform.message.infrastructure.event.notification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationCreatedEvent(
        UUID notificationId,
        UUID userId,
        String type, // APPLICATION_STATUS_CHANGED, INTERVIEW_SCHEDULED, ...
        String title,
        String body,
        String link,
        LocalDateTime createdAt) {
}