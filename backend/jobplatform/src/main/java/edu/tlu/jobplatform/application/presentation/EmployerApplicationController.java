package edu.tlu.jobplatform.application.presentation;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.domain.service.CandidateInfoResolver;
import edu.tlu.jobplatform.application.domain.service.JobPostInfoResolver;
import edu.tlu.jobplatform.application.presentation.dto.request.ScheduleInterviewRequest;
import edu.tlu.jobplatform.application.presentation.dto.request.UpdateStatusRequest;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse.JobInfo;
import edu.tlu.jobplatform.application.usecase.employer.GetApplicationsForJobUseCase;
import edu.tlu.jobplatform.application.usecase.employer.ScheduleInterviewUseCase;
import edu.tlu.jobplatform.application.usecase.employer.UpdateApplicationStatusUseCase;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Application (Employer)", description = "Nhà tuyển dụng quản lý đơn ứng tuyển")
public class EmployerApplicationController {

        private final GetApplicationsForJobUseCase getAppsUseCase;
        private final UpdateApplicationStatusUseCase updateStatusUseCase;
        private final ScheduleInterviewUseCase scheduleInterviewUseCase;
        private final ApplicationRepository applicationRepo;
        private final ApplicationStatusLogRepository logRepo;
        private final CandidateInfoResolver candidateInfoResolver;
        private final JobPostInfoResolver jobPostInfoResolver;
        private final CompanyRepository companyRepository;

        @Operation(summary = "Danh sách đơn ứng tuyển của bài đăng")
        @GetMapping("/api/v1/jobs/{jobPostId}/applications")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getApplicationsForJob(
                        @PathVariable UUID jobPostId,
                        @RequestParam(required = false) ApplicationStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size);
                var appPage = getAppsUseCase.execute(jobPostId, status, pageable);

                Set<UUID> candidateIds = appPage.stream()
                                .map(Application::getCandidateId)
                                .collect(Collectors.toSet());
                Map<UUID, CandidateInfo> candidateMap = candidateInfoResolver.resolveAll(candidateIds);

                var result = appPage.map(app -> ApplicationResponse.from(
                                app, candidateMap.get(app.getCandidateId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết đơn ứng tuyển (kèm lịch sử trạng thái)")

        @GetMapping("/api/v1/employer/applications/{id}")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getDetail(@PathVariable UUID id) {
                Application app = applicationRepo.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));

                var logs = logRepo.findByApplicationId(id);
                CandidateInfo candidateInfo = candidateInfoResolver.resolve(app.getCandidateId());

                return ResponseEntity.ok(ApiResponse.success(
                                ApplicationDetailResponse.from(app, logs, candidateInfo)));
        }

        @Operation(summary = "Cập nhật trạng thái đơn ứng tuyển")
        @PatchMapping("/api/v1/employer/applications/{id}/status")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_APPLICATION_STATUS", resourceType = "Application")
        public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateStatusRequest req) {

                Application app = updateStatusUseCase.execute(id, req.getStatus(), req.getNote());
                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app), "Đã cập nhật trạng thái."));
        }

        @Operation(summary = "Lên lịch phỏng vấn")
        @PostMapping("/api/v1/employer/applications/{id}/schedule-interview")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_SCHEDULE_INTERVIEW", resourceType = "Application")
        public ResponseEntity<ApiResponse<ApplicationResponse>> scheduleInterview(
                        @PathVariable UUID id,
                        @Valid @RequestBody ScheduleInterviewRequest req) {

                Application app = scheduleInterviewUseCase.execute(id,
                                new ScheduleInterviewUseCase.Command(
                                                req.getScheduledAt(), req.getLocation(), req.getNote()));

                return ResponseEntity.ok(ApiResponse.success(ApplicationResponse.from(app),
                                "Đã lên lịch phỏng vấn. Email thông báo đã được gửi cho ứng viên."));
        }

        @Operation(summary = "Lấy ra toàn bộ đơn ứng tuyển của công ty")
        @GetMapping("/api/v1/employer/applications")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getAllApplicationsForCompany(
                        @RequestParam(required = false) ApplicationStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                UUID companyId = resolveCompanyId();

                // Sort bị loại bỏ — JPQL tự xử lý boost first, rồi appliedAt DESC
                var pageable = PageRequest.of(page, size);
                var appPage = status != null
                                ? applicationRepo.findByCompanyIdAndStatusOrderByBoostFirst(companyId, status, pageable)
                                : applicationRepo.findByCompanyIdOrderByBoostFirst(companyId, pageable);

                Set<UUID> candidateIds = appPage.stream()
                                .map(Application::getCandidateId)
                                .collect(Collectors.toSet());
                Set<UUID> jobPostIds = appPage.stream()
                                .map(Application::getJobPostId)
                                .collect(Collectors.toSet());

                Map<UUID, CandidateInfo> candidateMap = candidateInfoResolver.resolveAll(candidateIds);
                Map<UUID, JobInfo> jobMap = jobPostInfoResolver.resolveAll(jobPostIds);

                var result = appPage.map(app -> ApplicationResponse.from(
                                app,
                                candidateMap.get(app.getCandidateId()),
                                jobMap.get(app.getJobPostId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        private UUID resolveCompanyId() {
                UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Company not found for owner: " + ownerId))
                                .getId();
        }
}