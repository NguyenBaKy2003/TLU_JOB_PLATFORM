package edu.tlu.jobplatform.analytics.presentation;

import edu.tlu.jobplatform.analytics.application.usecase.employer.GetApplicationFunnelUseCase;
import edu.tlu.jobplatform.analytics.application.usecase.employer.GetApplicationTrendUseCase;
import edu.tlu.jobplatform.analytics.application.usecase.employer.GetJobPerformanceUseCase;
import edu.tlu.jobplatform.analytics.presentation.dto.response.ApplicationFunnelResponse;
import edu.tlu.jobplatform.analytics.presentation.dto.response.ApplicationTrendResponse;
import edu.tlu.jobplatform.analytics.presentation.dto.response.EmployerDashboardResponse;
import edu.tlu.jobplatform.analytics.presentation.dto.response.JobPerformanceResponse;
import edu.tlu.jobplatform.analytics.infrastructure.query.EmployerAnalyticsQueryService;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API cho Employer Analytics Dashboard.
 *
 * companyId được resolve từ JWT — employer không truyền companyId qua request.
 * Cache Redis TTL: 2 phút (cấu hình trong AnalyticsCacheConfig).
 */
@RestController
@RequestMapping("/api/v1/employer/analytics")
@RequiredArgsConstructor
@Tag(name = "Employer Analytics", description = "Thống kê và báo cáo cho Employer")
public class EmployerAnalyticsController {

        private final EmployerAnalyticsQueryService queryService;
        private final GetApplicationFunnelUseCase getApplicationFunnel;
        private final GetJobPerformanceUseCase getJobPerformance;
        private final GetApplicationTrendUseCase getApplicationTrend;
        private final CompanyRepository companyRepository;

        // ── Dashboard ─────────────────────────────────────────────────────────────

        @GetMapping("/dashboard")
        @PreAuthorize("hasRole('EMPLOYER')")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(summary = "Tổng quan dashboard Employer", description = "Trả về số liệu jobs, applications, quota và livestream của công ty")
        public ResponseEntity<ApiResponse<EmployerDashboardResponse>> getDashboard() {
                UUID companyId = resolveCompanyId();

                EmployerDashboardResponse data = EmployerDashboardResponse.from(
                                queryService.buildEmployerDashboard(companyId));

                return ResponseEntity.ok(ApiResponse.success(data));
        }

        // ── Trend ─────────────────────────────────────────────────────────────────

        /**
         * GET /api/v1/employer/analytics/trend?months=12
         *
         * Trả về số đơn ứng tuyển và lượt xem job post theo từng tháng.
         * Thay thế TREND_DATA_PLACEHOLDER ở FE.
         */
        @GetMapping("/trend")
        @PreAuthorize("hasRole('EMPLOYER')")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(summary = "Xu hướng ứng tuyển & lượt xem theo tháng", description = "Trả về applications và views theo từng tháng — dùng cho area chart trên Employer Dashboard")
        public ResponseEntity<ApiResponse<ApplicationTrendResponse>> getTrend(
                        @RequestParam(defaultValue = "12") int months) {

                UUID companyId = resolveCompanyId();

                ApplicationTrendResponse data = ApplicationTrendResponse.from(
                                getApplicationTrend.execute(
                                                new GetApplicationTrendUseCase.Command(companyId, months)));

                return ResponseEntity.ok(ApiResponse.success(data));
        }

        // ── Job performance ───────────────────────────────────────────────────────

        @GetMapping("/jobs/performance")
        @PreAuthorize("hasRole('EMPLOYER')")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(summary = "Hiệu suất từng job post", description = "Gồm: lượt xem, phễu ứng tuyển (submitted → hired), conversion rate và deadline còn lại")
        public ResponseEntity<ApiResponse<JobPerformanceResponse>> getJobPerformance() {
                UUID companyId = resolveCompanyId();

                JobPerformanceResponse data = JobPerformanceResponse.from(
                                getJobPerformance.execute(new GetJobPerformanceUseCase.Command(companyId)));

                return ResponseEntity.ok(ApiResponse.success(data));
        }

        // ── Application funnel ────────────────────────────────────────────────────

        @GetMapping("/applications/funnel")
        @PreAuthorize("hasRole('EMPLOYER')")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(summary = "Phễu ứng tuyển toàn công ty", description = "Tổng hợp tất cả job posts: submitted → hired, kèm conversion rate và screening pass rate")
        public ResponseEntity<ApiResponse<ApplicationFunnelResponse>> getCompanyFunnel() {
                UUID companyId = resolveCompanyId();

                ApplicationFunnelResponse data = ApplicationFunnelResponse.from(
                                getApplicationFunnel.execute(
                                                GetApplicationFunnelUseCase.Command.forCompany(companyId)));

                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @GetMapping("/applications/funnel/{jobPostId}")
        @PreAuthorize("hasRole('EMPLOYER')")
        @SecurityRequirement(name = "bearerAuth")
        @Operation(summary = "Phễu ứng tuyển theo job post", description = "Phễu chi tiết của một job post: submitted → hired, kèm conversion rate")
        public ResponseEntity<ApiResponse<ApplicationFunnelResponse>> getJobFunnel(
                        @PathVariable UUID jobPostId) {

                UUID companyId = resolveCompanyId();

                ApplicationFunnelResponse data = ApplicationFunnelResponse.from(
                                getApplicationFunnel.execute(
                                                GetApplicationFunnelUseCase.Command.forJob(companyId, jobPostId)));

                return ResponseEntity.ok(ApiResponse.success(data));
        }

        // ── Helper ────────────────────────────────────────────────────────────────

        private UUID resolveCompanyId() {
                UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Company not found for owner: " + ownerId))
                                .getId();
        }
}