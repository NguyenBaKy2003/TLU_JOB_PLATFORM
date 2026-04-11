package edu.tlu.jobplatform.chatbot.presentation;

import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import edu.tlu.jobplatform.chatbot.presentation.dto.ChatMessageResponse;
import edu.tlu.jobplatform.chatbot.presentation.dto.ChatSessionResponse;
import edu.tlu.jobplatform.chatbot.presentation.dto.SendMessageRequest;
import edu.tlu.jobplatform.chatbot.usecase.DeleteSessionUseCase;
import edu.tlu.jobplatform.chatbot.usecase.GetChatHistoryUseCase;
import edu.tlu.jobplatform.chatbot.usecase.SendMessageAIUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Chatbot endpoints:
 * POST /api/v1/chatbot/messages — Gửi tin nhắn (tạo session mới nếu cần)
 * GET /api/v1/chatbot/sessions — Danh sách phiên chat
 * GET /api/v1/chatbot/sessions/{id} — Chi tiết session + messages
 * DELETE /api/v1/chatbot/sessions/{id} — Xóa phiên chat
 */
@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
@Tag(name = "AI Chatbot", description = "TLU Career Advisor — Tư vấn nghề nghiệp AI")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class ChatbotController {

    private final SendMessageAIUseCase sendMessageUseCase;
    private final GetChatHistoryUseCase historyUseCase;
    private final DeleteSessionUseCase deleteSessionUseCase;

    @Operation(summary = "Gửi tin nhắn cho AI Career Advisor")
    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest req) {

        UUID userId = SecurityUtils.getCurrentUserIdOrThrow();

        SendMessageAIUseCase.Result result = sendMessageUseCase.execute(
                new SendMessageAIUseCase.Command(userId, req.sessionId(), req.content()));

        return ResponseEntity.ok(ApiResponse.success(
                ChatMessageResponse.from(result.reply(), result.sessionId())));
    }

    @Operation(summary = "Danh sách phiên chat")
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<PageResponse<ChatSessionResponse>>> listSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
        var pageable = PageRequest.of(page, size, Sort.by("lastMessageAt").descending());
        var result = historyUseCase.listSessions(userId, pageable)
                .map(ChatSessionResponse::fromSummary);

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Chi tiết phiên chat (kèm messages)")
    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> getSession(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
        ChatSession session = historyUseCase.getSession(id, userId);
        return ResponseEntity.ok(ApiResponse.success(ChatSessionResponse.fromDetail(session)));
    }

    @Operation(summary = "Xóa phiên chat")
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
        deleteSessionUseCase.execute(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Phiên chat đã được xóa."));
    }
}
