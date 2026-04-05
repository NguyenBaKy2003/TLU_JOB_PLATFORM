package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.port.out.EmailPort;
import edu.tlu.jobplatform.websocket.application.port.out.WsPushPort;
import edu.tlu.jobplatform.websocket.domain.model.WsPayload;
import edu.tlu.jobplatform.websocket.infrastructure.handler.StompSessionHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventHandler {

    private final WsPushPort wsPushPort;
    private final EmailPort emailPort;
    private final StompSessionHandler sessionHandler;

    @Async("wsPushExecutor")
    @EventListener
    public void handle(NotificationCreatedEvent event) {
        boolean online = sessionHandler.isOnline(event.userId().toString());

        // Push WS nếu user đang online
        if (online) {
            wsPushPort.pushToUser(
                    event.userId(),
                    WsPayload.of(WsPayload.Type.NOTIFICATION, toWsData(event)));
            log.debug("Notification WS pushed: userId={} type={}", event.userId(), event.type());
        }

        // Gửi email khi user offline VÀ loại notification cần email
        if (!online && event.emailRequired()) {
            emailPort.sendNotificationEmail(
                    event.recipientEmail(),
                    event.title(),
                    event.body(),
                    event.link());
            log.debug("Notification email sent (offline): userId={}", event.userId());
        }
    }

    private NotificationWsData toWsData(NotificationCreatedEvent event) {
        return new NotificationWsData(
                event.notificationId(),
                event.title(),
                event.body(),
                event.link(),
                event.createdAt());
    }
}