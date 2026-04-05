package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.job.application.usecase.employer.CreateJobPostUseCase;
import edu.tlu.jobplatform.job.application.usecase.employer.PublishJobPostUseCase;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.presentation.dto.request.CreateJobPostRequest;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostDetailResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
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

import java.util.List;
import java.util.UUID;

/**
 * Employer endpoints:
 * POST /api/v1/jobs — Tạo bài đăng (DRAFT)
 * GET /api/v1/jobs/my — Danh sách bài của tôi
 * GET /api/v1/jobs/{id} — Chi tiết bài đăng
 * POST /api/v1/jobs/{id}/publish — Publish bài đăng
 * POST /api/v1/jobs/{id}/close — Đóng bài đăng
 * DELETE /api/v1/jobs/{id} — Xóa bài đăng
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Job Post", description = "Quản lý bài đăng tuyển dụng")
public class JobPostController {

        private final CreateJobPostUseCase createUseCase;
        private final PublishJobPostUseCase publishUseCase;
        private final JobPostRepository jobPostRepository;

        @Operation(summary = "Tạo bài đăng tuyển dụng (DRAFT)")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/jobs")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> create(
                        @Valid @RequestBody CreateJobPostRequest req) {

                UUID companyId = resolveCompanyId(); // TODO: lấy từ CompanyRepository
                UUID postedBy = SecurityUtils.getCurrentUserIdOrThrow();

                Salary salary = req.isSalaryNegotiable()
                                ? Salary.negotiable()
                                : Salary.of(req.getSalaryMin(), req.getSalaryMax(), req.getSalaryCurrency());

                WorkLocation location = buildWorkLocation(req);

                // Map skills từ DTO → domain model
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

        @Operation(summary = "Danh sách bài đăng của tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/jobs/my")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> getMyJobs(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                UUID postedBy = SecurityUtils.getCurrentUserIdOrThrow();
                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = jobPostRepository.findByPostedBy(postedBy, pageable).map(JobPostResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Publish bài đăng")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/jobs/{id}/publish")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> publish(@PathVariable UUID id) {
                JobPost job = publishUseCase.execute(id);
                return ResponseEntity.ok(
                                ApiResponse.success(JobPostDetailResponse.from(job),
                                                "Bài đăng đã được publish thành công."));
        }

        @Operation(summary = "Đóng bài đăng")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/jobs/{id}/close")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> close(@PathVariable UUID id) {
                JobPost job = jobPostRepository.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", id));
                job.close();
                jobPostRepository.save(job);
                return ResponseEntity.ok(
                                ApiResponse.success(JobPostDetailResponse.from(job), "Bài đăng đã được đóng."));
        }

        // ── Helpers ───────────────────────────────────────────────

        private UUID resolveCompanyId() {
                // TODO Sprint 2: inject CompanyRepository, tìm bằng ownerId
                // Tạm thời: dùng mock UUID
                return UUID.randomUUID();
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