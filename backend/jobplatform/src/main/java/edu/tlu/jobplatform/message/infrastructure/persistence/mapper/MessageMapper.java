package edu.tlu.jobplatform.message.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.infrastructure.persistence.entity.ConversationJpaEntity;
import edu.tlu.jobplatform.message.infrastructure.persistence.entity.MessageJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public Conversation toDomain(ConversationJpaEntity e) {
        return Conversation.builder()
                .id(e.getId())
                .participantA(e.getParticipantA())
                .participantB(e.getParticipantB())
                .jobPostId(e.getJobPostId())
                .status(e.getStatus())
                .lastMessagePreview(e.getLastMessagePreview())
                .lastMessageAt(e.getLastMessageAt())
                .unreadCountA(e.getUnreadCountA())
                .unreadCountB(e.getUnreadCountB())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public ConversationJpaEntity toEntity(Conversation d) {
        return ConversationJpaEntity.builder()
                .participantA(d.getParticipantA())
                .participantB(d.getParticipantB())
                .jobPostId(d.getJobPostId())
                .status(d.getStatus())
                .lastMessagePreview(d.getLastMessagePreview())
                .lastMessageAt(d.getLastMessageAt())
                .unreadCountA(d.getUnreadCountA())
                .unreadCountB(d.getUnreadCountB())
                .build();
    }

    public Message toDomain(MessageJpaEntity e) {
        return Message.builder()
                .id(e.getId())
                .conversationId(e.getConversationId())
                .senderId(e.getSenderId())
                .content(e.getContent())
                .type(e.getType())
                .read(e.isRead())
                .readAt(e.getReadAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    public MessageJpaEntity toEntity(Message d) {
        return MessageJpaEntity.builder()
                .conversationId(d.getConversationId())
                .senderId(d.getSenderId())
                .content(d.getContent())
                .type(d.getType())
                .read(d.isRead())
                .readAt(d.getReadAt())
                .build();
    }
}