package edu.tlu.jobplatform.notification.domain.service;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class NotificationDomainService {

    public static Notification create(UUID userId, String recipientEmail,
            NotificationType type,
            String title, String body, String link) {
        return Notification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .recipientEmail(recipientEmail)
                .type(type)
                .title(title)
                .body(body)
                .link(link)
                .read(false)
                .emailRequired(requiresEmail(type))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Chỉ gửi email khi user offline.
     * NEW_MESSAGE và SYSTEM_ANNOUNCEMENT → WS only, không spam email.
     */
    private static boolean requiresEmail(NotificationType type) {
        return switch (type) {
            case NEW_MESSAGE, SYSTEM_ANNOUNCEMENT -> false;
            default -> true;
        };
    }
}