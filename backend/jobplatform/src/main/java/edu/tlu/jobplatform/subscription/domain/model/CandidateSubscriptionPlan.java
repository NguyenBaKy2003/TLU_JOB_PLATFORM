package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Value Object: Định nghĩa gói dịch vụ dành cho Candidate.
 *
 * 3 gói:
 * BASIC — Miễn phí, 5 đơn/tháng, 3 job alert
 * PRO — 99k/tháng, unlimited apply, CV nổi bật, AI matching
 * PREMIUM — 199k/tháng, tất cả Pro + AI viết CV, mock interview, salary
 * insights
 *
 * Lý do dùng class riêng thay vì tái sử dụng SubscriptionPlan:
 * - Quota fields hoàn toàn khác (applicationLimit thay vì jobPostLimit)
 * - Feature flags khác (aiCvWriter, salaryInsights thay vì analyticsAccess)
 * - Tránh nullable fields tràn lan trong SubscriptionPlan nếu gộp chung
 *
 * Nếu muốn gộp chung sau này: thêm PlanTarget vào SubscriptionPlan
 * và dùng nullable cho các fields không dùng — quyết định tuỳ team.
 */
@Getter
@Builder
public class CandidateSubscriptionPlan {

    private final UUID id;
    private final String code; // "BASIC", "PRO", "PREMIUM"
    private final String name;
    private final String description;

    private final BigDecimal priceMonthly; // null nếu miễn phí
    private final BigDecimal priceYearly; // null nếu miễn phí

    // ── Quota limits ──────────────────────────────────────────────────
    /** Số đơn ứng tuyển / tháng. -1 = unlimited */
    private final int applicationLimit;

    /** Số lần boost CV lên top / tháng. 0 = không có */
    private final int cvBoostLimit;

    /** Số job alert đồng thời. -1 = unlimited */
    private final int jobAlertLimit;

    /** Số buổi mock interview AI / kỳ. 0 = không có */
    private final int mockInterviewLimit;

    // ── Feature flags ─────────────────────────────────────────────────
    private final boolean aiCvWriter; // AI viết & tối ưu CV theo JD
    private final boolean salaryInsights; // Tra cứu mức lương thị trường
    private final boolean profileAnalytics; // Xem ai đã xem CV
    private final boolean advancedFilters; // Bộ lọc tìm kiếm nâng cao

    /** 30 hoặc 365. null nếu là gói FREE (không có thời hạn) */
    private final Integer durationDays;

    private final boolean active;
    private final boolean free;

    // ── Computed helpers ──────────────────────────────────────────────

    public boolean isUnlimitedApplications() {
        return applicationLimit < 0;
    }

    public boolean isUnlimitedJobAlerts() {
        return jobAlertLimit < 0;
    }

    public BigDecimal getYearlySavings() {
        if (priceYearly == null || priceMonthly == null)
            return BigDecimal.ZERO;
        return priceMonthly.multiply(BigDecimal.valueOf(12)).subtract(priceYearly);
    }
}