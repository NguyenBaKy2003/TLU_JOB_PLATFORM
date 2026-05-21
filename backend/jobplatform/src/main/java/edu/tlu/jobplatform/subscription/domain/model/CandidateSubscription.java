package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate Root: Gói dịch vụ của Ứng viên (Candidate).
 *
 * Tách biệt hoàn toàn khỏi CompanySubscription vì:
 * - Quota khác nhau về loại (application, cvBoost, mockInterview)
 * - Một số quota cần reset hàng tháng (applicationQuota, cvBoostQuota)
 * - Tính năng bổ sung riêng: aiCvWriter, salaryInsights, profileAnalytics
 *
 * Reset policy:
 * - applicationQuota → reset đầu mỗi tháng (scheduler)
 * - cvBoostQuota → reset đầu mỗi tháng
 * - mockInterviewQuota→ one-time, dùng hết trong kỳ (không reset)
 * - jobAlertQuota → giới hạn số lượng alert đang active (không reset)
 */
@Getter
@Builder
public class CandidateSubscription {

    private final UUID id;
    private final UUID candidateId; // userId của Candidate
    private final UUID planId;
    private final String planCode; // "BASIC", "PRO", "PREMIUM"
    private final boolean yearly;

    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private CandidateSubscriptionStatus status;

    // ── Quota theo tháng (reset hàng tháng) ──────────────────────────
    /**
     * Số đơn ứng tuyển / tháng.
     * Basic = 5, Pro & Premium = -1 (unlimited).
     */
    private CandidateQuota applicationQuota;

    /**
     * Số lần boost CV lên top kết quả tìm kiếm / tháng.
     * Basic = 0, Pro = 3, Premium = -1 (unlimited).
     */
    private CandidateQuota cvBoostQuota;

    /**
     * Số lượng job alert đang active đồng thời.
     * Basic = 3, Pro = 10, Premium = -1.
     */
    private CandidateQuota jobAlertQuota;

    // ── Quota one-time trong kỳ (không reset) ───────────────────────
    /**
     * Số buổi mock interview AI.
     * Basic = 0, Pro = 0, Premium = 5 (per subscription period).
     */
    private CandidateQuota mockInterviewQuota;

    // ── Feature flags ────────────────────────────────────────────────
    private final boolean aiCvWriter; // AI viết & tối ưu CV theo JD
    private final boolean salaryInsights; // Tra cứu mức lương thị trường
    private final boolean profileAnalytics; // Xem ai đã xem CV của mình
    private final boolean advancedFilters; // Bộ lọc tìm kiếm nâng cao

    private final LocalDateTime createdAt;
    private UUID currentPaymentId;

    /** Ngày reset quota gần nhất — dùng cho scheduler hàng tháng */
    private LocalDateTime lastQuotaResetAt;

    // ── Business Rules ───────────────────────────────────────────────

    public boolean isActive() {
        return status == CandidateSubscriptionStatus.ACTIVE
                && expiresAt != null
                && LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isExpired() {
        return status == CandidateSubscriptionStatus.EXPIRED
                || (expiresAt != null && LocalDateTime.now().isAfter(expiresAt));
    }

    public long daysRemaining() {
        if (!isActive())
            return 0;
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toDays();
    }

    public boolean canApply() {
        return isActive() && !applicationQuota.isExceeded();
    }

    public boolean canBoostCv() {
        return isActive() && !cvBoostQuota.isExceeded();
    }

    public boolean canAddJobAlert() {
        return isActive() && !jobAlertQuota.isExceeded();
    }

    public boolean canRunMockInterview() {
        return isActive() && !mockInterviewQuota.isExceeded();
    }

    // ── State transitions ────────────────────────────────────────────

    public void activate(UUID paymentId, LocalDateTime expiresAt) {
        this.status = CandidateSubscriptionStatus.ACTIVE;
        this.startedAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.currentPaymentId = paymentId;
        this.lastQuotaResetAt = LocalDateTime.now();
    }

    public void expire() {
        this.status = CandidateSubscriptionStatus.EXPIRED;
    }

    public void cancel() {
        this.status = CandidateSubscriptionStatus.CANCELLED;
    }

    public void markFailed() {
        this.status = CandidateSubscriptionStatus.FAILED;
    }

    // ── Quota operations ─────────────────────────────────────────────

    public void consumeApplication() {
        this.applicationQuota = applicationQuota.consume(1);
    }

    public void refundApplication() {
        this.applicationQuota = applicationQuota.refund(1);
    }

    public void consumeCvBoost() {
        this.cvBoostQuota = cvBoostQuota.consume(1);
    }

    public void consumeJobAlert() {
        this.jobAlertQuota = jobAlertQuota.consume(1);
    }

    public void releaseJobAlert() {
        this.jobAlertQuota = jobAlertQuota.refund(1);
    }

    public void consumeMockInterview() {
        this.mockInterviewQuota = mockInterviewQuota.consume(1);
    }

    /**
     * Reset các quota theo tháng.
     * Chỉ reset applicationQuota và cvBoostQuota.
     * mockInterviewQuota KHÔNG reset — one-time trong kỳ.
     * jobAlertQuota KHÔNG reset — đếm số alert đang active.
     */
    public void resetMonthlyQuotas() {
        this.applicationQuota = applicationQuota.reset();
        this.cvBoostQuota = cvBoostQuota.reset();
        this.lastQuotaResetAt = LocalDateTime.now();
    }
}