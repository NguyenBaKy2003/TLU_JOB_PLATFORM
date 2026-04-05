package edu.tlu.jobplatform.websocket.infrastructure.event;

import edu.tlu.jobplatform.message.infrastructure.event.notification.NotificationCreatedEvent;
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
public class NotificationWsHandler {

    private final WsPushPort wsPushPort;

    /**
     * Lắng nghe NotificationCreatedEvent → push realtime tới user.
     * Covers: application status change, interview scheduled, payment success, etc.
     */
    @Async
    @EventListener
    public void onNotificationCreated(NotificationCreatedEvent event) {
        wsPushPort.pushToUser(
                event.userId(),
                WsPayload.of(WsPayload.Type.NOTIFICATION, new NotificationWsData(
                        event.notificationId(),
                        event.title(),
                        event.body(),
                        event.link(),
                        event.createdAt())));

        log.debug("WS event handled: Notification userId={} type={}", event.userId(), event.type());
    }
}