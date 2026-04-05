package edu.tlu.jobplatform.websocket.presentation.dto;

import java.util.UUID;

import edu.tlu.jobplatform.message.domain.model.MessageType;

public record WsSendMessageRequest(
                UUID conversationId,
                String content,
                MessageType type) {
}