package edu.tlu.jobplatform.message.infrastructure.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageSentEvent(
        UUID messageId,
        UUID conversationId,
        UUID senderId,
        UUID recipientId,
        String contentPreview,
        int unreadCount,
        LocalDateTime sentAt) {
}