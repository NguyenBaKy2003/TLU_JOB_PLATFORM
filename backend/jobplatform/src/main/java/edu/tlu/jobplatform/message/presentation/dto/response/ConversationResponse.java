// presentation/dto/response/ConversationResponse.java
package edu.tlu.jobplatform.message.presentation.dto.response;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.model.ConversationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        ParticipantInfo employer, // participantA
        ParticipantInfo candidate, // participantB
        UUID jobPostId,
        ConversationStatus status,
        String lastMessagePreview,
        LocalDateTime lastMessageAt,
        int unreadCount) {

    public static ConversationResponse from(
            Conversation c,
            UUID viewerId,
            ParticipantInfo employer,
            ParticipantInfo candidate) {

        return new ConversationResponse(
                c.getId(),
                employer,
                candidate,
                c.getJobPostId(),
                c.getStatus(),
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                c.getUnreadCountFor(viewerId));
    }
}