package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Value Object: Định nghĩa gói dịch vụ (plan).
 *
 * SubscriptionPlan là "template" bất biến — không thay đổi theo thời gian.
 * CompanySubscription là "instance" — gắn với 1 công ty cụ thể.
 *
 * 4 gói theo thiết kế:
 * STARTER — 500K/tháng, 5 tin tuyển dụng
 * BUSINESS — 1.5M/tháng, 20 tin
 * ENTERPRISE — 4M/tháng, 100 tin
 * CUSTOM — liên hệ, không giới hạn
 */
@Getter
@Builder
public class SubscriptionPlan {

    private final UUID id;
    private final String code; // "STARTER", "BUSINESS"...
    private final String name; // "Gói Starter"
    private final String description;

    // ── Giá ───────────────────────────────────────────────────
    private final BigDecimal priceMonthly; // VND
    private final BigDecimal priceYearly; // VND (discount ~20%)

    // ── Quota ─────────────────────────────────────────────────
    private final int jobPostLimit; // Số tin tuyển dụng/tháng (-1 = unlimited)
    private final int featuredJobLimit; // Số tin nổi bật/tháng
    private final int cvViewLimit; // Số hồ sơ ứng viên được xem/tháng
    private final boolean aiFeatures; // Có AI scoring, JD optimizer không
    private final boolean analyticsAccess; // Có báo cáo analytics không
    private final int durationDays; // 30 hoặc 365

    private final boolean active; // Admin có thể deactivate plan cũ

    // ── Business Rules ────────────────────────────────────────

    public boolean isUnlimitedJobs() {
        return jobPostLimit < 0;
    }

    public boolean isUnlimitedCvView() {
        return cvViewLimit < 0;
    }

    /** Yearly price thường rẻ hơn 12 tháng monthly */
    public BigDecimal getYearlySavings() {
        if (priceYearly == null || priceMonthly == null)
            return BigDecimal.ZERO;
        return priceMonthly.multiply(BigDecimal.valueOf(12)).subtract(priceYearly);
    }
}