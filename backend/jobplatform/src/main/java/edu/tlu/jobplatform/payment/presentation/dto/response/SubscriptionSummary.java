package edu.tlu.jobplatform.payment.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Thông tin tóm tắt gói dịch vụ nhúng vào PaymentResponse.
 * Dùng chung cho cả Company (SubscriptionPlan) và Candidate
 * (CandidateSubscriptionPlan).
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubscriptionSummary {

    private final String planCode;
    private final String planName;
    private final String planDescription;

    private final BigDecimal priceMonthly;
    private final BigDecimal priceYearly;
    private final Integer durationDays;

    // ── Company-only fields ───────────────────────────────────────────

    /** Số tin đăng tuyển / tháng. -1 = unlimited. Null nếu là gói Candidate */
    private final Integer jobPostLimit;

    /** Số tin nổi bật. Null nếu là gói Candidate */
    private final Integer featuredJobLimit;

    /** Số CV xem được. -1 = unlimited. Null nếu là gói Candidate */
    private final Integer cvViewLimit;

    /** AI phân tích ứng viên. Null nếu là gói Candidate */
    private final Boolean aiFeatures;

    /** Xem báo cáo & thống kê. Null nếu là gói Candidate */
    private final Boolean analyticsAccess;

    // ── Candidate-only fields ─────────────────────────────────────────

    /** Số đơn ứng tuyển / tháng. -1 = unlimited. Null nếu là gói Company */
    private final Integer applicationLimit;

    /** Số lần boost CV lên top / tháng. Null nếu là gói Company */
    private final Integer cvBoostLimit;

    /** Số CV online có thể tạo. -1 = unlimited. Null nếu là gói Company */
    private final Integer cvCreateLimit;

    /** AI viết CV theo JD. Null nếu là gói Company */
    private final Boolean aiCvWriter;

    /** Được dùng template premium. Null nếu là gói Company */
    private final Boolean premiumTemplateAccess;

    // ── Factory methods ───────────────────────────────────────────────

    public static SubscriptionSummary fromCompanyPlan(SubscriptionPlan p) {
        if (p == null)
            return null;
        return SubscriptionSummary.builder()
                .planCode(p.getCode())
                .planName(p.getName())
                .planDescription(p.getDescription())
                .priceMonthly(p.getPriceMonthly())
                .priceYearly(p.getPriceYearly())
                .durationDays(p.getDurationDays())
                .jobPostLimit(p.getJobPostLimit())
                .featuredJobLimit(p.getFeaturedJobLimit())
                .cvViewLimit(p.getCvViewLimit())
                .aiFeatures(p.isAiFeatures())
                .analyticsAccess(p.isAnalyticsAccess())
                .build();
    }

    public static SubscriptionSummary fromCandidatePlan(CandidateSubscriptionPlan p) {
        if (p == null)
            return null;
        return SubscriptionSummary.builder()
                .planCode(p.getCode())
                .planName(p.getName())
                .planDescription(p.getDescription())
                .priceMonthly(p.getPriceMonthly())
                .priceYearly(p.getPriceYearly())
                .durationDays(p.getDurationDays())
                .applicationLimit(p.getApplicationLimit())
                .cvBoostLimit(p.getCvBoostLimit())
                .cvCreateLimit(p.getCvCreateLimit())
                .aiCvWriter(p.isAiCvWriter())
                .premiumTemplateAccess(p.isPremiumTemplateAccess())
                .build();
    }
}