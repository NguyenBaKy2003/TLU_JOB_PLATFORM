package edu.tlu.jobplatform.websocket.infrastructure.event;

import edu.tlu.jobplatform.notification.infrastructure.event.NotificationCreatedEvent;
import edu.tlu.jobplatform.websocket.application.port.out.WsPushPort;
import edu.tlu.jobplatform.websocket.domain.model.WsPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWsHandler {

    private final WsPushPort wsPushPort;

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNotificationCreated(NotificationCreatedEvent event) {
        log.info("WS push: userId={} type={}", event.userId(), event.type());

        wsPushPort.pushToUser(
                event.userId(),
                WsPayload.of(WsPayload.Type.NOTIFICATION, new NotificationWsData(
                        event.notificationId(),
                        event.title(),
                        event.body(),
                        event.link(),
                        event.createdAt())));
    }
}