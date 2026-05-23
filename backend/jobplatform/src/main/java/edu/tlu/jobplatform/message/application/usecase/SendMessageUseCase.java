package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.domain.model.MessageType;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.repository.MessageRepository;
import edu.tlu.jobplatform.shared.event.message.MessageSentEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendMessageUseCase {

        private final MessageRepository messageRepository;
        private final ConversationRepository conversationRepository;
        private final ApplicationEventPublisher eventPublisher;

        @Getter
        public static class Command {
                private final UUID senderId;
                private final UUID conversationId;
                private final String content;
                private final MessageType type;

                public Command(UUID senderId, UUID conversationId, String content, MessageType type) {
                        this.senderId = senderId;
                        this.conversationId = conversationId;
                        this.content = content;
                        this.type = type;
                }
        }

        @Transactional
        public Message execute(Command cmd) {

                Conversation conversation = conversationRepository.findById(cmd.getConversationId())
                                .orElseThrow(() -> ResourceNotFoundException.of("Conversation",
                                                cmd.getConversationId()));

                if (!conversation.isParticipant(cmd.getSenderId())) {
                        throw new BusinessRuleException(
                                        "Bạn không phải thành viên của cuộc hội thoại này.",
                                        "MESSAGE_NOT_PARTICIPANT");
                }

                if (!conversation.canSendMessage()) {
                        throw new BusinessRuleException(
                                        "Cuộc hội thoại này đã bị đóng hoặc bị chặn.",
                                        "MESSAGE_CONVERSATION_INACTIVE");
                }

                UUID recipientId = conversation.getOtherParticipant(cmd.getSenderId());
                String preview = buildPreview(cmd.getContent());

                Message message = Message.builder()
                                .id(UUID.randomUUID())
                                .conversationId(cmd.getConversationId())
                                .senderId(cmd.getSenderId())
                                .content(cmd.getContent())
                                .type(cmd.getType())
                                .read(false)
                                .createdAt(LocalDateTime.now())
                                .build();

                Message saved = messageRepository.save(message);

                conversation.onMessageSent(cmd.getSenderId(), preview);
                Conversation savedConversation = conversationRepository.save(conversation);

                int unreadCount = savedConversation.getUnreadCountFor(recipientId);

                eventPublisher.publishEvent(new MessageSentEvent(
                                saved.getId(),
                                saved.getConversationId(),
                                saved.getSenderId(),
                                recipientId,
                                preview,
                                unreadCount,
                                saved.getCreatedAt()));

                log.info("Message sent: id={}, conversation={}, sender={}, recipient={}",
                                saved.getId(), cmd.getConversationId(), cmd.getSenderId(), recipientId);

                return saved;
        }

        private String buildPreview(String content) {
                if (content == null)
                        return "";
                return content.length() > 100 ? content.substring(0, 97) + "..." : content;
        }
}