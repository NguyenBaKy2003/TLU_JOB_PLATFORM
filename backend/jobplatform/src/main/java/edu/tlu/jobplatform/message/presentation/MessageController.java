package edu.tlu.jobplatform.message.presentation;

import edu.tlu.jobplatform.message.application.usecase.*;
import edu.tlu.jobplatform.message.presentation.dto.request.SendMessageRequest;
import edu.tlu.jobplatform.message.presentation.dto.request.StartConversationRequest;
import edu.tlu.jobplatform.message.presentation.dto.response.ConversationResponse;
import edu.tlu.jobplatform.message.presentation.dto.response.MessageResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy.Scope;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Message API", description = "Quản lý tin nhắn và hội thoại giữa ứng viên và nhà tuyển dụng")
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

        private final StartConversationUseCase startConversation;
        private final SendMessageUseCase sendMessage;
        private final GetConversationsUseCase getConversations;
        private final GetMessagesUseCase getMessages;
        private final MarkReadUseCase markRead;

        @Operation(summary = "Tạo cuộc hội thoại", description = "Employer bắt đầu cuộc hội thoại với ứng viên theo job post")

        @PostMapping("/conversations")
        public ResponseEntity<ApiResponse<ConversationResponse>> startConversation(
                        @Valid @RequestBody StartConversationRequest request,
                        @Parameter(hidden = true) @AuthenticationPrincipal String userId) {

                var conversation = startConversation.execute(new StartConversationUseCase.Command(
                                UUID.fromString(userId),
                                request.candidateId(),
                                request.jobPostId()));

                return ResponseEntity.ok(ApiResponse.success(
                                ConversationResponse.from(conversation, UUID.fromString(userId))));
        }

        @Operation(summary = "Lấy danh sách hội thoại", description = "Trả về inbox của user (candidate hoặc employer)")
        @GetMapping("/conversations")
        public ResponseEntity<ApiResponse<GetConversationsUseCase.Result>> getInbox(
                        @Parameter(hidden = true) @AuthenticationPrincipal String userId,
                        @Parameter(description = "Số trang (default = 0)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Kích thước trang (default = 20)") @RequestParam(defaultValue = "20") int size) {

                return ResponseEntity.ok(ApiResponse.success(
                                getConversations.execute(UUID.fromString(userId), page, size)));
        }

        @Operation(summary = "Lấy danh sách tin nhắn", description = "Lấy toàn bộ message trong một conversation")
        @GetMapping("/conversations/{conversationId}")
        public ResponseEntity<ApiResponse<List<MessageResponse>>> getThread(
                        @Parameter(description = "ID của conversation") @PathVariable UUID conversationId,
                        @Parameter(hidden = true) @AuthenticationPrincipal String userId,
                        @Parameter(description = "Page (default = 0)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Size (default = 50)") @RequestParam(defaultValue = "50") int size) {

                List<MessageResponse> messages = getMessages
                                .execute(conversationId, UUID.fromString(userId), page, size)
                                .stream().map(MessageResponse::from).toList();

                return ResponseEntity.ok(ApiResponse.success(messages));
        }

        @Operation(summary = "Gửi tin nhắn", description = "Gửi message trong conversation (REST API)")
        @PostMapping
        @RateLimit(policy = "send-message", scope = Scope.USER)
        public ResponseEntity<ApiResponse<MessageResponse>> send(
                        @Valid @RequestBody SendMessageRequest request,
                        @Parameter(hidden = true) @AuthenticationPrincipal String userId) {

                var message = sendMessage.execute(new SendMessageUseCase.Command(
                                UUID.fromString(userId),
                                request.conversationId(),
                                request.content(),
                                request.type()));

                return ResponseEntity.ok(ApiResponse.success(MessageResponse.from(message)));
        }

        @Operation(summary = "Đánh dấu đã đọc", description = "Đánh dấu toàn bộ tin nhắn trong conversation là đã đọc")
        @PatchMapping("/conversations/{conversationId}/read")
        public ResponseEntity<ApiResponse<Void>> markAsRead(
                        @Parameter(description = "ID của conversation") @PathVariable UUID conversationId,
                        @Parameter(hidden = true) @AuthenticationPrincipal String userId) {

                markRead.execute(conversationId, UUID.fromString(userId));
                return ResponseEntity.ok(ApiResponse.success(null));
        }
}