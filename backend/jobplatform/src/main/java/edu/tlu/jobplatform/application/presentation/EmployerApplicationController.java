package edu.tlu.jobplatform.application.presentation;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.presentation.dto.request.ScheduleInterviewRequest;
import edu.tlu.jobplatform.application.presentation.dto.request.UpdateStatusRequest;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
import edu.tlu.jobplatform.application.usecase.employer.GetApplicationsForJobUseCase;
import edu.tlu.jobplatform.application.usecase.employer.ScheduleInterviewUseCase;
import edu.tlu.jobplatform.application.usecase.employer.UpdateApplicationStatusUseCase;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.domain.service.CandidateInfoResolver;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Employer endpoints:
 * GET /api/v1/jobs/{jobPostId}/applications — Danh sách đơn của bài đăng
 * GET /api/v1/applications/{id} — Chi tiết (shared với candidate)
 * PATCH /api/v1/applications/{id}/status — Cập nhật trạng thái
 * POST /api/v1/applications/{id}/schedule-interview — Lên lịch phỏng vấn
 */
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

        @Operation(summary = "Danh sách đơn ứng tuyển của bài đăng")
        @GetMapping("/api/v1/jobs/{jobPostId}/applications")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getApplicationsForJob(
                        @PathVariable UUID jobPostId,
                        @RequestParam(required = false) ApplicationStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
                var appPage = getAppsUseCase.execute(jobPostId, status, pageable);

                // Batch resolve 1 query — tránh N+1
                Set<UUID> candidateIds = appPage.stream()
                                .map(Application::getCandidateId)
                                .collect(Collectors.toSet());
                Map<UUID, CandidateInfo> candidateMap = candidateInfoResolver.resolveAll(candidateIds);

                var result = appPage.map(app -> ApplicationResponse.from(app, candidateMap.get(app.getCandidateId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết đơn ứng tuyển (kèm lịch sử trạng thái)")
        @GetMapping("/api/v1/employer/applications/{id}")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getDetail(@PathVariable UUID id) {
                Application app = applicationRepo.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));
                var logs = logRepo.findByApplicationId(id);
                CandidateInfo candidateInfo = candidateInfoResolver.resolve(app.getCandidateId());

                return ResponseEntity.ok(ApiResponse.success(ApplicationDetailResponse.from(app, logs, candidateInfo)));
        }

        @Operation(summary = "Cập nhật trạng thái đơn ứng tuyển")
        @PatchMapping("/api/v1/applications/{id}/status")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateStatusRequest req) {

                Application app = updateStatusUseCase.execute(id, req.getStatus(), req.getNote());
                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app), "Đã cập nhật trạng thái."));
        }

        @Operation(summary = "Lên lịch phỏng vấn")
        @PostMapping("/api/v1/applications/{id}/schedule-interview")
        @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> scheduleInterview(
                        @PathVariable UUID id,
                        @Valid @RequestBody ScheduleInterviewRequest req) {

                Application app = scheduleInterviewUseCase.execute(id,
                                new ScheduleInterviewUseCase.Command(
                                                req.getScheduledAt(), req.getLocation(), req.getNote()));

                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app),
                                                "Đã lên lịch phỏng vấn. Email thông báo đã được gửi cho ứng viên."));
        }
}