package edu.tlu.jobplatform.chatbot.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatSessionResponse {

    private final UUID                      id;
    private final String                    title;
    private final LocalDateTime             createdAt;
    private final LocalDateTime             lastMessageAt;
    private final List<ChatMessageResponse> messages;

    public static ChatSessionResponse fromSummary(ChatSession s) {
        return ChatSessionResponse.builder()
            .id(s.getId()).title(s.getTitle())
            .createdAt(s.getCreatedAt()).lastMessageAt(s.getLastMessageAt())
            .build();
    }

    public static ChatSessionResponse fromDetail(ChatSession s) {
        List<ChatMessageResponse> msgs = s.getMessages() == null ? List.of() :
            s.getMessages().stream()
                .map(m -> ChatMessageResponse.from(m, s.getId())).toList();
        return ChatSessionResponse.builder()
            .id(s.getId()).title(s.getTitle())
            .createdAt(s.getCreatedAt()).lastMessageAt(s.getLastMessageAt())
            .messages(msgs).build();
    }
}
