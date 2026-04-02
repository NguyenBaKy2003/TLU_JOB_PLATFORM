package edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionMapper {

    // ── SubscriptionPlan ──────────────────────────────────────

    public SubscriptionPlan toPlanDomain(SubscriptionPlanJpaEntity e) {
        if (e == null)
            return null;
        return SubscriptionPlan.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .description(e.getDescription())
                .priceMonthly(e.getPriceMonthly()).priceYearly(e.getPriceYearly())
                .jobPostLimit(e.getJobPostLimit()).featuredJobLimit(e.getFeaturedJobLimit())
                .cvViewLimit(e.getCvViewLimit())
                .aiFeatures(e.isAiFeatures()).analyticsAccess(e.isAnalyticsAccess())
                .durationDays(e.getDurationDays())
                .active(Boolean.TRUE.equals(e.getIsActive()))
                .build();
    }

    // ── CompanySubscription ───────────────────────────────────

    public CompanySubscription toSubDomain(CompanySubscriptionJpaEntity e) {
        if (e == null)
            return null;
        return CompanySubscription.builder()
                .id(e.getId()).companyId(e.getCompanyId())
                .planId(e.getPlanId()).planCode(e.getPlanCode())
                .status(e.getStatus())
                .startedAt(e.getStartedAt()).expiresAt(e.getExpiresAt())
                .jobPostQuota(Quota.of(e.getJobPostLimit(), e.getJobPostUsed()))
                .featuredJobQuota(Quota.of(e.getFeaturedJobLimit(), e.getFeaturedJobUsed()))
                .cvViewQuota(Quota.of(e.getCvViewLimit(), e.getCvViewUsed()))
                .aiFeatures(e.isAiFeatures()).analyticsAccess(e.isAnalyticsAccess())
                .currentPaymentId(e.getCurrentPaymentId())
                .createdAt(e.getCreatedAt())
                .build();
    }

    public CompanySubscriptionJpaEntity toSubNewEntity(CompanySubscription d) {
        return CompanySubscriptionJpaEntity.builder()
                .companyId(d.getCompanyId()).planId(d.getPlanId()).planCode(d.getPlanCode())
                .status(d.getStatus())
                .startedAt(d.getStartedAt()).expiresAt(d.getExpiresAt())
                .jobPostLimit(d.getJobPostQuota().getLimit())
                .jobPostUsed(d.getJobPostQuota().getUsed())
                .featuredJobLimit(d.getFeaturedJobQuota().getLimit())
                .featuredJobUsed(d.getFeaturedJobQuota().getUsed())
                .cvViewLimit(d.getCvViewQuota().getLimit())
                .cvViewUsed(d.getCvViewQuota().getUsed())
                .aiFeatures(d.isAiFeatures()).analyticsAccess(d.isAnalyticsAccess())
                .currentPaymentId(d.getCurrentPaymentId())
                .build();
    }

    public void updateSubEntity(CompanySubscriptionJpaEntity e, CompanySubscription d) {
        e.setStatus(d.getStatus());
        e.setExpiresAt(d.getExpiresAt());
        e.setJobPostUsed(d.getJobPostQuota().getUsed());
        e.setFeaturedJobUsed(d.getFeaturedJobQuota().getUsed());
        e.setCvViewUsed(d.getCvViewQuota().getUsed());
        e.setCurrentPaymentId(d.getCurrentPaymentId());
    }

    // ── Payment ───────────────────────────────────────────────

    public Payment toPaymentDomain(PaymentJpaEntity e) {
        if (e == null)
            return null;
        return Payment.builder()
                .id(e.getId()).companyId(e.getCompanyId())
                .subscriptionId(e.getSubscriptionId()).planCode(e.getPlanCode())
                .amount(e.getAmount()).currency(e.getCurrency()).gateway(e.getGateway())
                .gatewayOrderCode(e.getGatewayOrderCode())
                .gatewayTransactionId(e.getGatewayTransactionId())
                .status(e.getStatus()).failureReason(e.getFailureReason())
                .completedAt(e.getCompletedAt()).createdAt(e.getCreatedAt())
                .build();
    }

    public SubscriptionPlanJpaEntity toPlanEntity(SubscriptionPlan d) {
        if (d == null)
            return null;
        return SubscriptionPlanJpaEntity.builder()
                .code(d.getCode())
                .name(d.getName())
                .description(d.getDescription())
                .priceMonthly(d.getPriceMonthly())
                .priceYearly(d.getPriceYearly())
                .jobPostLimit(d.getJobPostLimit())
                .featuredJobLimit(d.getFeaturedJobLimit())
                .cvViewLimit(d.getCvViewLimit())
                .aiFeatures(d.isAiFeatures())
                .analyticsAccess(d.isAnalyticsAccess())
                .durationDays(d.getDurationDays())
                .build();
    }

    public PaymentJpaEntity toPaymentNewEntity(Payment d) {
        return PaymentJpaEntity.builder()
                .companyId(d.getCompanyId()).subscriptionId(d.getSubscriptionId())
                .planCode(d.getPlanCode()).amount(d.getAmount()).currency(d.getCurrency())
                .gateway(d.getGateway()).gatewayOrderCode(d.getGatewayOrderCode())
                .status(d.getStatus())
                .build();
    }

    public void updatePaymentEntity(PaymentJpaEntity e, Payment d) {
        e.setStatus(d.getStatus());
        e.setGatewayTransactionId(d.getGatewayTransactionId());
        e.setFailureReason(d.getFailureReason());
        e.setCompletedAt(d.getCompletedAt());
    }
}