package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.application.usecase.employer.CloseJobPostUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.CreateJobPostUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.DeleteJobPostUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.GetMyJobCountsUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.GetMyJobPostsUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.SubmitForReviewUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.UpdateJobPostUseCase;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.presentation.dto.request.CreateJobPostRequest;
import edu.tlu.jobplatform.job.presentation.dto.request.PublishJobPostRequest;
import edu.tlu.jobplatform.job.presentation.dto.request.UpdateJobPostRequest;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostDetailResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.SubmitForReviewResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Employer endpoints:
 * POST /api/v1/jobs — Tạo bài đăng (DRAFT)
 * GET /api/v1/jobs/my — Danh sách bài của tôi (paginated + filtered)
 * GET /api/v1/jobs/my/counts — Số lượng bài theo trạng thái (lightweight)
 * PATCH /api/v1/jobs/{id} — Cập nhật bài đăng
 * POST /api/v1/jobs/{id}/submit — Nộp kiểm duyệt
 * POST /api/v1/jobs/{id}/close — Đóng bài đăng
 * DELETE /api/v1/jobs/{id} — Xóa bài đăng
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Job Post", description = "Quản lý bài đăng tuyển dụng")
public class JobPostController {

        private final CreateJobPostUseCase createUseCase;
        private final CompanyRepository companyRepository;
        private final CloseJobPostUseCase closeUseCase;
        private final DeleteJobPostUseCase deleteUseCase;
        private final UpdateJobPostUseCase updateUseCase;
        private final SubmitForReviewUseCase submitForReviewUseCase;
        private final GetMyJobPostsUseCase getMyJobPostsUseCase;
        private final GetMyJobCountsUseCase getMyJobCountsUseCase; // ← thêm

        // ── Create ────────────────────────────────────────────────────────────────

