package edu.tlu.jobplatform.notification.infrastructure.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Fired sau khi Notification được lưu vào DB.
 * NotificationEventHandler lắng nghe để push WS + gửi email.
 */
public record NotificationCreatedEvent(
        UUID notificationId,
        UUID userId,
        String recipientEmail,
        boolean emailRequired,
        String type,
        String title,
        String body,
        String link,
        LocalDateTime createdAt) {
}