package edu.tlu.jobplatform.websocket.infrastructure.event;

import edu.tlu.jobplatform.message.infrastructure.event.MessageSentEvent;
import edu.tlu.jobplatform.websocket.application.port.out.WsPushPort;
import edu.tlu.jobplatform.websocket.domain.model.WsPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessageSentWsHandler {

    private final WsPushPort wsPushPort;

    /**
     * Lắng nghe MessageSentEvent → push realtime tới:
     * 1. Cả conversation (NEW_MESSAGE với full payload)
     * 2. Riêng recipient (UNREAD_BADGE để cập nhật số badge)
     */
    @Async
    @EventListener
    public void onMessageSent(MessageSentEvent event) {
        // 1. Push NEW_MESSAGE tới conversation topic
        wsPushPort.pushToConversation(
                event.conversationId(),
                WsPayload.of(WsPayload.Type.NEW_MESSAGE, new MessageWsData(
                        event.messageId(),
                        event.conversationId(),
                        event.senderId(),
                        event.contentPreview(),
                        event.sentAt())));

        // 2. Push UNREAD_BADGE tới recipient nếu không trong conversation
        wsPushPort.pushToUser(
                event.recipientId(),
                WsPayload.of(WsPayload.Type.UNREAD_BADGE, new BadgeData(event.unreadCount())));

        log.debug("WS event handled: MessageSent conversationId={}", event.conversationId());
    }
}