        @Operation(summary = "Tạo bài đăng tuyển dụng (DRAFT)")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/jobs")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_CREATE_JOB_POST", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> create(
                        @Valid @RequestBody CreateJobPostRequest req) {

                UUID companyId = resolveCompanyId();
                UUID postedBy = SecurityUtils.getCurrentUserIdOrThrow();

                Salary salary = req.isSalaryNegotiable()
                                ? Salary.negotiable()
                                : Salary.of(req.getSalaryMin(), req.getSalaryMax(), req.getSalaryCurrency());

                WorkLocation location = buildWorkLocation(req);

                List<JobPostSkill> skills = req.getSkills() == null ? List.of()
                                : req.getSkills().stream()
                                                .map(s -> JobPostSkill.builder()
                                                                .skillName(s.getSkillName())
                                                                .level(s.getLevel())
                                                                .required(s.isRequired())
                                                                .build())
                                                .toList();

                JobPost job = createUseCase.execute(new CreateJobPostUseCase.Command(
                                companyId, postedBy, req.getTitle(), req.getDescription(),
                                req.getRequirements(), req.getBenefits(), req.getJobType(),
                                req.getLevel(), req.getCategory(), salary, location,
                                req.getExperienceYears(), req.getVacancies(), req.getDeadline(),
                                skills));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(JobPostDetailResponse.from(job),
                                                "Bài đăng đã được tạo ở trạng thái Nháp."));
        }

        // ── List my jobs (paginated) ──────────────────────────────────────────────

        @Operation(summary = "Danh sách bài đăng của tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/jobs/my")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> getMyJobs(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) JobStatus status,
                        @RequestParam(required = false) LocalDateTime createdAtFrom,
                        @RequestParam(required = false) LocalDateTime createdAtTo) {

                UUID postedBy = SecurityUtils.getCurrentUserIdOrThrow();
                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

                var result = getMyJobPostsUseCase.execute(
                                new GetMyJobPostsUseCase.Query(postedBy, keyword, status, createdAtFrom, createdAtTo),
                                pageable).map(JobPostResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        // ── Count my jobs by status (lightweight) ─────────────────────────────────

        /**
         * GET /api/v1/jobs/my/counts
         *
         * Trả về số lượng bài đăng theo từng trạng thái — endpoint nhẹ, không phân
         * trang.
         * FE dùng để hiển thị badge trên tab và JobStatsRow mà không cần load 200
         * entity.
         *
         * Response example:
         * {
         * "total": 42,
         * "PUBLISHED": 20, "PENDING_REVIEW": 3, "REJECTED": 2,
         * "DRAFT": 10, "CLOSED": 5, "EXPIRED": 2
         * }
         */
        @Operation(summary = "Số lượng bài đăng theo trạng thái")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/jobs/my/counts")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<Map<String, Long>>> getMyJobCounts() {
                UUID postedBy = SecurityUtils.getCurrentUserIdOrThrow();
                Map<String, Long> counts = getMyJobCountsUseCase.execute(postedBy);
                return ResponseEntity.ok(ApiResponse.success(counts));
        }

        // ── Submit for review ─────────────────────────────────────────────────────

        @Operation(summary = "Nộp bài đăng để kiểm duyệt")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/jobs/{id}/submit")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_SUBMIT_JOB_FOR_REVIEW", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<SubmitForReviewResponse>> submit(
                        @PathVariable UUID id,
                        @RequestBody(required = false) PublishJobPostRequest req) {

                boolean featured = req != null && req.featured();
                SubmitForReviewUseCase.Result result = submitForReviewUseCase
                                .execute(new SubmitForReviewUseCase.Command(id, featured));

                JobPost job = result.jobPost();
                JdGuidelineCheckResult check = result.checkResult();

                String message = switch (job.getStatus()) {
                        case PUBLISHED -> featured
                                        ? "Bài đăng đã được duyệt và publish dưới dạng tin nổi bật."
                                        : "Bài đăng đã được duyệt và publish thành công.";
                        case REJECTED -> "Bài đăng bị từ chối. Vui lòng xem lý do và chỉnh sửa lại.";
                        default -> "Đã nhận yêu cầu kiểm duyệt.";
                };

                return ResponseEntity.ok(ApiResponse.success(
                                SubmitForReviewResponse.from(job, check), message));
        }

        // ── Update ────────────────────────────────────────────────────────────────

        @Operation(summary = "Cập nhật bài đăng")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping("/api/v1/jobs/{id}")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_JOB_POST", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> update(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateJobPostRequest req) {

                Salary salary = null;
                if (req.getSalaryNegotiable() != null || req.getSalaryMin() != null || req.getSalaryMax() != null) {
                        salary = Boolean.TRUE.equals(req.getSalaryNegotiable())
                                        ? Salary.negotiable()
                                        : Salary.of(req.getSalaryMin(), req.getSalaryMax(), req.getSalaryCurrency());
                }

                WorkLocation location = null;
                if (req.getWorkLocationType() != null) {
                        location = WorkLocation.builder()
                                        .type(WorkLocation.LocationType.valueOf(req.getWorkLocationType()))
                                        .city(req.getWorkLocationCity())
                                        .address(req.getWorkLocationAddress())
                                        .build();
                }

                List<JobPostSkill> skills = null;
                if (req.getSkills() != null) {
                        skills = req.getSkills().stream()
                                        .map(s -> JobPostSkill.builder()
                                                        .skillName(s.getSkillName())
                                                        .level(s.getLevel())
                                                        .required(s.isRequired())
                                                        .build())
                                        .toList();
                }

                JobPost job = updateUseCase.execute(id, new UpdateJobPostUseCase.Command(
                                req.getTitle(), null,
                                req.getDescription(), req.getRequirements(), req.getBenefits(),
                                req.getJobType(), req.getLevel(), req.getCategory(),
                                salary, location,
                                req.getExperienceYears(), req.getVacancies(), req.getDeadline(),
                                skills));

                return ResponseEntity.ok(ApiResponse.success(JobPostDetailResponse.from(job), "Cập nhật thành công."));
        }

        // ── Close ─────────────────────────────────────────────────────────────────

        @Operation(summary = "Đóng bài đăng")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/jobs/{id}/close")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_CLOSE_JOB_POST", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> close(@PathVariable UUID id) {
                JobPost job = closeUseCase.execute(id);
                return ResponseEntity.ok(
                                ApiResponse.success(JobPostDetailResponse.from(job), "Bài đăng đã được đóng."));
        }

        // ── Delete ────────────────────────────────────────────────────────────────

        @Operation(summary = "Xóa bài đăng (soft delete)")
        @SecurityRequirement(name = "bearerAuth")
        @DeleteMapping("/api/v1/jobs/{id}")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_DELETE_JOB_POST", resourceType = "JobPost")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
                deleteUseCase.execute(id);
                return ResponseEntity.ok(ApiResponse.success(null, "Bài đăng đã được xóa."));
        }

        // ── Helpers ───────────────────────────────────────────────────────────────

        private UUID resolveCompanyId() {
                UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Company not found for owner: " + ownerId))
                                .getId();
        }

        private WorkLocation buildWorkLocation(CreateJobPostRequest req) {
                if (req.getWorkLocationType() == null)
                        return null;
                return WorkLocation.builder()
                                .type(WorkLocation.LocationType.valueOf(req.getWorkLocationType()))
                                .city(req.getWorkLocationCity())
                                .address(req.getWorkLocationAddress())
                                .build();
        }
}