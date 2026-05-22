package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Value Object: Định nghĩa gói dịch vụ (plan).
 *
 * 4 gói:
 * STARTER — 500K/tháng, 5 tin
 * BUSINESS — 1.5M/tháng, 20 tin
 * ENTERPRISE — 4M/tháng, 100 tin
 * CUSTOM — liên hệ, unlimited
 */
@Getter
@Builder
public class SubscriptionPlan {

    private final UUID id;
    private final String code; // "STARTER", "BUSINESS"...
    private final String name;
    private final String description;
    private final BigDecimal priceMonthly;
    private final BigDecimal priceYearly; // discount ~20%
    private final int jobPostLimit; // -1 = unlimited
    private final int featuredJobLimit;
    private final int cvViewLimit; // -1 = unlimited
    private final boolean aiFeatures;
    private final boolean analyticsAccess;
    private final Integer durationDays; // 30 hoặc 365
    private final boolean active;

    public boolean isUnlimitedJobs() {
        return jobPostLimit < 0;
    }

    public boolean isUnlimitedCvView() {
        return cvViewLimit < 0;
    }

    public BigDecimal getYearlySavings() {
        if (priceYearly == null || priceMonthly == null)
            return BigDecimal.ZERO;
        return priceMonthly.multiply(BigDecimal.valueOf(12)).subtract(priceYearly);
    }

    public boolean isFree() {
        return PlanCode.FREE_COMPANY.equalsIgnoreCase(code);
    }
}
