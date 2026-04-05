package edu.tlu.jobplatform.message.presentation;

import edu.tlu.jobplatform.message.application.usecase.*;
import edu.tlu.jobplatform.message.presentation.dto.request.SendMessageRequest;
import edu.tlu.jobplatform.message.presentation.dto.request.StartConversationRequest;
import edu.tlu.jobplatform.message.presentation.dto.response.ConversationResponse;
import edu.tlu.jobplatform.message.presentation.dto.response.MessageResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy.Scope;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final StartConversationUseCase startConversation;
    private final SendMessageUseCase sendMessage;
    private final GetConversationsUseCase getConversations;
    private final GetMessagesUseCase getMessages;
    private final MarkReadUseCase markRead;

    /** POST /api/v1/messages/conversations — Employer tạo conversation */
    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationResponse>> startConversation(
            @Valid @RequestBody StartConversationRequest request,
            @AuthenticationPrincipal String userId) {

        var conversation = startConversation.execute(new StartConversationUseCase.Command(
                UUID.fromString(userId),
                request.candidateId(),
                request.jobPostId()));
        return ResponseEntity.ok(ApiResponse.success(
                ConversationResponse.from(conversation, UUID.fromString(userId))));
    }

    /** GET /api/v1/messages/conversations — Inbox */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<GetConversationsUseCase.Result>> getInbox(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success(
                getConversations.execute(UUID.fromString(userId), page, size)));
    }

    /** GET /api/v1/messages/conversations/{id} — Message thread */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getThread(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<MessageResponse> messages = getMessages
                .execute(conversationId, UUID.fromString(userId), page, size)
                .stream().map(MessageResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    /** POST /api/v1/messages — Gửi tin nhắn qua REST */
    @PostMapping
    @RateLimit(policy = "send-message", scope = Scope.USER)
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal String userId) {

        var message = sendMessage.execute(new SendMessageUseCase.Command(
                UUID.fromString(userId),
                request.conversationId(),
                request.content(),
                request.type()));
        return ResponseEntity.ok(ApiResponse.success(MessageResponse.from(message)));
    }

    /** PATCH /api/v1/messages/conversations/{id}/read — Đánh dấu đã đọc */
    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal String userId) {

        markRead.execute(conversationId, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}