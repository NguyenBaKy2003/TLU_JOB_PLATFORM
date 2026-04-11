package edu.tlu.jobplatform.chatbot.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Một phiên chat giữa user và AI Career Advisor.
 * Lưu toàn bộ lịch sử để gửi kèm context cho OpenAI.
 */
@Getter
@Builder
public class ChatSession {

    private final UUID              id;
    private final UUID              userId;
    private String                  title;      // Auto-generated từ tin nhắn đầu tiên

    @Builder.Default
    private List<ChatMessage> messages = new ArrayList<>();

    private final LocalDateTime     createdAt;
    private LocalDateTime           lastMessageAt;

    /** Thêm tin nhắn vào session */
    public void addMessage(ChatMessage message) {
        messages.add(message);
        lastMessageAt = LocalDateTime.now();
        // Auto-set title từ tin nhắn user đầu tiên
        if (title == null && message.getRole() == MessageRole.USER) {
            String text = message.getContent();
            title = text.length() > 50 ? text.substring(0, 47) + "..." : text;
        }
    }
}
