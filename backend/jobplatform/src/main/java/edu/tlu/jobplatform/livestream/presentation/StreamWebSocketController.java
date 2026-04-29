// livestream/presentation/StreamWebSocketController.java
package edu.tlu.jobplatform.livestream.presentation;

import edu.tlu.jobplatform.livestream.application.usecase.candidate.SendChatMessageUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.SubmitQAQuestionUseCase;
import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream.SenderRole;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.WsChatRequest;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.WsQARequest;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

/**
 * STOMP endpoints cho Livestream.
 *
 * Client flow:
 * CONNECT → /api/v1/ws (với JWT header, xử lý bởi AuthChannelInterceptor)
 * SUBSCRIBE → /topic/streams/{sessionId}/chat
 * SUBSCRIBE → /topic/streams/{sessionId}/qa (employer)
 * SEND → /app/streams/{sessionId}/chat
 * SEND → /app/streams/{sessionId}/qa
 */
@Controller
@RequiredArgsConstructor
@Tag(name = "Stream WebSocket", description = "STOMP endpoints cho chat & Q&A realtime")
public class StreamWebSocketController {

    private final SendChatMessageUseCase sendChatUseCase;
    private final SubmitQAQuestionUseCase submitQAUseCase;

    /**
     * SEND /app/streams/{sessionId}/chat
     * Body: { "content": "Xin chào!" }
     * → Broadcast tới /topic/streams/{sessionId}/chat
     */
    @MessageMapping("/streams/{sessionId}/chat")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER')")
    public void handleChat(
            @DestinationVariable UUID sessionId,
            @Valid @Payload WsChatRequest req,
            org.springframework.security.core.Authentication auth) {

        UUID senderId = SecurityUtils.getCurrentUserIdOrThrow();

        // Xác định role từ authorities
        SenderRole role = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYER"))
                        ? SenderRole.EMPLOYER
                        : SenderRole.CANDIDATE;

        sendChatUseCase.execute(
                new SendChatMessageUseCase.Command(sessionId, senderId, role, req.content()));
    }

    /**
     * SEND /app/streams/{sessionId}/qa
     * Body: { "question": "Lương khởi điểm là bao nhiêu?" }
     * → Broadcast tới /topic/streams/{sessionId}/qa (employer nhận)
     */
    @MessageMapping("/streams/{sessionId}/qa")
    @PreAuthorize("hasRole('CANDIDATE')")
    public void handleQA(
            @DestinationVariable UUID sessionId,
            @Valid @Payload WsQARequest req) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        submitQAUseCase.execute(
                new SubmitQAQuestionUseCase.Command(sessionId, candidateId, req.question()));
    }
}