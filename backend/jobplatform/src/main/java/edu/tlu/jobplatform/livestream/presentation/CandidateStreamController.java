package edu.tlu.jobplatform.livestream.presentation;

import edu.tlu.jobplatform.livestream.application.service.StreamViewerManager;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.GetSessionUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.GetStreamReplayUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.GetUpcomingStreamsUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.JoinLiveStreamUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.LeaveStreamUseCase; // ← THÊM
import edu.tlu.jobplatform.livestream.application.usecase.candidate.RespondToPollUseCase;
import edu.tlu.jobplatform.livestream.application.usecase.candidate.SubmitQAQuestionUseCase;
import edu.tlu.jobplatform.livestream.presentation.dto.request.*;
import edu.tlu.jobplatform.livestream.presentation.dto.response.*;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus; // ← THÊM
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/streams")
@RequiredArgsConstructor
@Tag(name = "Stream - Candidate", description = "Tham gia và tương tác trong phiên livestream")
public class CandidateStreamController {

        private final JoinLiveStreamUseCase joinUseCase;
        private final LeaveStreamUseCase leaveStreamUseCase; // ← THÊM
        private final SubmitQAQuestionUseCase submitQAUseCase;
        private final RespondToPollUseCase respondPollUseCase;
        private final GetStreamReplayUseCase replayUseCase;
        private final GetUpcomingStreamsUseCase upcomingUseCase;
        private final GetSessionUseCase getSessionUseCase;
        private final StreamViewerManager viewerManager;

        @Operation(summary = "Danh sách phiên stream cho Candidate", description = """
                        Public endpoint - không yêu cầu authentication.
                        Trả về danh sách phiên stream bao gồm:
                        - Tất cả phiên đang LIVE (đang phát trực tiếp)
                        - Phiên SCHEDULED trong 7 ngày tới
                        Thứ tự sắp xếp:
                        1. Phiên LIVE lên đầu
                        2. Phiên SCHEDULED theo thời gian gần nhất
                        """)
        @GetMapping("/upcoming")
        public ResponseEntity<ApiResponse<List<SessionResponse>>> getUpcoming() {
                List<SessionResponse> sessions = upcomingUseCase.execute()
                                .stream()
                                .map(SessionResponse::from)
                                .toList();
                return ResponseEntity.ok(ApiResponse.success(sessions));
        }

        @Operation(summary = "Tham gia xem stream", description = """
                        Yêu cầu role CANDIDATE.
                        Trả về LiveKit viewer token để kết nối LiveKit room.
                        Viewer count được cộng ngay từ bước này và publish realtime
                        tới /topic/stream/{sessionId}/events với type=VIEWER_COUNT_UPDATE.
                        WebSocket subscribe sau đó sẽ không tăng count thêm (dedup theo userId).
                        """)
        @PostMapping("/{sessionId}/join")
        @PreAuthorize("hasRole('CANDIDATE')")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<SessionJoinResponse>> joinStream(
                        @PathVariable UUID sessionId) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                JoinLiveStreamUseCase.Result result = joinUseCase.execute(sessionId, candidateId);

                return ResponseEntity.ok(ApiResponse.success(
                                new SessionJoinResponse(
                                                result.viewerToken(),
                                                result.livekitUrl(),
                                                result.currentViewerCount(),
                                                result.canPublish())));
        }

        @Operation(summary = "Rời phiên stream")
        @PostMapping("/{sessionId}/leave")
        // ← BỎ @PreAuthorize và @SecurityRequirement — Security config đã handle
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void leave(@PathVariable UUID sessionId, Authentication authentication) {
                if (authentication == null || !authentication.isAuthenticated()) {
                        return; // Anonymous → skip gracefully, không throw 403
                }
                try {
                        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                        leaveStreamUseCase.execute(sessionId, candidateId);
                } catch (Exception e) {
                        log.warn("Leave stream failed silently for session {}", sessionId, e);
                }
        }

        @Operation(summary = "Đặt câu hỏi Q&A", description = "Yêu cầu role CANDIDATE.")
        @PostMapping("/{sessionId}/questions")
        @PreAuthorize("hasRole('CANDIDATE')")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<Void>> submitQuestion(
                        @PathVariable UUID sessionId,
                        @Valid @RequestBody SubmitQARequest req) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                submitQAUseCase.execute(new SubmitQAQuestionUseCase.Command(
                                sessionId, candidateId, req.question()));
                return ResponseEntity.ok(ApiResponse.success(null));
        }

        @Operation(summary = "Lấy thông tin chi tiết phiên stream")
        @GetMapping("/{sessionId}")
        public ResponseEntity<ApiResponse<SessionResponse>> getSession(
                        @PathVariable UUID sessionId) {

                SessionResponse session = getSessionUseCase.execute(sessionId);
                return ResponseEntity.ok(ApiResponse.success(session));
        }

        @Operation(summary = "Trả lời poll")
        @PostMapping("/{sessionId}/polls/{pollEventId}/respond")
        @PreAuthorize("hasRole('CANDIDATE')")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<Void>> respondPoll(
                        @PathVariable UUID sessionId,
                        @PathVariable UUID pollEventId,
                        @Valid @RequestBody RespondPollRequest req) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                respondPollUseCase.execute(new RespondToPollUseCase.Command(
                                sessionId, candidateId, pollEventId, req.optionIndex()));
                return ResponseEntity.ok(ApiResponse.success(null));
        }

        @Operation(summary = "Lấy số lượng người xem hiện tại", description = "Fallback cho WebSocket mất kết nối.")
        @GetMapping("/{sessionId}/viewer-count")
        public ResponseEntity<ApiResponse<Integer>> getCurrentViewerCount(
                        @PathVariable UUID sessionId) {

                int count = viewerManager.getCurrentViewerCount(sessionId);
                return ResponseEntity.ok(ApiResponse.success(count));
        }
}