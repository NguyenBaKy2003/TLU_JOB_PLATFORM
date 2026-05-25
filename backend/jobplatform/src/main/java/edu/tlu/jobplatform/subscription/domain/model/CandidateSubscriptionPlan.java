package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Value Object: Định nghĩa gói dịch vụ dành cho Candidate.
 *
 * 3 gói:
 * FREE_CANDIDATE — Miễn phí, 5 đơn/tháng, tạo 1 CV, template thường
 * PRO — 99k/tháng, unlimited apply, boost CV, tạo 5 CV, template premium
 * PREMIUM — 199k/tháng, tất cả Pro + AI viết CV, tạo unlimited CV, template
 * premium
 */
@Getter
@Builder
public class CandidateSubscriptionPlan {

    private final UUID id;
    private final String code; // "FREE_CANDIDATE", "PRO", "PREMIUM"
    private final String name;
    private final String description;

    private final BigDecimal priceMonthly; // null nếu miễn phí
    private final BigDecimal priceYearly; // null nếu miễn phí

    // ── Quota limits ──────────────────────────────────────────────────

    /** Số đơn ứng tuyển / tháng. -1 = unlimited */
    private final int applicationLimit;

    /** Số lần boost CV lên top / tháng. 0 = không có */
    private final int cvBoostLimit;

    /**
     * Số CV online có thể tạo đồng thời.
     * FREE_CANDIDATE = 1, PRO = 5, PREMIUM = -1 (unlimited).
     */
    private final int cvCreateLimit;

    // ── Feature flags ─────────────────────────────────────────────────

    /** AI viết & tối ưu CV theo JD — chỉ PREMIUM */
    private final boolean aiCvWriter;

    /**
     * Được dùng template premium (có nhãn ⭐) khi tạo CV online.
     * FREE_CANDIDATE = false (chỉ dùng template thường)
     * PRO = true
     * PREMIUM = true
     */
    private final boolean premiumTemplateAccess;

    /** 30 hoặc 365. null nếu là gói FREE (không có thời hạn) */
    private final Integer durationDays;

    private final boolean active;
    private final boolean free;

    // ── Computed helpers ──────────────────────────────────────────────

    public boolean isUnlimitedApplications() {
        return applicationLimit < 0;
    }

    public boolean isUnlimitedCvCreate() {
        return cvCreateLimit < 0;
    }

    public BigDecimal getYearlySavings() {
        if (priceYearly == null || priceMonthly == null)
            return BigDecimal.ZERO;
        return priceMonthly.multiply(BigDecimal.valueOf(12)).subtract(priceYearly);
    }
}