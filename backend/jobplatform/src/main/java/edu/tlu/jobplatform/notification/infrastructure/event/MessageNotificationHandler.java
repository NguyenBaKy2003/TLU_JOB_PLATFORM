package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.message.MessageSentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe MessageSentEvent → lưu notification vào DB cho recipient.
 * Chỉ lưu cho recipient, KHÔNG lưu cho sender.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MessageNotificationHandler {

    private final CreateNotificationUseCase createNotification;

    @Async("taskExecutor")
    @EventListener
    public void onMessageSent(MessageSentEvent event) {
        createNotification.execute(new CreateNotificationUseCase.Command(
                event.recipientId(),
                NotificationType.NEW_MESSAGE,
                "Bạn có tin nhắn mới",
                event.contentPreview(),
                "/messages/conversations/" + event.conversationId()));

        log.debug("DB notification saved: message={}, recipient={}",
                event.messageId(), event.recipientId());
    }
}