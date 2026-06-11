package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.message.MessageSentEvent;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessageNotificationHandler {

    private final CreateNotificationUseCase createNotification;
    private final UserRepository userRepository; // thêm

    @Async("taskExecutor")
    @EventListener
    public void onMessageSent(MessageSentEvent event) {
        String link = userRepository.findById(event.recipientId())
                .map(user -> buildMessageLink(user.getRole(), event.conversationId().toString()))
                .orElseGet(() -> {
                    log.warn("Recipient not found: {}, fallback link", event.recipientId());
                    return "/messages/conversations/" + event.conversationId();
                });

        createNotification.execute(new CreateNotificationUseCase.Command(
                event.recipientId(),
                NotificationType.NEW_MESSAGE,
                "Bạn có tin nhắn mới",
                event.contentPreview(),
                link));

        log.debug("DB notification saved: message={}, recipient={}",
                event.messageId(), event.recipientId());
    }

    private String buildMessageLink(UserRole role, String conversationId) {
        String prefix = switch (role) {
            case EMPLOYER -> "/employer";
            case CANDIDATE -> "/candidate";
            default -> "";
        };
        return prefix + "/messages/";
    }
}