package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class CompanySubscription {

    private final UUID id;
    private final UUID companyId;
    private final UUID planId;
    private final String planCode;

    private final boolean yearly; // thêm mới

    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private SubscriptionStatus status;

    private Quota jobPostQuota;
    private Quota featuredJobQuota;
    private Quota cvViewQuota;
    private final boolean aiFeatures;
    private final boolean analyticsAccess;

    private final LocalDateTime createdAt;
    private UUID currentPaymentId;

    // ── Business Rules ─

    public boolean isActive() {
        if (status != SubscriptionStatus.ACTIVE)
            return false;
        if (expiresAt == null)
            return true;
        return LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isExpired() {
        if (status == SubscriptionStatus.EXPIRED)
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

    public boolean canPostJob() {
        return isActive() && !jobPostQuota.isExceeded();
    }

    public boolean canPostFeatured() {
        return isActive() && !featuredJobQuota.isExceeded();
    }

    public boolean canViewCv() {
        return isActive() && !cvViewQuota.isExceeded();
    }

    // ── State transitions ─

    public void activate(UUID paymentId, LocalDateTime expiresAt) {
        this.status = SubscriptionStatus.ACTIVE;
        this.startedAt = LocalDateTime.now();
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

    // ── Quota operations ──

    public void consumeJobPost(int count) {
        this.jobPostQuota = jobPostQuota.consume(count);
    }

    public void refundJobPost(int count) {
        this.jobPostQuota = jobPostQuota.refund(count);
    }

    public void consumeFeaturedJob(int n) {
        this.featuredJobQuota = featuredJobQuota.consume(n);
    }

    public void consumeCvView(int count) {
        this.cvViewQuota = cvViewQuota.consume(count);
    }

    public void resetQuotas() {
        this.jobPostQuota = jobPostQuota.reset();
        this.featuredJobQuota = featuredJobQuota.reset();
        this.cvViewQuota = cvViewQuota.reset();
    }

    public boolean isFree() {
        return PlanCode.FREE_COMPANY.equalsIgnoreCase(planCode);
    }
}