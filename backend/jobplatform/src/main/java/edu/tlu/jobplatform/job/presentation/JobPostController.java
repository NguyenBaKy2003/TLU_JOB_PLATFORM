package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.job.application.usecase.employer.*;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.presentation.dto.request.CreateJobPostRequest;
import edu.tlu.jobplatform.job.presentation.dto.request.UpdateJobPostRequest;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostDetailResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller: Employer quản lý tin tuyển dụng.
 *
 * Base path: /api/v1/jobs
 *
 * GET /my — Lấy danh sách tin của mình
 * POST / — Tạo tin mới (DRAFT)
 * PUT /{id} — Cập nhật tin
 * POST /{id}/publish — Publish tin (trừ quota)
 * POST /{id}/close — Đóng tin
 * DELETE /{id} — Xoá tin (soft delete)
 */
@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Job Posts (Employer)", description = "Employer quản lý tin tuyển dụng")
public class JobPostController {

    private final CreateJobPostUseCase createJobPostUseCase;
    private final UpdateJobPostUseCase updateJobPostUseCase;
    private final PublishJobPostUseCase publishJobPostUseCase;
    private final CloseJobPostUseCase closeJobPostUseCase;
    private final GetMyJobPostsUseCase getMyJobPostsUseCase;

    // ── GET /my ───────────────────────────────────────────────

    @GetMapping("/my")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Lấy danh sách tin tuyển dụng của công ty")
    public ResponseEntity<ApiResponse<List<JobPostResponse>>> getMyJobs(
            @AuthenticationPrincipal UUID companyId,
            @RequestParam(required = false) JobStatus status) {

        List<JobPostResponse> jobs = getMyJobPostsUseCase.execute(companyId, status)
                .stream().map(JobPostResponse::from).toList();

        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    // ── POST / ────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Tạo tin tuyển dụng mới (DRAFT)")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> createJob(
            @AuthenticationPrincipal UUID companyId,
            @Valid @RequestBody CreateJobPostRequest request) {

        CreateJobPostUseCase.Command cmd = new CreateJobPostUseCase.Command(
                companyId, companyId,
                request.title(), request.description(),
                request.requirements(), request.benefits(),
                request.categoryCode(), request.level(), request.jobType(),
                request.headcount(),
                request.salaryNegotiate(), request.salaryMin(),
                request.salaryMax(), request.currency(),
                request.workLocationType(), request.city(), request.address(),
                request.deadline());

        JobPost job = createJobPostUseCase.execute(cmd);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(JobPostDetailResponse.from(job)));
    }

    // ── PUT /{id} ─────────────────────────────────────────────

    @PutMapping("/{jobPostId}")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Cập nhật tin tuyển dụng")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> updateJob(
            @AuthenticationPrincipal UUID companyId,
            @PathVariable UUID jobPostId,
            @Valid @RequestBody UpdateJobPostRequest request) {

        List<UpdateJobPostUseCase.SkillCommand> skills = null;
        if (request.skills() != null) {
            skills = request.skills().stream()
                    .map(s -> new UpdateJobPostUseCase.SkillCommand(
                            s.skillName(), s.required(), s.yearsRequired()))
                    .toList();
        }

        UpdateJobPostUseCase.Command cmd = new UpdateJobPostUseCase.Command(
                request.title(), request.description(),
                request.requirements(), request.benefits(),
                request.categoryCode(), request.level(), request.jobType(),
                request.headcount(),
                request.salaryNegotiate(), request.salaryMin(),
                request.salaryMax(), request.currency(),
                request.workLocationType(), request.city(), request.address(),
                request.deadline(), skills);

        JobPost job = updateJobPostUseCase.execute(jobPostId, companyId, cmd);
        return ResponseEntity.ok(ApiResponse.success(JobPostDetailResponse.from(job)));
    }

    // ── POST /{id}/publish ────────────────────────────────────

    @PostMapping("/{jobPostId}/publish")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Publish tin tuyển dụng (trừ quota)")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> publishJob(
            @AuthenticationPrincipal UUID companyId,
            @PathVariable UUID jobPostId,
            @RequestParam(defaultValue = "false") boolean featured) {

        JobPost job = publishJobPostUseCase.execute(jobPostId, companyId, featured);
        return ResponseEntity.ok(ApiResponse.success(JobPostDetailResponse.from(job)));
    }

    // ── POST /{id}/close ──────────────────────────────────────

    @PostMapping("/{jobPostId}/close")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Đóng tin tuyển dụng")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> closeJob(
            @AuthenticationPrincipal UUID companyId,
            @PathVariable UUID jobPostId) {

        JobPost job = closeJobPostUseCase.execute(jobPostId, companyId);
        return ResponseEntity.ok(ApiResponse.success(JobPostDetailResponse.from(job)));
    }
}