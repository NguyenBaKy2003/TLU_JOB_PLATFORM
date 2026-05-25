package edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import org.springframework.stereotype.Component;

@Component
public class CandidateSubscriptionMapper {

    // ── CandidateSubscription ─────────────────────────────────────────

    public CandidateSubscription toDomain(CandidateSubscriptionJpaEntity e) {
        return CandidateSubscription.builder()
                .id(e.getId())
                .candidateId(e.getCandidateId())
                .planId(e.getPlanId())
                .planCode(e.getPlanCode())
                .yearly(e.isYearly())
                .startedAt(e.getStartedAt())
                .expiresAt(e.getExpiresAt())
                .status(e.getStatus())
                .applicationQuota(CandidateQuota.builder()
                        .limit(e.getApplicationQuotaLimit())
                        .used(e.getApplicationQuotaUsed())
                        .build())
                .cvBoostQuota(CandidateQuota.builder()
                        .limit(e.getCvBoostQuotaLimit())
                        .used(e.getCvBoostQuotaUsed())
                        .build())
                .cvCreateQuota(CandidateQuota.builder()
                        .limit(e.getCvCreateQuotaLimit())
                        .used(e.getCvCreateQuotaUsed())
                        .build())
                .aiCvWriter(e.isAiCvWriter())
                .premiumTemplateAccess(e.isPremiumTemplateAccess())
                .currentPaymentId(e.getCurrentPaymentId())
                .lastQuotaResetAt(e.getLastQuotaResetAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    public CandidateSubscriptionJpaEntity toNewEntity(CandidateSubscription d) {
        CandidateSubscriptionJpaEntity entity = CandidateSubscriptionJpaEntity.builder()
                .candidateId(d.getCandidateId())
                .planId(d.getPlanId())
                .planCode(d.getPlanCode())
                .yearly(d.isYearly())
                .startedAt(d.getStartedAt())
                .expiresAt(d.getExpiresAt())
                .status(d.getStatus())
                .applicationQuotaLimit(d.getApplicationQuota().getLimit())
                .applicationQuotaUsed(d.getApplicationQuota().getUsed())
                .cvBoostQuotaLimit(d.getCvBoostQuota().getLimit())
                .cvBoostQuotaUsed(d.getCvBoostQuota().getUsed())
                .cvCreateQuotaLimit(d.getCvCreateQuota().getLimit())
                .cvCreateQuotaUsed(d.getCvCreateQuota().getUsed())
                .aiCvWriter(d.isAiCvWriter())
                .premiumTemplateAccess(d.isPremiumTemplateAccess())
                .currentPaymentId(d.getCurrentPaymentId())
                .lastQuotaResetAt(d.getLastQuotaResetAt())
                .build();
        if (d.getId() != null)
            entity.setId(d.getId());
        return entity;
    }

    /** Chỉ update mutable fields — immutable fields (planCode, flags) giữ nguyên */
    public void updateEntity(CandidateSubscriptionJpaEntity e, CandidateSubscription d) {
        e.setStatus(d.getStatus());
        e.setStartedAt(d.getStartedAt());
        e.setExpiresAt(d.getExpiresAt());
        e.setCurrentPaymentId(d.getCurrentPaymentId());
        e.setLastQuotaResetAt(d.getLastQuotaResetAt());
        e.setApplicationQuotaUsed(d.getApplicationQuota().getUsed());
        e.setCvBoostQuotaUsed(d.getCvBoostQuota().getUsed());
        e.setCvCreateQuotaUsed(d.getCvCreateQuota().getUsed());
    }

    // ── CandidateSubscriptionPlan ─────────────────────────────────────

    public CandidateSubscriptionPlan toPlanDomain(CandidateSubscriptionPlanJpaEntity e) {
        return CandidateSubscriptionPlan.builder()
                .id(e.getId())
                .code(e.getCode())
                .name(e.getName())
                .description(e.getDescription())
                .priceMonthly(e.getPriceMonthly())
                .priceYearly(e.getPriceYearly())
                .applicationLimit(e.getApplicationLimit())
                .cvBoostLimit(e.getCvBoostLimit())
                .cvCreateLimit(e.getCvCreateLimit())
                .aiCvWriter(e.isAiCvWriter())
                .premiumTemplateAccess(e.isPremiumTemplateAccess())
                .durationDays(e.getDurationDays())
                .active(e.isActive())
                .free(e.isFree())
                .build();
    }

    public CandidateSubscriptionPlanJpaEntity toPlanNewEntity(CandidateSubscriptionPlan d) {
        CandidateSubscriptionPlanJpaEntity entity = CandidateSubscriptionPlanJpaEntity.builder()
                .code(d.getCode())
                .name(d.getName())
                .description(d.getDescription())
                .priceMonthly(d.getPriceMonthly())
                .priceYearly(d.getPriceYearly())
                .applicationLimit(d.getApplicationLimit())
                .cvBoostLimit(d.getCvBoostLimit())
                .cvCreateLimit(d.getCvCreateLimit())
                .aiCvWriter(d.isAiCvWriter())
                .premiumTemplateAccess(d.isPremiumTemplateAccess())
                .durationDays(d.getDurationDays())
                .free(d.isFree())
                .build();
        entity.setActive(d.isActive());
        if (d.getId() != null)
            entity.setId(d.getId());
        return entity;
    }

    public void updatePlanEntity(CandidateSubscriptionPlanJpaEntity e, CandidateSubscriptionPlan d) {
        e.setName(d.getName());
        e.setDescription(d.getDescription());
        e.setPriceMonthly(d.getPriceMonthly());
        e.setPriceYearly(d.getPriceYearly());
        e.setApplicationLimit(d.getApplicationLimit());
        e.setCvBoostLimit(d.getCvBoostLimit());
        e.setCvCreateLimit(d.getCvCreateLimit());
        e.setAiCvWriter(d.isAiCvWriter());
        e.setPremiumTemplateAccess(d.isPremiumTemplateAccess());
        e.setDurationDays(d.getDurationDays());
        e.setActive(d.isActive());
    }
}