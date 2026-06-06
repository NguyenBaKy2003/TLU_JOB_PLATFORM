package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Value object: phễu ứng tuyển của một job hoặc toàn bộ company.
 *
 * Mapping từ ApplicationStatus enum:
 * submitted → SUBMITTED
 * reviewing → REVIEWING + SHORTLISTED
 * interviewing→ INTERVIEW_SCHEDULED + INTERVIEWED
 * offered → OFFERED + ACCEPTED
 * hired → HIRED
 * rejected → REJECTED
 * withdrawn → WITHDRAWN
 * declined → DECLINED (ứng viên từ chối offer)
 * cancelled → CANCELLED
 */
@Getter
@Builder
@JsonDeserialize(builder = ApplicationFunnelStats.ApplicationFunnelStatsBuilder.class)
public class ApplicationFunnelStats {

    private final UUID companyId;
    private final UUID jobPostId;

    // ── Funnel stages ────────
    private final long submitted;
    private final long reviewing; // REVIEWING + SHORTLISTED
    private final long interviewing; // INTERVIEW_SCHEDULED + INTERVIEWED
    private final long offered; // OFFERED + ACCEPTED
    private final long hired;

    // ── Terminal / exit ──────
    private final long rejected;
    private final long withdrawn;
    private final long declined; // ứng viên từ chối offer
    private final long cancelled;

    // ── Computed rates ───────

    /** % ứng viên được tuyển trên tổng đã nộp */
    public double getOverallConversionRate() {
        if (submitted == 0)
            return 0.0;
        return (double) hired / submitted * 100;
    }

    /** % ứng viên qua được bước sàng lọc (reviewing) trên tổng đã nộp */
    public double getScreeningPassRate() {
        if (submitted == 0)
            return 0.0;
        return (double) reviewing / submitted * 100;
    }

    /** % ứng viên được mời phỏng vấn trên tổng đã qua sàng lọc */
    public double getInterviewRate() {
        if (reviewing == 0)
            return 0.0;
        return (double) interviewing / reviewing * 100;
    }

    /** % ứng viên nhận offer trên tổng đã phỏng vấn */
    public double getOfferRate() {
        if (interviewing == 0)
            return 0.0;
        return (double) offered / interviewing * 100;
    }

    @JsonPOJOBuilder(withPrefix = "")
    public static class ApplicationFunnelStatsBuilder {
    }
}