package edu.tlu.jobplatform.livestream.infrastructure.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.util.Map;

/**
 * Lắng nghe StreamEvent được publish sau khi transaction commit,
 * rồi push xuống tất cả viewer qua WebSocket STOMP.
 *
 * Destination: /topic/stream/{sessionId}/events
 *
 * Frontend subscribe:
 * stompClient.subscribe('/topic/stream/{sessionId}/events', callback)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StreamEventWsPusher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStreamEvent(StreamEventCreatedEvent appEvent) {
        StreamEvent event = appEvent.streamEvent();
        String destination = "/topic/stream/" + event.getSessionId() + "/events";

        try {
            Map<String, Object> wsPayload = Map.of(
                    "eventId", event.getId(),
                    "type", event.getType().name(),
                    "senderId", event.getSenderId() != null ? event.getSenderId().toString() : "system",
                    "payload", parsePayload(event.getPayload()),
                    "occurredAt", event.getOccurredAt().toString());

            messagingTemplate.convertAndSend(destination, wsPayload);
            log.debug("[WS] Push event {} → {}", event.getType(), destination);

        } catch (Exception e) {
            log.error("[WS] Lỗi push event {}: {}", event.getId(), e.getMessage(), e);
        }
    }

    /**
     * Push viewer count update riêng — chạy tần suất cao hơn, không cần persist.
     */
    public void pushViewerCount(String sessionId, int count) {
        String destination = "/topic/stream/" + sessionId + "/events";
        messagingTemplate.convertAndSend(destination, Map.of(
                "type", "VIEWER_COUNT_UPDATE",
                "payload", Map.of("count", count)));
    }

    /**
     * Push interview invite riêng cho 1 candidate (private queue).
     * Destination: /queue/stream-invite (personal queue của user)
     */
    public void pushInterviewInvite(String candidateUserId, Object invitePayload) {
        messagingTemplate.convertAndSendToUser(
                candidateUserId,
                "/queue/stream-invite",
                invitePayload);
        log.info("[WS] Đã push interview invite → candidate {}", candidateUserId);
    }

    private Object parsePayload(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json; // trả về string nếu không parse được
        }
    }
}