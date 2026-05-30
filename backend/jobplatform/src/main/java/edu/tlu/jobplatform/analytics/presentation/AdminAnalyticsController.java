package edu.tlu.jobplatform.analytics.presentation;

import edu.tlu.jobplatform.analytics.application.usecase.admin.*;
import edu.tlu.jobplatform.analytics.presentation.dto.response.*;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST API cho Admin Analytics Dashboard.
 *
 * Tất cả endpoint yêu cầu role ADMIN.
 * Data được cache Redis — TTL 5 phút (cấu hình trong AnalyticsCacheConfig).
 */
@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics", description = "Thống kê và báo cáo cho Admin")
public class AdminAnalyticsController {

    private final GetAdminDashboardUseCase getDashboard;
    private final GetUserGrowthStatsUseCase getUserGrowth;
    private final GetRevenueReportUseCase getRevenue;
    private final GetTopCompaniesUseCase getTopCompanies;
    private final GetLivestreamPlatformStatsUseCase getLivestreamStats;

    // ── Dashboard tổng quan

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
    @Operation(summary = "Lấy tổng quan dashboard Admin", description = "Trả về tất cả số liệu platform-wide: users, jobs, revenue, streams, moderation queue")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse data = AdminDashboardResponse.from(getDashboard.execute());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── User growth

    @GetMapping("/users/growth")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Biểu đồ tăng trưởng người dùng theo tháng")
    @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<TimeSeriesResponse>> getUserGrowth(
            @RequestParam(defaultValue = "12") int months) {

        TimeSeriesResponse data = TimeSeriesResponse.from(
                getUserGrowth.execute(new GetUserGrowthStatsUseCase.Command(months)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Revenue ─

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Báo cáo doanh thu theo tháng")
    @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<TimeSeriesResponse>> getRevenue(
            @RequestParam(defaultValue = "12") int months) {

        TimeSeriesResponse data = TimeSeriesResponse.from(
                getRevenue.execute(new GetRevenueReportUseCase.Command(months)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Top companies

    @GetMapping("/companies/top")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
    @Operation(summary = "Bảng xếp hạng công ty theo revenue và lượng tuyển dụng")
    public ResponseEntity<ApiResponse<TopCompaniesResponse>> getTopCompanies(
            @RequestParam(defaultValue = "10") int limit) {

        TopCompaniesResponse data = TopCompaniesResponse.from(
                getTopCompanies.execute(new GetTopCompaniesUseCase.Command(limit)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Livestream platform stats ──

    @GetMapping("/livestream")
    @PreAuthorize("hasRole('ADMIN')")
    @RateLimit(policy = "analytics-admin", scope = RateLimitPolicy.Scope.USER)
    @Operation(summary = "Thống kê livestream toàn platform theo tháng")
    public ResponseEntity<ApiResponse<TimeSeriesResponse>> getLivestreamStats(
            @RequestParam(defaultValue = "6") int months) {

        TimeSeriesResponse data = TimeSeriesResponse.from(
                getLivestreamStats.execute(new GetLivestreamPlatformStatsUseCase.Command(months)));
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}