package edu.tlu.jobplatform.livestream.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.livestream.application.usecase.employer.*;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.vo.InterviewSlot;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.presentation.dto.request.*;
import edu.tlu.jobplatform.livestream.presentation.dto.response.*;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/streams")
@RequiredArgsConstructor
@PreAuthorize("hasRole('EMPLOYER')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Stream - Employer", description = "Quản lý phiên livestream tuyển dụng")
public class EmployerStreamController {

        private final CreateLiveStreamSessionUseCase createSessionUseCase;
        private final StartLiveStreamUseCase startStreamUseCase;
        private final EndLiveStreamUseCase endStreamUseCase;
        private final SpotlightJobPostUseCase spotlightJobUseCase;
        private final InviteCandidateToSlotUseCase inviteToSlotUseCase;
        private final LiveStreamSessionRepository sessionRepository;
        private final GetStreamAnalyticsUseCase getAnalyticsUseCase;
        // ── POST /api/v1/streams ──

        @Operation(summary = "Tạo phiên stream mới", description = "Tạo phiên JOB_FAIR hoặc INTERVIEW. Trạng thái ban đầu là SCHEDULED.")
        @PostMapping
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_CREATE_STREAM_SESSION", resourceType = "LiveStreamSession")
        public ResponseEntity<ApiResponse<SessionResponse>> createSession(
                        @Valid @RequestBody CreateSessionRequest req) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                UUID companyId = SecurityUtils.getCurrentUserIdOrThrow();

                CreateLiveStreamSessionUseCase.Command cmd = new CreateLiveStreamSessionUseCase.Command(
                                companyId, userId,
                                req.title(), req.description(),
                                req.sessionType(),
                                req.scheduledAt()
                                                .atZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                                                .toLocalDateTime(),
                                buildSlots(req));

                LiveStreamSession session = createSessionUseCase.execute(cmd);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(SessionResponse.from(session)));
        }

        // ── GET /api/v1/streams

        @Operation(summary = "Danh sách phiên stream của công ty")
        @GetMapping
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<List<SessionResponse>>> getMySessions() {
                UUID companyId = SecurityUtils.getCurrentUserIdOrThrow();
                List<SessionResponse> sessions = sessionRepository
                                .findByCompanyId(companyId)
                                .stream().map(SessionResponse::from).toList();
                return ResponseEntity.ok(ApiResponse.success(sessions));
        }

        // ── POST /api/v1/streams/{sessionId}/start

        @Operation(summary = "Bắt đầu live stream", description = "Chuyển SCHEDULED → LIVE. Trả về LiveKit host token để bật camera.")
        @PostMapping("/{sessionId}/start")
        @RateLimit(policy = "stream-lifecycle", scope = RateLimitPolicy.Scope.USER) // LiveKit token + state transition
        @Loggable(action = "EMPLOYER_START_STREAM", resourceType = "LiveStreamSession")
        public ResponseEntity<ApiResponse<SessionStartResponse>> startStream(
                        @PathVariable UUID sessionId) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                StartLiveStreamUseCase.Result result = startStreamUseCase.execute(sessionId, userId);
                return ResponseEntity.ok(ApiResponse.success(
                                new SessionStartResponse(result.hostToken(), result.livekitUrl())));
        }

        // ── POST /api/v1/streams/{sessionId}/end ──

        @Operation(summary = "Kết thúc live stream", description = "Chuyển LIVE → ENDED. Tự động trigger recording và AI summary async.")
        @PostMapping("/{sessionId}/end")
        @RateLimit(policy = "stream-lifecycle", scope = RateLimitPolicy.Scope.USER) // trigger recording + AI async
        @Loggable(action = "EMPLOYER_END_STREAM", resourceType = "LiveStreamSession")
        public ResponseEntity<ApiResponse<Void>> endStream(
                        @PathVariable UUID sessionId) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                endStreamUseCase.execute(sessionId, userId);
                return ResponseEntity.ok(ApiResponse.success(null, "Phiên stream đã kết thúc."));
        }

        // ── POST /api/v1/streams/{sessionId}/spotlight ─

        @Operation(summary = "Ghim job post lên stream", description = "Hiển thị CTA ứng tuyển trong khi đang LIVE. Push realtime tới tất cả viewer.")
        @PostMapping("/{sessionId}/spotlight")
        @RateLimit(policy = "stream-interact", scope = RateLimitPolicy.Scope.USER) // realtime push tới tất cả viewer
        @Loggable(action = "EMPLOYER_SPOTLIGHT_JOB", resourceType = "LiveStreamSession")
        public ResponseEntity<ApiResponse<Void>> spotlightJob(
                        @PathVariable UUID sessionId,
                        @Valid @RequestBody SpotlightJobRequest req) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                UUID companyId = SecurityUtils.getCurrentUserIdOrThrow();
                spotlightJobUseCase.execute(
                                new SpotlightJobPostUseCase.Command(sessionId, userId, req.jobPostId(), companyId));
                return ResponseEntity.ok(ApiResponse.success(null));
        }

        // ── POST /api/v1/streams/{sessionId}/invite-slot ──

        @Operation(summary = "Mời candidate vào interview slot", description = "Assign slot cho candidate. Candidate nhận thông báo realtime qua WebSocket.")
        @PostMapping("/{sessionId}/invite-slot")
        @RateLimit(policy = "stream-interact", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_INVITE_CANDIDATE_TO_SLOT", resourceType = "LiveStreamSession")
        public ResponseEntity<ApiResponse<InterviewSlot>> inviteToSlot(
                        @PathVariable UUID sessionId,
                        @Valid @RequestBody InviteToSlotRequest req) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                InterviewSlot slot = inviteToSlotUseCase.execute(
                                new InviteCandidateToSlotUseCase.Command(sessionId, userId, req.candidateId(),
                                                req.slotId()));
                return ResponseEntity.ok(ApiResponse.success(slot));
        }

        // ── Helper ─

        private List<InterviewSlot> buildSlots(CreateSessionRequest req) {
                if (req.interviewSlots() == null || req.interviewSlots().isEmpty())
                        return List.of();
                return req.interviewSlots().stream()
                                .map(s -> new InterviewSlot(
                                                UUID.randomUUID(), s.startTime(), s.durationMinutes(),
                                                null, InterviewSlot.SlotStatus.OPEN))
                                .toList();
        }

        @Operation(summary = "Thống kê phiên stream", description = "Lấy analytics sau khi stream ENDED.")
        @GetMapping("/{sessionId}/analytics")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<StreamAnalyticsResponse>> getAnalytics(
                        @PathVariable UUID sessionId) {

                UUID companyId = SecurityUtils.getCurrentUserIdOrThrow();
                StreamAnalyticsResponse response = getAnalyticsUseCase.execute(sessionId, companyId);
                return ResponseEntity.ok(ApiResponse.success(response));
        }
}