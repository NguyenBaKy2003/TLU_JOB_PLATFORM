package edu.tlu.jobplatform.message.infrastructure.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe MessageSentEvent → push tin nhắn tới cả 2 participant qua STOMP.
 *
 * Destination: /user/{userId}/queue/messages
 * SimpMessagingTemplate.convertAndSendToUser() tự thêm prefix /user/
 * nên chỉ cần truyền "/queue/messages".
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MessageSentEventHandler {

    private final SimpMessagingTemplate broker;

    @Async
    @EventListener
    public void handle(MessageSentEvent event) {

        MessageWsPayload payload = new MessageWsPayload(
                event.messageId(),
                event.conversationId(),
                event.senderId(),
                event.contentPreview(), // field name khớp MessageSentEvent
                "TEXT",
                false,
                null,
                event.sentAt().toString());

        // Push tới sender — frontend skip vì senderId === user.id (optimistic đã có)
        broker.convertAndSendToUser(
                event.senderId().toString(),
                "/queue/messages",
                payload);

        // Push tới recipient — frontend hiện bubble mới
        broker.convertAndSendToUser(
                event.recipientId().toString(),
                "/queue/messages",
                payload);

        log.debug("WS pushed message={} conversation={} sender={} recipient={}",
                event.messageId(), event.conversationId(),
                event.senderId(), event.recipientId());
    }
}