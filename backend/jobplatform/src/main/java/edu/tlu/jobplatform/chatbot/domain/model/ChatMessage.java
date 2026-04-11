package edu.tlu.jobplatform.chatbot.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ChatMessage {

    private final UUID          id;
    private final UUID          sessionId;
    private final MessageRole   role;       // USER, ASSISTANT, SYSTEM
    private final String        content;
    private final LocalDateTime createdAt;

    /** Tạo tin nhắn user */
    public static ChatMessage userMessage(UUID sessionId, String content) {
        return ChatMessage.builder()
            .id(UUID.randomUUID())
            .sessionId(sessionId)
            .role(MessageRole.USER)
            .content(content)
            .createdAt(LocalDateTime.now())
            .build();
    }

    /** Tạo tin nhắn assistant */
    public static ChatMessage assistantMessage(UUID sessionId, String content) {
        return ChatMessage.builder()
            .id(UUID.randomUUID())
            .sessionId(sessionId)
            .role(MessageRole.ASSISTANT)
            .content(content)
            .createdAt(LocalDateTime.now())
            .build();
    }
}
