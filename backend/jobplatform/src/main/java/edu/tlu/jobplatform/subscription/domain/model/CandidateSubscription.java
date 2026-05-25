package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate Root: Gói dịch vụ của Ứng viên (Candidate).
 *
 * Reset policy:
 * - applicationQuota → reset đầu mỗi tháng (scheduler)
 * - cvBoostQuota → reset đầu mỗi tháng
 * - cvCreateQuota → NOT reset — giới hạn số CV tồn tại đồng thời
 */
@Getter
@Builder
public class CandidateSubscription {

    private final UUID id;
    private final UUID candidateId;
    private final UUID planId;
    private final String planCode; // "FREE_CANDIDATE", "PRO", "PREMIUM"
    private final boolean yearly;

    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private CandidateSubscriptionStatus status;

    // ── Quota theo tháng (reset hàng tháng) ──────────────────────────

    /** Số đơn ứng tuyển / tháng. FREE_CANDIDATE=5, PRO/PREMIUM=-1 */
    private CandidateQuota applicationQuota;

    /** Số lần boost CV / tháng. FREE_CANDIDATE=0, PRO=3, PREMIUM=-1 */
    private CandidateQuota cvBoostQuota;

    // ── Quota tổng (không reset) ──────────────────────────────────────

    /**
     * Số CV online có thể tạo đồng thời.
     * FREE_CANDIDATE=1, PRO=5, PREMIUM=-1.
     * Không reset — dùng để check trước khi tạo CV mới.
     * Không consume/refund theo đơn — track bằng count DB thực tế.
     */
    private CandidateQuota cvCreateQuota;

    // ── Feature flags ─────────────────────────────────────────────────

    /** AI viết & tối ưu CV theo JD — chỉ PREMIUM */
    private final boolean aiCvWriter;

    /**
     * Được dùng template premium khi tạo CV online.
     * PRO và PREMIUM = true, FREE_CANDIDATE = false.
     */
    private final boolean premiumTemplateAccess;

    private final LocalDateTime createdAt;
    private UUID currentPaymentId;
    private LocalDateTime lastQuotaResetAt;

    // ── Business Rules ────────────────────────────────────────────────

    public boolean isActive() {
        if (status != CandidateSubscriptionStatus.ACTIVE)
            return false;
        if (expiresAt == null)
            return true; // FREE plan — vĩnh viễn
        return LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isExpired() {
        if (status == CandidateSubscriptionStatus.EXPIRED)
            return true;
        if (expiresAt == null)
            return false;
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public long daysRemaining() {
        if (!isActive())
            return 0;
        if (expiresAt == null)
            return Long.MAX_VALUE;
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toDays();
    }

    public boolean canApply() {
        return isActive() && !applicationQuota.isExceeded();
    }

    public boolean canBoostCv() {
        return isActive() && !cvBoostQuota.isExceeded();
    }

    public boolean isFree() {
        return PlanCode.FREE_CANDIDATE.equalsIgnoreCase(planCode);
    }

    // ── State transitions ─────────────────────────────────────────────

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

    // ── Quota operations ──────────────────────────────────────────────

    public void consumeApplication() {
        this.applicationQuota = applicationQuota.consume(1);
    }

    public void refundApplication() {
        this.applicationQuota = applicationQuota.refund(1);
    }

    public void consumeCvBoost() {
        this.cvBoostQuota = cvBoostQuota.consume(1);
    }

    /**
     * Reset quota hàng tháng.
     * cvCreateQuota KHÔNG reset — đây là giới hạn số CV đồng thời, không phải
     * lượt/tháng.
     */
    public void resetMonthlyQuotas() {
        this.applicationQuota = applicationQuota.reset();
        this.cvBoostQuota = cvBoostQuota.reset();
        this.lastQuotaResetAt = LocalDateTime.now();
    }
}