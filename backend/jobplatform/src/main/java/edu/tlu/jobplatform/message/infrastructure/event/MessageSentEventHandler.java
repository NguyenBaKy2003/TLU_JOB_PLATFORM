package edu.tlu.jobplatform.message.infrastructure.event;

import edu.tlu.jobplatform.shared.event.message.MessageSentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe MessageSentEvent → push STOMP tới cả 2 participant.
 * Destination: /user/{userId}/queue/messages
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MessageSentEventHandler {

        private final SimpMessagingTemplate broker;

        @Async("taskExecutor") // ← dùng đúng executor, nhất quán với các handler khác
        @EventListener
        public void handle(MessageSentEvent event) {

                MessageWsPayload payload = new MessageWsPayload(
                                event.messageId(),
                                event.conversationId(),
                                event.senderId(),
                                event.contentPreview(),
                                "TEXT",
                                false,
                                null,
                                event.sentAt().toString());

                // Push tới sender (optimistic UI ở frontend có thể bỏ qua)
                broker.convertAndSendToUser(
                                event.senderId().toString(),
                                "/queue/messages",
                                payload);

                // Push tới recipient
                broker.convertAndSendToUser(
                                event.recipientId().toString(),
                                "/queue/messages",
                                payload);

                log.debug("WS pushed: message={} conversation={} sender={} recipient={}",
                                event.messageId(), event.conversationId(),
                                event.senderId(), event.recipientId());
        }
}