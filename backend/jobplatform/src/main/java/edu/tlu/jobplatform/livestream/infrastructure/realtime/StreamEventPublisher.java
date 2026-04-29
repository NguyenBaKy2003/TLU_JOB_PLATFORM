package edu.tlu.jobplatform.livestream.infrastructure.realtime;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StreamEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishViewerCount(UUID sessionId, int count) {
        messagingTemplate.convertAndSend(
                "/topic/stream/" + sessionId + "/events",
                Map.of(
                        "type", "VIEWER_COUNT_UPDATE",
                        "payload", Map.of("count", count)));
    }

    public void publishEvent(UUID sessionId, Object event) {
        messagingTemplate.convertAndSend(
                "/topic/stream/" + sessionId + "/events",
                event);
    }
}