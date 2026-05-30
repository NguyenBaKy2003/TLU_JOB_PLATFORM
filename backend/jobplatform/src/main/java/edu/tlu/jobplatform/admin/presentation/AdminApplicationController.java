package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminApplicationUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.OverrideStatusRequest;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * GET /api/v1/admin/applications — Tất cả đơn (filter status + keyword)
 * GET /api/v1/admin/applications/company/{companyId} — Đơn theo công ty
 * GET /api/v1/admin/applications/job/{jobPostId} — Đơn theo bài đăng
 * GET /api/v1/admin/applications/{id} — Chi tiết
 * GET /api/v1/admin/applications/{id}/status-logs — Lịch sử status
 * PATCH /api/v1/admin/applications/{id}/override-status — Override
 * (ADMIN)
 * POST /api/v1/admin/applications/cancel-by-job/{jobPostId} — Cancel tất cả
 * (ADMIN)
 */
@RestController
@RequestMapping("/api/v1/admin/applications")
@RequiredArgsConstructor
@Tag(name = "Admin - Applications")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminApplicationController {

        private final AdminApplicationUseCase adminApplicationUseCase;

        @Operation(summary = "Tất cả đơn ứng tuyển trong hệ thống", description = "Lọc theo status và tìm kiếm theo tên/email ứng viên, tên bài đăng.")
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> listAll(
                        @Parameter(description = "Lọc trạng thái") @RequestParam(required = false) ApplicationStatus status,
                        @Parameter(description = "Tìm theo tên/email ứng viên hoặc tiêu đề bài đăng") @RequestParam(required = false) String keyword,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
                var result = adminApplicationUseCase.listAll(status, keyword, pageable)
                                .map(ApplicationResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Đơn ứng tuyển theo công ty")
        @GetMapping("/company/{companyId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> listByCompany(
                        @PathVariable UUID companyId,
                        @RequestParam(required = false) ApplicationStatus status,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
                var result = adminApplicationUseCase.listByCompany(companyId, status, keyword, pageable)
                                .map(ApplicationResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Đơn ứng tuyển theo bài đăng")
        @GetMapping("/job/{jobPostId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> listByJob(
                        @PathVariable UUID jobPostId,
                        @RequestParam(required = false) ApplicationStatus status,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
                var result = adminApplicationUseCase.listByJob(jobPostId, status, keyword, pageable)
                                .map(ApplicationResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết đơn ứng tuyển")
        @GetMapping("/{id}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getById(@PathVariable UUID id) {
                var app = adminApplicationUseCase.getById(id);
                var logs = adminApplicationUseCase.getStatusLogs(id);
                return ResponseEntity.ok(ApiResponse.success(ApplicationDetailResponse.from(app, logs)));
        }

        @Operation(summary = "Lịch sử thay đổi trạng thái")
        @GetMapping("/{id}/status-logs")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<List<ApplicationStatusLog>>> getStatusLogs(
                        @PathVariable UUID id) {
                return ResponseEntity.ok(
                                ApiResponse.success(adminApplicationUseCase.getStatusLogs(id)));
        }

        @Operation(summary = "Override trạng thái đơn — ADMIN, dùng khi có tranh chấp")
        @PatchMapping("/{id}/override-status")
        @PreAuthorize("hasRole('ADMIN')")
        @RateLimit(policy = "admin-sensitive", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_OVERRIDE_APPLICATION_STATUS", resourceType = "Application")
        public ResponseEntity<ApiResponse<ApplicationResponse>> overrideStatus(
                        @PathVariable UUID id,
                        @Valid @RequestBody OverrideStatusRequest req) {

                var app = adminApplicationUseCase.overrideStatus(id, req.getStatus(), req.getReason());
                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app), "Trạng thái đã được cập nhật."));
        }

        @Operation(summary = "Cancel toàn bộ đơn của 1 bài đăng — ADMIN")
        @PostMapping("/cancel-by-job/{jobPostId}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<String>> cancelByJob(
                        @PathVariable UUID jobPostId,
                        @RequestParam String reason) {

                int count = adminApplicationUseCase.cancelAllForJob(jobPostId, reason);
                return ResponseEntity.ok(ApiResponse.success(count + " đơn đã được cancel."));
        }
}