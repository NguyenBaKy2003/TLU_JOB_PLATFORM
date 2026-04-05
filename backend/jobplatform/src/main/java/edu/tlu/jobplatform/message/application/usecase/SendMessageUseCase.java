package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.domain.model.MessageType;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.repository.MessageRepository;
import edu.tlu.jobplatform.message.domain.service.ConversationDomainService;
import edu.tlu.jobplatform.message.infrastructure.event.MessageSentEvent;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendMessageUseCase {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Message execute(Command cmd) {
        // 1. Load conversation
        Conversation conversation = conversationRepository.findById(cmd.conversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", cmd.conversationId()));

        // 2. Domain validation
        ConversationDomainService.validateCanSend(conversation, cmd.senderId());

        // 3. Tạo message
        Message message = ConversationDomainService.createMessage(
                cmd.conversationId(), cmd.senderId(), cmd.content(), cmd.type());

        Message saved = messageRepository.save(message);

        // 4. Cập nhật conversation (lastMessage, unreadCount)
        UUID recipientId = conversation.getOtherParticipant(cmd.senderId());
        conversation.onMessageSent(cmd.senderId(), saved.toPreview());
        conversationRepository.save(conversation);

        // 5. Publish event → WS + Notification
        eventPublisher.publishEvent(new MessageSentEvent(
                saved.getId(),
                conversation.getId(),
                cmd.senderId(),
                recipientId,
                saved.toPreview(),
                conversation.getUnreadCountFor(recipientId),
                saved.getCreatedAt()));

        log.debug("Message sent: id={} conversation={}", saved.getId(), conversation.getId());
        return saved;
    }

    public record Command(
            UUID senderId,
            UUID conversationId,
            String content,
            MessageType type) {
    }
}