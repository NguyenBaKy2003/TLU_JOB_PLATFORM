package edu.tlu.jobplatform.notification.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class Notification {

    private final UUID id;
    private final UUID userId;
    private final String recipientEmail;
    private final boolean emailRequired;

    private NotificationType type;
    private String title;
    private String body;
    private String link;

    private boolean read;
    private LocalDateTime readAt;

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business rules ────────────

    public void markAsRead() {
        if (!this.read) {
            this.read = true;
            this.readAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }
    }

    public boolean isUnread() {
        return !this.read;
    }
}