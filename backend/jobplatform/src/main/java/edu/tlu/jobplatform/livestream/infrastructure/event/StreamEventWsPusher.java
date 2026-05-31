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

@Component
@RequiredArgsConstructor
@Slf4j
public class StreamEventWsPusher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStreamEvent(StreamEventCreatedEvent appEvent) {
        StreamEvent event = appEvent.streamEvent();
        String destination = "/topic/streams/" + event.getSessionId() + "/events";

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

    public void pushViewerCount(String sessionId, int count) {
        String destination = "/topic/streams/" + sessionId + "/events";
        messagingTemplate.convertAndSend(destination, Map.of(
                "type", "VIEWER_COUNT_UPDATE",
                "payload", Map.of("count", count)));
    }

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
            return json;
        }
    }
}