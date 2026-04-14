package edu.tlu.jobplatform.application.presentation;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.presentation.dto.request.SubmitApplicationRequest;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
import edu.tlu.jobplatform.application.usecase.candidate.GetMyApplicationsUseCase;
import edu.tlu.jobplatform.application.usecase.candidate.SubmitApplicationUseCase;
import edu.tlu.jobplatform.application.usecase.candidate.WithdrawApplicationUseCase;
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

import java.util.UUID;

/**
 * Candidate endpoints:
 * POST /api/v1/jobs/{jobPostId}/apply — Nộp đơn
 * GET /api/v1/applications/my — Danh sách đơn của tôi
 * GET /api/v1/applications/{id} — Chi tiết đơn
 * DELETE /api/v1/applications/{id}/withdraw — Rút đơn
 * GET /api/v1/jobs/{jobPostId}/my-application — Kiểm tra đã nộp chưa
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Application (Candidate)", description = "Ứng viên quản lý đơn ứng tuyển")
public class CandidateApplicationController {

        private final SubmitApplicationUseCase submitUseCase;
        private final WithdrawApplicationUseCase withdrawUseCase;
        private final GetMyApplicationsUseCase getMyAppsUseCase;
        private final ApplicationRepository applicationRepo;
        private final ApplicationStatusLogRepository logRepo;

        @Operation(summary = "Nộp đơn ứng tuyển")
        @PostMapping("/api/v1/jobs/{jobPostId}/apply")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> submit(
                        @PathVariable UUID jobPostId,
                        @Valid @RequestBody SubmitApplicationRequest req) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

                Application app = submitUseCase.execute(new SubmitApplicationUseCase.Command(
                                jobPostId, candidateId, req.getCvUrl(),
                                req.getCoverLetter(), req.getExpectedSalary()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(ApplicationResponse.from(app),
                                                "Đơn ứng tuyển đã được gửi thành công!"));
        }

        @Operation(summary = "Danh sách đơn ứng tuyển của tôi")
        @GetMapping("/api/v1/applications/my")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getMyApplications(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                var pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
                var result = getMyAppsUseCase.execute(candidateId, pageable)
                                .map(ApplicationResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết đơn ứng tuyển")
        @GetMapping("/api/v1/applications/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getDetail(@PathVariable UUID id) {
                Application app = applicationRepo.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));

                // Chỉ candidate hoặc employer của công ty mới được xem
                UUID currentUser = SecurityUtils.getCurrentUserIdOrThrow();
                boolean isOwner = app.getCandidateId().equals(currentUser)
                                || app.getCompanyId().equals(currentUser)
                                || SecurityUtils.hasRole("ADMIN");
                if (!isOwner)
                        throw new edu.tlu.jobplatform.shared.exception.BusinessRuleException(
                                        "Bạn không có quyền xem đơn này.", "FORBIDDEN");

                var logs = logRepo.findByApplicationId(id);
                return ResponseEntity.ok(ApiResponse.success(ApplicationDetailResponse.from(app, logs)));
        }

        @Operation(summary = "Rút đơn ứng tuyển")
        @DeleteMapping("/api/v1/applications/{id}/withdraw")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> withdraw(@PathVariable UUID id) {
                Application app = withdrawUseCase.execute(id);
                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app), "Đơn ứng tuyển đã được rút."));
        }

        @Operation(summary = "Kiểm tra đã nộp đơn vào bài đăng này chưa")
        @GetMapping("/api/v1/jobs/{jobPostId}/my-application")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<Boolean>> checkApplied(
                        @PathVariable UUID jobPostId) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

                boolean exists = applicationRepo.existsByJobPostIdAndCandidateId(jobPostId, candidateId);

                return ResponseEntity.ok(ApiResponse.success(exists));
        }
}