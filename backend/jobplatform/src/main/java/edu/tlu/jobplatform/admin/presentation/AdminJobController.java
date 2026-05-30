package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminJobUseCase;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.audit.Loggable;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints:
 * GET /api/v1/admin/jobs — Danh sách theo status
 * POST /api/v1/admin/jobs/{id}/close — Force-close vi phạm
 * DELETE /api/v1/admin/jobs/{id} — Force-delete vi phạm
 */
@RestController
@RequestMapping("/api/v1/admin/jobs")
@RequiredArgsConstructor
@Tag(name = "Admin - Jobs", description = "Quản lý bài đăng")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminJobController {

    private final AdminJobUseCase adminJobUseCase;

    @Operation(summary = "Danh sách bài đăng theo status")
    @GetMapping
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> listJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = adminJobUseCase.listByStatus(status, pageable)
                .map(JobPostResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Force-close bài vi phạm")
    @PostMapping("/{id}/close")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_FORCE_CLOSE_JOB", resourceType = "JobPost")
    public ResponseEntity<ApiResponse<JobPostResponse>> forceClose(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "Vi phạm chính sách") String reason) {

        var job = adminJobUseCase.forceClose(id, reason);
        return ResponseEntity.ok(
                ApiResponse.success(JobPostResponse.from(job), "Bài đăng đã bị đóng."));
    }

    @Operation(summary = "Force-delete bài vi phạm")
    @DeleteMapping("/{id}")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_FORCE_DELETE_JOB", resourceType = "JobPost")
    public ResponseEntity<ApiResponse<Void>> forceDelete(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "Vi phạm chính sách") String reason) {

        adminJobUseCase.forceDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Bài đăng đã bị xóa."));
    }
}
