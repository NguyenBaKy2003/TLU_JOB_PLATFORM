package edu.tlu.jobplatform.user.presentation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import lombok.Builder;

@JsonTypeInfo(use = JsonTypeInfo.Id.NONE)
public sealed interface SubscriptionSummary
        permits SubscriptionSummary.Candidate, SubscriptionSummary.Company {

    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    record Candidate(
            UUID id,
            String planCode,
            String status,
            boolean yearly,
            LocalDateTime expiresAt,
            boolean aiCvWriter,
            boolean premiumTemplateAccess,
            QuotaInfo applicationQuota,
            QuotaInfo cvBoostQuota,
            QuotaInfo cvCreateQuota,
            boolean active,
            boolean expired,
            boolean free) implements SubscriptionSummary {
    }

    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    record Company(
            UUID id,
            String planCode,
            String status,
            boolean yearly,
            LocalDateTime expiresAt,
            boolean aiFeatures,
            boolean analyticsAccess,
            QuotaInfo jobPostQuota,
            QuotaInfo featuredJobQuota,
            QuotaInfo cvViewQuota,
            boolean active,
            boolean expired,
            boolean free) implements SubscriptionSummary {
    }

    @Builder
    record QuotaInfo(
            int limit,
            int used,
            boolean exceeded,
            boolean unlimited) {
    }
}