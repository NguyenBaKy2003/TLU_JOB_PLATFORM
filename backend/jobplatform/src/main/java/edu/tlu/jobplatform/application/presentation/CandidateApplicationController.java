package edu.tlu.jobplatform.application.presentation;

import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.domain.service.CompanyInfoResolver;
import edu.tlu.jobplatform.application.domain.service.JobPostInfoResolver;
import edu.tlu.jobplatform.application.presentation.dto.request.SubmitApplicationRequest;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse.CompanyInfo;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse.JobInfo;
import edu.tlu.jobplatform.application.usecase.candidate.AcceptOfferUseCase;
import edu.tlu.jobplatform.application.usecase.candidate.DeclineOfferUseCase;
import edu.tlu.jobplatform.application.usecase.candidate.GetMyApplicationsUseCase;
import edu.tlu.jobplatform.application.usecase.candidate.SubmitApplicationUseCase;
import edu.tlu.jobplatform.application.usecase.candidate.WithdrawApplicationUseCase;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Application (Candidate)", description = "Ứng viên quản lý đơn ứng tuyển")
public class CandidateApplicationController {

        private final SubmitApplicationUseCase submitUseCase;
        private final WithdrawApplicationUseCase withdrawUseCase;
        private final GetMyApplicationsUseCase getMyAppsUseCase;
        private final ApplicationRepository applicationRepo;
        private final ApplicationStatusLogRepository logRepo;
        private final JobPostInfoResolver jobPostInfoResolver;
        private final CompanyInfoResolver companyInfoResolver;
        private final AcceptOfferUseCase acceptOfferUseCase;
        private final DeclineOfferUseCase declineOfferUseCase;
        private final TrackCandidateBehaviorUseCase trackUseCase;

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

                trackUseCase.trackJobApply(candidateId, jobPostId);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(ApplicationResponse.from(app),
                                                "Đơn ứng tuyển đã được gửi thành công!"));
        }

        @Operation(summary = "Danh sách đơn ứng tuyển của tôi")
        @GetMapping("/api/v1/candidate/applications/my")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<PageResponse<ApplicationResponse>>> getMyApplications(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                var pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
                var appPage = getMyAppsUseCase.execute(candidateId, pageable);

                Set<UUID> jobPostIds = appPage.stream()
                                .map(Application::getJobPostId)
                                .collect(Collectors.toSet());

                Set<UUID> companyIds = appPage.stream()
                                .map(Application::getCompanyId)
                                .collect(Collectors.toSet());

                Map<UUID, JobInfo> jobMap = jobPostInfoResolver.resolveAll(jobPostIds);
                Map<UUID, CompanyInfo> companyMap = companyInfoResolver.resolveAll(companyIds);

                var result = appPage.map(app -> ApplicationResponse.from(
                                app,
                                null,
                                jobMap.get(app.getJobPostId()),
                                companyMap.get(app.getCompanyId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết đơn ứng tuyển")
        @GetMapping("/api/v1/applications/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getDetail(@PathVariable UUID id) {

                Application app = applicationRepo.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));

                UUID currentUser = SecurityUtils.getCurrentUserIdOrThrow();
                boolean isOwner = app.getCandidateId().equals(currentUser)
                                || app.getCompanyId().equals(currentUser)
                                || SecurityUtils.hasRole("ADMIN");
                if (!isOwner)
                        throw new BusinessRuleException("Bạn không có quyền xem đơn này.", "FORBIDDEN");

                var logs = logRepo.findByApplicationId(id);

                JobInfo jobInfo = jobPostInfoResolver
                                .resolveAll(Set.of(app.getJobPostId()))
                                .get(app.getJobPostId());

                CompanyInfo companyInfo = companyInfoResolver
                                .resolveAll(Set.of(app.getCompanyId()))
                                .get(app.getCompanyId());

                return ResponseEntity.ok(ApiResponse.success(
                                ApplicationDetailResponse.from(app, logs, jobInfo, companyInfo)));
        }

        /**
         * Rút đơn ứng tuyển.
         *
         * Thay đổi so với controller cũ:
         * - withdrawUseCase.execute() trả về void (không trả Application) vì
         * WithdrawApplicationUseCase mới nhận thêm candidateId để authorize
         * và hoàn quota — không cần return Application.
         * - Sau khi rút thành công, load lại Application từ repo để build response
         * thay vì nhận từ useCase — tách biệt concern rõ ràng hơn.
         */
        @Operation(summary = "Rút đơn ứng tuyển")
        @DeleteMapping("/api/v1/applications/{id}/withdraw")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> withdraw(@PathVariable UUID id) {

                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

                // execute() kiểm tra ownership bên trong — ném FORBIDDEN nếu không phải owner
                withdrawUseCase.execute(id, candidateId);

                // Load lại để build response với status WITHDRAWN mới nhất
                Application updated = applicationRepo.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));

                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(updated), "Đơn ứng tuyển đã được rút."));
        }

        @Operation(summary = "Kiểm tra đã nộp đơn vào bài đăng này chưa")
        @GetMapping("/api/v1/jobs/{jobPostId}/my-application")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<Boolean>> checkApplied(@PathVariable UUID jobPostId) {
                UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
                boolean exists = applicationRepo.existsByJobPostIdAndCandidateId(jobPostId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(exists));
        }

        @Operation(summary = "Chấp nhận offer")
        @PatchMapping("/api/v1/applications/{id}/accept-offer")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> acceptOffer(
                        @PathVariable UUID id,
                        @RequestParam(required = false) String note) {

                Application app = acceptOfferUseCase.execute(new AcceptOfferUseCase.Command(id, note));
                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app),
                                                "Bạn đã chấp nhận offer thành công!"));
        }

        @Operation(summary = "Từ chối offer")
        @PatchMapping("/api/v1/applications/{id}/decline-offer")
        @PreAuthorize("hasRole('CANDIDATE')")
        public ResponseEntity<ApiResponse<ApplicationResponse>> declineOffer(
                        @PathVariable UUID id,
                        @RequestParam(required = false) String reason) {

                Application app = declineOfferUseCase.execute(new DeclineOfferUseCase.Command(id, reason));
                return ResponseEntity.ok(
                                ApiResponse.success(ApplicationResponse.from(app), "Bạn đã từ chối offer."));
        }
}