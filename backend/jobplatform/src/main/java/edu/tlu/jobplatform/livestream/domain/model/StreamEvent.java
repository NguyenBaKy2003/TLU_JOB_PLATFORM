package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class StreamEvent {

    private final UUID id;
    private final UUID sessionId;
    private final UUID senderId;
    private final StreamEventType type;
    private final String payload;
    private final LocalDateTime occurredAt;

    public static StreamEvent of(UUID sessionId, UUID senderId,
            StreamEventType type, String payload) {
        return new StreamEvent(UUID.randomUUID(), sessionId, senderId, type, payload, LocalDateTime.now());
    }

    public static StreamEvent system(UUID sessionId, String payload) {
        return new StreamEvent(UUID.randomUUID(), sessionId, null,
                StreamEventType.SYSTEM, payload, LocalDateTime.now());
    }

    private StreamEvent(UUID id, UUID sessionId, UUID senderId,
            StreamEventType type, String payload, LocalDateTime occurredAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.senderId = senderId;
        this.type = type;
        this.payload = payload;
        this.occurredAt = occurredAt;
    }
}