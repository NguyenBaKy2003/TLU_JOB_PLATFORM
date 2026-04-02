package edu.tlu.jobplatform.shared.event.message;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageSentEvent(
        UUID messageId,
        UUID conversationId,
        UUID senderId,
        UUID recipientId,
        String contentPreview, // 100 ký tự đầu
        int unreadCount,
        LocalDateTime sentAt) {
}