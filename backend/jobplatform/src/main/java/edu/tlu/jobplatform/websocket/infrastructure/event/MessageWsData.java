package edu.tlu.jobplatform.websocket.infrastructure.event;

import java.time.LocalDateTime;
import java.util.UUID;

// Data cho NEW_MESSAGE
public record MessageWsData(
        UUID messageId,
        UUID conversationId,
        UUID senderId,
        String contentPreview,
        LocalDateTime sentAt) {
}
