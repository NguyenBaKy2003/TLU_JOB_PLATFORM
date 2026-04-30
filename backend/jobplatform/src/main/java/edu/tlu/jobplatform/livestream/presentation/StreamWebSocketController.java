package edu.tlu.jobplatform.livestream.presentation;

import edu.tlu.jobplatform.livestream.application.usecase.candidate.SendChatMessageUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.SubmitQAQuestionUseCase;
import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream.SenderRole;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.WsChatRequest;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.WsQARequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
@Tag(name = "Stream WebSocket", description = "STOMP endpoints cho chat & Q&A realtime")
public class StreamWebSocketController {

        private final SendChatMessageUseCase sendChatUseCase;
        private final SubmitQAQuestionUseCase submitQAUseCase;

        @MessageMapping("/streams/{sessionId}/chat")
        public void handleChat(
                        @DestinationVariable UUID sessionId,
                        @Valid @Payload WsChatRequest req,
                        Principal principal) {

                if (principal == null) {
                        log.warn("Unauthorized chat attempt on session {}", sessionId);
                        return;
                }

                Authentication auth = (Authentication) principal;
                UUID senderId = UUID.fromString(principal.getName());
                SenderRole role = auth.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYER"))
                                                ? SenderRole.EMPLOYER
                                                : SenderRole.CANDIDATE;

                sendChatUseCase.execute(
                                new SendChatMessageUseCase.Command(sessionId, senderId, role, req.content()));
        }

        @MessageMapping("/streams/{sessionId}/qa")
        public void handleQA(
                        @DestinationVariable UUID sessionId,
                        @Valid @Payload WsQARequest req,
                        Principal principal) {

                if (principal == null) {
                        log.warn("Unauthorized Q&A attempt on session {}", sessionId);
                        return;
                }

                UUID candidateId = UUID.fromString(principal.getName());
                submitQAUseCase.execute(
                                new SubmitQAQuestionUseCase.Command(sessionId, candidateId, req.question()));
        }
}