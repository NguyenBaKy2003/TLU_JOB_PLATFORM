package edu.tlu.jobplatform.shared.event.livestream;

import java.util.UUID;

import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;

public record StreamEventCreatedEvent(
                UUID recipientId,
                UUID sessionId,
                StreamEventType type,
                String payload) {
}
