package edu.tlu.jobplatform.auditlog.presentation;

import edu.tlu.jobplatform.auditlog.application.usecase.GetResourceAuditLogsUseCase;
import edu.tlu.jobplatform.auditlog.application.usecase.GetSystemAuditLogsUseCase;
import edu.tlu.jobplatform.auditlog.application.usecase.GetUserAuditLogsUseCase;
import edu.tlu.jobplatform.auditlog.presentation.dto.AuditLogResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
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
import java.util.Map;
import java.util.UUID;

/**
 * Endpoints:
 * GET /api/v1/admin/audit-logs — toàn bộ log, filter đa điều kiện
 * GET /api/v1/admin/audit-logs/user/{userId} — log của 1 user
 * GET /api/v1/admin/audit-logs/resource/{type}/{id} — log của 1 entity
 * GET /api/v1/admin/audit-logs/stats — thống kê action counts
 */
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Log - Admin", description = "Quản trị lịch sử hành động hệ thống")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminAuditLogController {

        private final GetSystemAuditLogsUseCase getSystemLogsUseCase;
        private final GetUserAuditLogsUseCase getUserLogsUseCase;
        private final GetResourceAuditLogsUseCase getResourceLogsUseCase;

        // ── GET / ────────

        @Operation(summary = "Toàn bộ audit log hệ thống", description = """
                        Filter theo actorId, action, resourceType, result (SUCCESS/FAILURE), khoảng thời gian.
                        Tất cả filter là optional — không truyền = lấy tất cả.
                        """)
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> listAll(
                        @RequestParam(required = false) String actorId,
                        @RequestParam(required = false) String action,
                        @RequestParam(required = false) String resourceType,
                        @RequestParam(required = false) String result,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
                var logs = getSystemLogsUseCase
                                .execute(actorId, action, resourceType, result, from, to, pageable)
                                .map(AuditLogResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(logs)));
        }

        // ── GET /user/{userId} ────────────────────────────────────────────

        @Operation(summary = "Audit log của 1 user cụ thể")
        @GetMapping("/user/{userId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getByUser(
                        @PathVariable UUID userId,
                        @RequestParam(required = false) String action,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
                var logs = getUserLogsUseCase
                                .execute(userId, action, pageable)
                                .map(AuditLogResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(logs)));
        }

        // ── GET /resource/{type}/{id} ─────────────────────────────────────

        @Operation(summary = "Audit log của 1 entity cụ thể", description = """
                        Xem toàn bộ thay đổi của một entity theo thời gian.

                        Ví dụ:
                        - `/resource/JobPost/550e8400-...`    — mọi thay đổi của 1 job post
                        - `/resource/Application/550e8400-...` — timeline trạng thái đơn ứng tuyển
                        - `/resource/User/550e8400-...`        — lịch sử tài khoản user
                        """)
        @GetMapping("/resource/{resourceType}/{resourceId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getByResource(
                        @PathVariable String resourceType,
                        @PathVariable UUID resourceId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
                var logs = getResourceLogsUseCase
                                .execute(resourceType, resourceId.toString(), pageable)
                                .map(AuditLogResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(logs)));
        }

        // ── GET /stats ───

        @Operation(summary = "Thống kê action counts", description = """
                        Đếm số lần xuất hiện của từng action trong khoảng thời gian.
                        Mặc định: 7 ngày gần nhất.

                        Response example:
                        ```json
                        {
                          "USER_LOGIN": 1240,
                          "CANDIDATE_SUBMIT_APPLICATION": 380,
                          "EMPLOYER_CREATE_JOB_POST": 95,
                          "ADMIN_APPROVE_COMPANY": 12
                        }
                        ```
                        """)
        @GetMapping("/stats")
        @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<Map<String, Long>>> getStats(
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

                LocalDateTime start = from != null ? from : LocalDateTime.now().minusDays(7);
                LocalDateTime end = to != null ? to : LocalDateTime.now();

                return ResponseEntity.ok(ApiResponse.success(
                                getSystemLogsUseCase.countByAction(start, end)));
        }
}