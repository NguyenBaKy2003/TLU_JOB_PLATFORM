package edu.tlu.jobplatform.message.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class Message {

    private final UUID id;
    private final UUID conversationId;
    private final UUID senderId;
    private String content;
    private final MessageType type;

    private boolean read;
    private LocalDateTime readAt;

    private final LocalDateTime createdAt;

    // ── Business rules ─

    public void markAsRead() {
        if (!this.read) {
            this.read = true;
            this.readAt = LocalDateTime.now();
        }
    }

    /** Preview 100 ký tự đầu — dùng cho conversation list */
    public String toPreview() {
        if (content == null || content.isBlank())
            return "[File]";
        return content.length() > 100 ? content.substring(0, 100) + "…" : content;
    }
}