// shared/event/message/MessageSentEvent.java
package edu.tlu.jobplatform.shared.event.message;

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