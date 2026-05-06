package edu.tlu.jobplatform.analytics.presentation;

import edu.tlu.jobplatform.analytics.application.usecase.employer.GetApplicationFunnelUseCase;
import edu.tlu.jobplatform.analytics.application.usecase.employer.GetJobPerformanceUseCase;
import edu.tlu.jobplatform.analytics.presentation.dto.response.ApplicationFunnelResponse;
import edu.tlu.jobplatform.analytics.presentation.dto.response.EmployerDashboardResponse;
import edu.tlu.jobplatform.analytics.presentation.dto.response.JobPerformanceResponse;
import edu.tlu.jobplatform.analytics.infrastructure.query.AnalyticsQueryService;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API cho Employer Analytics Dashboard.
 *
 * Mỗi employer chỉ được xem dữ liệu của company mình (companyId lấy từ JWT).
 * Admin có thể xem bất kỳ company nào qua query param ?companyId=...
 *
 * Data được cache Redis — TTL 2 phút (cấu hình trong AnalyticsCacheConfig).
 */
@RestController
@RequestMapping("/api/v1/employer/analytics")
@RequiredArgsConstructor
@Tag(name = "Employer Analytics", description = "Thống kê và báo cáo cho Employer")
public class EmployerAnalyticsController {

    private final AnalyticsQueryService queryService;
    private final GetApplicationFunnelUseCase getApplicationFunnel;
    private final GetJobPerformanceUseCase getJobPerformance;

    // ── Dashboard tổng quan

    /**
     * GET /api/v1/employer/analytics/dashboard
     *
     * Employer xem dashboard của chính company mình.
     * companyId được resolve từ JWT (principal).
     *
     * @param companyId UUID company — employer truyền vào (hoặc lấy từ JWT ở tầng
     *                  security)
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Tổng quan dashboard Employer", description = "Trả về số liệu jobs, applications, quota và livestream của công ty")
    public ResponseEntity<ApiResponse<EmployerDashboardResponse>> getDashboard(
            @RequestParam UUID companyId) {

        EmployerDashboardResponse data = EmployerDashboardResponse.from(
                queryService.buildEmployerDashboard(companyId));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Job performance ─

    /**
     * GET /api/v1/employer/analytics/jobs/performance?companyId=...
     *
     * Trả về bảng hiệu suất từng job post: views, funnel, conversion rate,
     * deadline.
     */
    @GetMapping("/jobs/performance")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Hiệu suất từng job post", description = "Gồm: lượt xem, phễu ứng tuyển (submitted → hired), conversion rate và deadline còn lại")
    public ResponseEntity<ApiResponse<JobPerformanceResponse>> getJobPerformance(
            @RequestParam UUID companyId) {

        JobPerformanceResponse data = JobPerformanceResponse.from(
                getJobPerformance.execute(new GetJobPerformanceUseCase.Command(companyId)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Application funnel ─

    /**
     * GET /api/v1/employer/analytics/applications/funnel?companyId=...
     *
     * Phễu tổng hợp toàn công ty: submitted → screening → interviewing → offered →
     * hired.
     */
    @GetMapping("/applications/funnel")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Phễu ứng tuyển toàn công ty", description = "Tổng hợp tất cả job posts: submitted → hired, kèm conversion rate và screening pass rate")
    public ResponseEntity<ApiResponse<ApplicationFunnelResponse>> getCompanyFunnel(
            @RequestParam UUID companyId) {

        ApplicationFunnelResponse data = ApplicationFunnelResponse.from(
                getApplicationFunnel.execute(
                        GetApplicationFunnelUseCase.Command.forCompany(companyId)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * GET /api/v1/employer/analytics/applications/funnel/{jobPostId}?companyId=...
     *
     * Phễu của một job post cụ thể.
     */
    @GetMapping("/applications/funnel/{jobPostId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Phễu ứng tuyển theo job post", description = "Phễu chi tiết của một job post: submitted → hired, kèm conversion rate")
    public ResponseEntity<ApiResponse<ApplicationFunnelResponse>> getJobFunnel(
            @PathVariable UUID jobPostId,
            @RequestParam UUID companyId) {

        ApplicationFunnelResponse data = ApplicationFunnelResponse.from(
                getApplicationFunnel.execute(
                        GetApplicationFunnelUseCase.Command.forJob(companyId, jobPostId)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}