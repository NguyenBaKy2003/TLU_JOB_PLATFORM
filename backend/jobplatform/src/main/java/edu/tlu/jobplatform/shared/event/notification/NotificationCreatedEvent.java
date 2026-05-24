// shared/event/notification/NotificationCreatedEvent.java
package edu.tlu.jobplatform.shared.event.notification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationCreatedEvent(
                UUID notificationId,
                UUID userId,
                String type,
                String title,
                String body,
                String link,
                LocalDateTime createdAt) {
}