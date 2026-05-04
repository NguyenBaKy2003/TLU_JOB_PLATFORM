package edu.tlu.jobplatform.message.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate root — đại diện cho một cuộc hội thoại giữa 2 người.
 * Một conversation gắn với một job post cụ thể (employer hỏi candidate về job
 * đó).
 */
@Getter
@Builder
public class Conversation {

    private final UUID id;
    private final UUID participantA; // employer (người khởi tạo)
    private final UUID participantB; // candidate
    private final UUID jobPostId; // nullable — context của cuộc trò chuyện

    private ConversationStatus status;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private int unreadCountA; // số chưa đọc của participantA
    private int unreadCountB; // số chưa đọc của participantB

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business rules ────────────

    public boolean canSendMessage() {
        return this.status == ConversationStatus.ACTIVE;
    }

    public boolean isParticipant(UUID userId) {
        return participantA.equals(userId) || participantB.equals(userId);
    }

    /** Trả về userId của người còn lại */
    public UUID getOtherParticipant(UUID userId) {
        return participantA.equals(userId) ? participantB : participantA;
    }

    /** Cập nhật sau khi có tin nhắn mới */
    public void onMessageSent(UUID senderId, String preview) {
        this.lastMessagePreview = preview;
        this.lastMessageAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        // Tăng unread của người nhận
        if (senderId.equals(participantA)) {
            this.unreadCountB++;
        } else {
            this.unreadCountA++;
        }
    }

    /** Đánh dấu đã đọc — reset unread counter của userId */
    public void markReadBy(UUID userId) {
        if (participantA.equals(userId)) {
            this.unreadCountA = 0;
        } else if (participantB.equals(userId)) {
            this.unreadCountB = 0;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public int getUnreadCountFor(UUID userId) {
        if (participantA.equals(userId))
            return unreadCountA;
        if (participantB.equals(userId))
            return unreadCountB;
        return 0;
    }

    public void archive() {
        this.status = ConversationStatus.ARCHIVED;
        this.updatedAt = LocalDateTime.now();
    }

    public void block() {
        this.status = ConversationStatus.BLOCKED;
        this.updatedAt = LocalDateTime.now();
    }
}