package edu.tlu.jobplatform.subscription.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.infrastructure.persistence.entity.*;
import org.springframework.stereotype.Component;

/**
 * Mapper: chuyển đổi giữa domain model và JPA entity.
 *
 * Tuân theo pattern của SubscriptionMapper (Company):
 * - toDomain() — entity → aggregate root
 * - toNewEntity() — aggregate root → entity mới (chưa có id trong DB)
 * - updateEntity() — cập nhật các mutable fields vào entity đang managed
 *
 * updateEntity chỉ cập nhật các field có thể thay đổi sau khi tạo.
 * Các field immutable (candidateId, planId, planCode, yearly, feature flags)
 * không được cập nhật — đây là bất biến thiết kế.
 */
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
                .jobAlertQuota(CandidateQuota.builder()
                        .limit(e.getJobAlertQuotaLimit())
                        .used(e.getJobAlertQuotaUsed())
                        .build())
                .mockInterviewQuota(CandidateQuota.builder()
                        .limit(e.getMockInterviewQuotaLimit())
                        .used(e.getMockInterviewQuotaUsed())
                        .build())
                .aiCvWriter(e.isAiCvWriter())
                .salaryInsights(e.isSalaryInsights())
                .profileAnalytics(e.isProfileAnalytics())
                .advancedFilters(e.isAdvancedFilters())
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
                .jobAlertQuotaLimit(d.getJobAlertQuota().getLimit())
                .jobAlertQuotaUsed(d.getJobAlertQuota().getUsed())
                .mockInterviewQuotaLimit(d.getMockInterviewQuota().getLimit())
                .mockInterviewQuotaUsed(d.getMockInterviewQuota().getUsed())
                .aiCvWriter(d.isAiCvWriter())
                .salaryInsights(d.isSalaryInsights())
                .profileAnalytics(d.isProfileAnalytics())
                .advancedFilters(d.isAdvancedFilters())
                .currentPaymentId(d.getCurrentPaymentId())
                .lastQuotaResetAt(d.getLastQuotaResetAt())
                .build();
        if (d.getId() != null)
            entity.setId(d.getId());
        return entity;
    }

    /**
     * Chỉ cập nhật các mutable fields.
     * Feature flags, planCode, candidateId, yearly là immutable sau khi tạo.
     */
    public void updateEntity(CandidateSubscriptionJpaEntity e, CandidateSubscription d) {
        e.setStatus(d.getStatus());
        e.setStartedAt(d.getStartedAt());
        e.setExpiresAt(d.getExpiresAt());
        e.setCurrentPaymentId(d.getCurrentPaymentId());
        e.setLastQuotaResetAt(d.getLastQuotaResetAt());
        // quota used fields
        e.setApplicationQuotaUsed(d.getApplicationQuota().getUsed());
        e.setCvBoostQuotaUsed(d.getCvBoostQuota().getUsed());
        e.setJobAlertQuotaUsed(d.getJobAlertQuota().getUsed());
        e.setMockInterviewQuotaUsed(d.getMockInterviewQuota().getUsed());
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
                .jobAlertLimit(e.getJobAlertLimit())
                .mockInterviewLimit(e.getMockInterviewLimit())
                .aiCvWriter(e.isAiCvWriter())
                .salaryInsights(e.isSalaryInsights())
                .profileAnalytics(e.isProfileAnalytics())
                .advancedFilters(e.isAdvancedFilters())
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
                .jobAlertLimit(d.getJobAlertLimit())
                .mockInterviewLimit(d.getMockInterviewLimit())
                .aiCvWriter(d.isAiCvWriter())
                .salaryInsights(d.isSalaryInsights())
                .profileAnalytics(d.isProfileAnalytics())
                .advancedFilters(d.isAdvancedFilters())
                .durationDays(d.getDurationDays())
                .free(d.isFree())
                .build();
        entity.setActive(d.isActive());
        return entity;
    }

    public void updatePlanEntity(CandidateSubscriptionPlanJpaEntity e, CandidateSubscriptionPlan d) {
        e.setName(d.getName());
        e.setDescription(d.getDescription());
        e.setPriceMonthly(d.getPriceMonthly());
        e.setPriceYearly(d.getPriceYearly());
        e.setApplicationLimit(d.getApplicationLimit());
        e.setCvBoostLimit(d.getCvBoostLimit());
        e.setJobAlertLimit(d.getJobAlertLimit());
        e.setMockInterviewLimit(d.getMockInterviewLimit());
        e.setAiCvWriter(d.isAiCvWriter());
        e.setSalaryInsights(d.isSalaryInsights());
        e.setProfileAnalytics(d.isProfileAnalytics());
        e.setAdvancedFilters(d.isAdvancedFilters());
        e.setDurationDays(d.getDurationDays());
        e.setActive(d.isActive());
    }
}