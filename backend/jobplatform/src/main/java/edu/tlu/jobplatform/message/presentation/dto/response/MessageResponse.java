// response/MessageResponse.java
package edu.tlu.jobplatform.message.presentation.dto.response;

import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.domain.model.MessageType;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String content,
        MessageType type,
        boolean read,
        LocalDateTime createdAt) {
    public static MessageResponse from(Message m) {
        return new MessageResponse(
                m.getId(), m.getConversationId(), m.getSenderId(),
                m.getContent(), m.getType(), m.isRead(), m.getCreatedAt());
    }
}