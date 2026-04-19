package edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.infrastructure.persistence.entity.PaymentJpaEntity;
import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionMapper {

    // ── CompanySubscription ───────────────────────────────────

    public CompanySubscription toDomain(CompanySubscriptionJpaEntity e) {
        return CompanySubscription.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .planId(e.getPlanId())
                .planCode(e.getPlanCode())
                .yearly(e.isYearly()) // ✅ thêm mới
                .startedAt(e.getStartedAt())
                .expiresAt(e.getExpiresAt())
                .status(e.getStatus())
                .jobPostQuota(Quota.builder()
                        .limit(e.getJobPostQuotaLimit()).used(e.getJobPostQuotaUsed()).build())
                .featuredJobQuota(Quota.builder()
                        .limit(e.getFeaturedJobQuotaLimit()).used(e.getFeaturedJobQuotaUsed()).build())
                .cvViewQuota(Quota.builder()
                        .limit(e.getCvViewQuotaLimit()).used(e.getCvViewQuotaUsed()).build())
                .aiFeatures(e.isAiFeatures())
                .analyticsAccess(e.isAnalyticsAccess())
                .currentPaymentId(e.getCurrentPaymentId())
                .createdAt(e.getCreatedAt())
                .build();
    }

    public CompanySubscriptionJpaEntity toNewEntity(CompanySubscription d) {
        CompanySubscriptionJpaEntity entity = CompanySubscriptionJpaEntity.builder()
                .companyId(d.getCompanyId())
                .planId(d.getPlanId())
                .planCode(d.getPlanCode())
                .yearly(d.isYearly()) // ✅ thêm mới
                .startedAt(d.getStartedAt())
                .expiresAt(d.getExpiresAt())
                .status(d.getStatus())
                .jobPostQuotaLimit(d.getJobPostQuota().getLimit())
                .jobPostQuotaUsed(d.getJobPostQuota().getUsed())
                .featuredJobQuotaLimit(d.getFeaturedJobQuota().getLimit())
                .featuredJobQuotaUsed(d.getFeaturedJobQuota().getUsed())
                .cvViewQuotaLimit(d.getCvViewQuota().getLimit())
                .cvViewQuotaUsed(d.getCvViewQuota().getUsed())
                .aiFeatures(d.isAiFeatures())
                .analyticsAccess(d.isAnalyticsAccess())
                .currentPaymentId(d.getCurrentPaymentId())
                .build();
        if (d.getId() != null)
            entity.setId(d.getId());
        return entity;
    }

    // updateEntity không cần sửa — yearly là immutable, không thay đổi sau khi tạo

    public void updateEntity(CompanySubscriptionJpaEntity e, CompanySubscription d) {
        e.setStatus(d.getStatus());
        e.setStartedAt(d.getStartedAt());
        e.setExpiresAt(d.getExpiresAt());
        e.setCurrentPaymentId(d.getCurrentPaymentId());
        e.setJobPostQuotaUsed(d.getJobPostQuota().getUsed());
        e.setFeaturedJobQuotaUsed(d.getFeaturedJobQuota().getUsed());
        e.setCvViewQuotaUsed(d.getCvViewQuota().getUsed());
    }

    // ── SubscriptionPlan ──────────────────────────────────────

    public SubscriptionPlan toPlanDomain(SubscriptionPlanJpaEntity e) {
        return SubscriptionPlan.builder()
                .id(e.getId())
                .code(e.getCode())
                .name(e.getName())
                .description(e.getDescription())
                .priceMonthly(e.getPriceMonthly())
                .priceYearly(e.getPriceYearly())
                .jobPostLimit(e.getJobPostLimit())
                .featuredJobLimit(e.getFeaturedJobLimit())
                .cvViewLimit(e.getCvViewLimit())
                .aiFeatures(e.isAiFeatures())
                .analyticsAccess(e.isAnalyticsAccess())
                .durationDays(e.getDurationDays())
                .active(e.isActive())
                .build();
    }

    public SubscriptionPlanJpaEntity toPlanEntity(SubscriptionPlan d) {
        if (d == null)
            return null;
        SubscriptionPlanJpaEntity entity = SubscriptionPlanJpaEntity.builder()
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
        entity.setIsActive(d.isActive());
        return entity;
    }

    // ── Payment ───────────────────────────────────────────────

    public Payment toPaymentDomain(PaymentJpaEntity e) {
        return Payment.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .subscriptionId(e.getSubscriptionId())
                .planCode(e.getPlanCode())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .gateway(e.getGateway())
                .gatewayOrderCode(e.getGatewayOrderCode())
                .status(e.getStatus())
                .gatewayTransactionId(e.getGatewayTransactionId())
                .failureReason(e.getFailureReason())
                .completedAt(e.getCompletedAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    public PaymentJpaEntity toPaymentNewEntity(Payment d) {
        PaymentJpaEntity entity = PaymentJpaEntity.builder()
                .companyId(d.getCompanyId())
                .subscriptionId(d.getSubscriptionId())
                .planCode(d.getPlanCode())
                .amount(d.getAmount())
                .currency(d.getCurrency())
                .gateway(d.getGateway())
                .gatewayOrderCode(d.getGatewayOrderCode())
                .gatewayTransactionId(d.getGatewayTransactionId())
                .status(d.getStatus())
                .failureReason(d.getFailureReason())
                .completedAt(d.getCompletedAt())
                .build();
        if (d.getId() != null)
            entity.setId(d.getId());
        return entity;
    }

    public void updatePaymentEntity(PaymentJpaEntity e, Payment d) {
        e.setStatus(d.getStatus());
        e.setGatewayTransactionId(d.getGatewayTransactionId());
        e.setFailureReason(d.getFailureReason());
        e.setCompletedAt(d.getCompletedAt());
    }
}