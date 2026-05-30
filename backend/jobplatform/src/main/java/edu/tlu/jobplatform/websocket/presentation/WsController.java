package edu.tlu.jobplatform.websocket.presentation;

import edu.tlu.jobplatform.message.application.usecase.SendMessageUseCase;
import edu.tlu.jobplatform.websocket.presentation.dto.WsSendMessageRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WsController {

    private final SendMessageUseCase sendMessageUseCase;

    /**
     * Client gửi STOMP frame tới /app/chat.send
     * Cùng use case với REST endpoint — không duplicate logic.
     */
    @MessageMapping("/chat.send")
    public void handleChatMessage(@Payload WsSendMessageRequest request,
            Principal principal) {
        log.debug("WS message received: from={} conversation={}",
                principal.getName(), request.conversationId());

        sendMessageUseCase.execute(new SendMessageUseCase.Command(
                UUID.fromString(principal.getName()),
                request.conversationId(),
                request.content(),
                request.type()));
    }

    /**
     * Client gửi STOMP frame tới /app/chat.read
     * Đánh dấu đã đọc conversation
     */
    @MessageMapping("/chat.read")
    public void handleMarkRead(@Payload UUID conversationId, Principal principal) {
        log.debug("WS mark read: userId={} conversation={}", principal.getName(), conversationId);
    }
}