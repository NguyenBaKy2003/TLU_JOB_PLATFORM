package edu.tlu.jobplatform.chatbot.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.chatbot.domain.model.ChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {

    private final UUID          id;
    private final UUID          sessionId;
    private final String        role;
    private final String        content;
    private final LocalDateTime createdAt;

    public static ChatMessageResponse from(ChatMessage msg, UUID sessionId) {
        return ChatMessageResponse.builder()
            .id(msg.getId()).sessionId(sessionId)
            .role(msg.getRole().name()).content(msg.getContent())
            .createdAt(msg.getCreatedAt()).build();
    }
}
