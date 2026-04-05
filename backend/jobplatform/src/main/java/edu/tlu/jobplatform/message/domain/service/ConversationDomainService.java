package edu.tlu.jobplatform.message.domain.service;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.model.ConversationStatus;
import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.domain.model.MessageType;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConversationDomainService {

    /**
     * Validate trước khi gửi message.
     * Throw BusinessRuleException nếu vi phạm.
     */
    public static void validateCanSend(Conversation conversation, UUID senderId) {
        if (!conversation.isParticipant(senderId)) {
            throw new BusinessRuleException(
                    "Bạn không phải thành viên của cuộc trò chuyện này.",
                    "NOT_PARTICIPANT");
        }
        if (!conversation.canSendMessage()) {
            throw new BusinessRuleException(
                    "Cuộc trò chuyện đã bị " +
                            (conversation.getStatus() == ConversationStatus.BLOCKED
                                    ? "chặn."
                                    : "lưu trữ."),
                    "CONVERSATION_INACTIVE");
        }
    }

    /** Factory: tạo Message domain object mới */
    public static Message createMessage(UUID conversationId, UUID senderId,
            String content, MessageType type) {
        if (content == null || content.isBlank()) {
            throw new BusinessRuleException("Nội dung tin nhắn không được trống.", "EMPTY_MESSAGE");
        }
        if (content.length() > 5000) {
            throw new BusinessRuleException("Tin nhắn không được vượt quá 5000 ký tự.", "MESSAGE_TOO_LONG");
        }

        return Message.builder()
                .id(UUID.randomUUID())
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content.trim())
                .type(type != null ? type : MessageType.TEXT)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /** Factory: tạo Conversation mới */
    public static Conversation createConversation(UUID employerId, UUID candidateId,
            UUID jobPostId) {
        return Conversation.builder()
                .id(UUID.randomUUID())
                .participantA(employerId)
                .participantB(candidateId)
                .jobPostId(jobPostId)
                .status(ConversationStatus.ACTIVE)
                .unreadCountA(0)
                .unreadCountB(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}