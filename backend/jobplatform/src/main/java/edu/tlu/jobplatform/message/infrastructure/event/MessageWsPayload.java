package edu.tlu.jobplatform.message.infrastructure.event;

import java.util.UUID;

/**
 * Payload push tới client qua STOMP /user/queue/messages
 * Field names khớp với IncomingMessage interface ở frontend.
 */
public record MessageWsPayload(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String content,
        String type,
        boolean read,
        String readAt,
        String createdAt) {
}