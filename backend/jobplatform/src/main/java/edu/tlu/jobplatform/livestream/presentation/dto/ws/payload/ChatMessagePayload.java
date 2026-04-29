// livestream/presentation/dto/ws/payload/ChatMessagePayload.java
package edu.tlu.jobplatform.livestream.presentation.dto.ws.payload;

import java.time.LocalDateTime;
import java.util.UUID;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream;

public record ChatMessagePayload(
        UUID id,
        UUID sessionId,
        UUID senderId,
        String senderName,
        String senderRole,
        String content,
        LocalDateTime sentAt) {
    public static ChatMessagePayload from(ChatMessageStream m) {
        return new ChatMessagePayload(
                m.getId(), m.getSessionId(), m.getSenderId(),
                m.getSenderName(), m.getSenderRole().name(),
                m.getContent(), m.getSentAt());
    }
}