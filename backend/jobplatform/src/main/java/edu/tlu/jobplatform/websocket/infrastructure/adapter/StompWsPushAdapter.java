package edu.tlu.jobplatform.websocket.infrastructure.adapter;

import edu.tlu.jobplatform.websocket.application.port.out.WsPushPort;
import edu.tlu.jobplatform.websocket.domain.model.WsPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompWsPushAdapter implements WsPushPort {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi tới /user/{userId}/queue/messages hoặc /notifications
     * Spring tự resolve destination dựa trên userId (principal name).
     */
    @Override
    public void pushToUser(UUID userId, WsPayload payload) {
        String destination = resolveDestination(payload.getType());
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    destination,
                    payload);
            log.debug("WS push: userId={} dest={} type={}", userId, destination, payload.getType());
        } catch (Exception e) {
            log.warn("WS push failed (user may be offline): userId={} type={}", userId, payload.getType());
        }
    }

    @Override
    public void pushToConversation(UUID conversationId, WsPayload payload) {
        // Dùng topic để broadcast tới tất cả subscriber của conversation
        String destination = "/topic/conversation." + conversationId;
        try {
            messagingTemplate.convertAndSend(destination, payload);
            log.debug("WS push: conversationId={} type={}", conversationId, payload.getType());
        } catch (Exception e) {
            log.warn("WS push failed: conversationId={}", conversationId);
        }
    }

    private String resolveDestination(WsPayload.Type type) {
        return switch (type) {
            case NEW_MESSAGE, MESSAGE_READ -> "/queue/messages";
            case NOTIFICATION, UNREAD_BADGE -> "/queue/notifications";
            default -> "/queue/system";
        };
    }
}