package edu.tlu.jobplatform.auditlog.presentation;

import edu.tlu.jobplatform.auditlog.application.usecase.GetMyAuditLogsUseCase;
import edu.tlu.jobplatform.auditlog.presentation.dto.AuditLogResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Log - Me", description = "Lịch sử hành động của tài khoản")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class MyAuditLogController {

        private final GetMyAuditLogsUseCase getMyLogsUseCase;

        @Operation(summary = "Lịch sử hành động của tôi", description = """
                        Trả về các action do chính tài khoản thực hiện.

                        Ví dụ action: `USER_LOGIN`, `CANDIDATE_SUBMIT_APPLICATION`,
                        `CANDIDATE_UPLOAD_CV`, `EMPLOYER_CREATE_JOB_POST`...

                        **Lưu ý:** Chỉ xem được log của chính mình.
                        Admin muốn xem log của user khác → dùng `/api/v1/admin/audit-logs/user/{userId}`.
                        """)
        @GetMapping
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getMyLogs(
                        @RequestParam(required = false) String action,
                        @RequestParam(required = false) String resourceType,
                        @RequestParam(required = false) String result,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                UUID actorId = SecurityUtils.getCurrentUserIdOrThrow();
                var pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());

                var logs = getMyLogsUseCase
                                .execute(actorId, action, resourceType, from, to, pageable)
                                .map(AuditLogResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(logs)));
        }
}