package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate Root: Gói dịch vụ đang active của 1 công ty.
 *
 * 1 công ty chỉ có tối đa 1 subscription ACTIVE tại 1 thời điểm.
 *
 * Vòng đời:
 * PENDING → (payment success) → ACTIVE → (expired/manual) → EXPIRED
 * ACTIVE → (cancel) → CANCELLED
 * PENDING → (payment timeout) → FAILED
 */
@Getter
@Builder
public class CompanySubscription {

    private final UUID id;
    private final UUID companyId;
    private final UUID planId;
    private final String planCode; // snapshot tại thời điểm mua

    // ── Thời hạn ──────────────────────────────────────────────
    private final LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    // ── Trạng thái ────────────────────────────────────────────
    private SubscriptionStatus status;

    // ── Quota snapshot (lấy từ plan lúc mua) ─────────────────
    private Quota jobPostQuota;
    private Quota featuredJobQuota;
    private Quota cvViewQuota;
    private final boolean aiFeatures;
    private final boolean analyticsAccess;

    // ── Metadata ──────────────────────────────────────────────
    private final LocalDateTime createdAt;
    private UUID currentPaymentId;

    // ── Business Rules ────────────────────────────────────────

    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE
                && expiresAt != null
                && LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isExpired() {
        return status == SubscriptionStatus.ACTIVE
                && expiresAt != null
                && LocalDateTime.now().isAfter(expiresAt);
    }

    public long daysRemaining() {
        if (!isActive())
            return 0;
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toDays();
    }

    // ── State transitions ─────────────────────────────────────

    public void activate(UUID paymentId, LocalDateTime expiresAt) {
        this.status = SubscriptionStatus.ACTIVE;
        this.expiresAt = expiresAt;
        this.currentPaymentId = paymentId;
    }

    public void expire() {
        this.status = SubscriptionStatus.EXPIRED;
    }

    public void cancel() {
        this.status = SubscriptionStatus.CANCELLED;
    }

    public void markFailed() {
        this.status = SubscriptionStatus.FAILED;
    }

    // ── Quota operations ──────────────────────────────────────

    public void consumeJobPost(int count) {
        this.jobPostQuota = jobPostQuota.consume(count);
    }

    public void consumeFeaturedJob(int count) {
        this.featuredJobQuota = featuredJobQuota.consume(count);
    }

    public void consumeCvView(int count) {
        this.cvViewQuota = cvViewQuota.consume(count);
    }

    /** Reset toàn bộ quota — gọi khi gia hạn */
    public void resetQuotas() {
        this.jobPostQuota = jobPostQuota.reset();
        this.featuredJobQuota = featuredJobQuota.reset();
        this.cvViewQuota = cvViewQuota.reset();
    }

    /** Kiểm tra nhanh từng loại quota */
    public boolean canPostJob() {
        return isActive() && !jobPostQuota.isExceeded();
    }

    public boolean canPostFeatured() {
        return isActive() && !featuredJobQuota.isExceeded();
    }

    public boolean canViewCv() {
        return isActive() && !cvViewQuota.isExceeded();
    }
}