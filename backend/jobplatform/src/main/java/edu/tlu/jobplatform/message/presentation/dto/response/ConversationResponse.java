// response/ConversationResponse.java
package edu.tlu.jobplatform.message.presentation.dto.response;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.model.ConversationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID otherParticipantId,
        UUID jobPostId,
        ConversationStatus status,
        String lastMessagePreview,
        LocalDateTime lastMessageAt,
        int unreadCount) {
    public static ConversationResponse from(Conversation c, UUID viewerId) {
        return new ConversationResponse(
                c.getId(),
                c.getOtherParticipant(viewerId),
                c.getJobPostId(),
                c.getStatus(),
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                c.getUnreadCountFor(viewerId));
    }
}