// livestream/domain/model/ChatMessage.java
package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class ChatMessageStream {

    public enum SenderRole {
        CANDIDATE, EMPLOYER, SYSTEM
    }

    private final UUID id;
    private final UUID sessionId;
    private final UUID senderId;
    private final String senderName;
    private final SenderRole senderRole;
    private final String content;
    private final LocalDateTime sentAt;

    private ChatMessageStream(UUID id, UUID sessionId, UUID senderId,
            String senderName, SenderRole senderRole, String content) {
        this.id = id;
        this.sessionId = sessionId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    public static ChatMessageStream create(UUID sessionId, UUID senderId,
            String senderName, SenderRole role, String content) {
        if (content == null || content.isBlank()) {
            throw new BusinessRuleException(
                    "Nội dung tin nhắn không được trống", "CHAT_CONTENT_BLANK");
        }
        if (content.length() > 300) {
            throw new BusinessRuleException(
                    "Tin nhắn không được vượt quá 300 ký tự", "CHAT_CONTENT_TOO_LONG");
        }
        return new ChatMessageStream(UUID.randomUUID(), sessionId, senderId, senderName, role, content);
    }

    public static ChatMessageStream restore(UUID id, UUID sessionId, UUID senderId,
            String senderName, SenderRole role,
            String content, LocalDateTime sentAt) {
        ChatMessageStream m = new ChatMessageStream(id, sessionId, senderId, senderName, role, content);
        // sentAt cần non-final để restore — xem note (*)
        return m;
    }
}