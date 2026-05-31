package edu.tlu.jobplatform.subscription.application.snapshot;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;

import java.math.BigDecimal;

public sealed interface PlanSnapshot {

    record EmployerPlanSnapshot(
            String name,
            String description,
            BigDecimal priceMonthly,
            BigDecimal priceYearly,
            Integer jobPostLimit,
            Integer featuredJobLimit,
            Integer cvViewLimit,
            boolean aiFeatures,
            boolean analyticsAccess,
            Integer durationDays,
            boolean active) implements PlanSnapshot {

        public static EmployerPlanSnapshot from(SubscriptionPlan p) {
            return new EmployerPlanSnapshot(
                    p.getName(), p.getDescription(),
                    p.getPriceMonthly(), p.getPriceYearly(),
                    p.getJobPostLimit(), p.getFeaturedJobLimit(), p.getCvViewLimit(),
                    p.isAiFeatures(), p.isAnalyticsAccess(),
                    p.getDurationDays(), p.isActive());
        }
    }

    record CandidatePlanSnapshot(
            String name,
            String description,
            BigDecimal priceMonthly,
            BigDecimal priceYearly,
            Integer applicationLimit,
            Integer cvBoostLimit,
            Integer cvCreateLimit,
            boolean aiCvWriter,
            boolean premiumTemplateAccess,
            Integer durationDays,
            boolean active) implements PlanSnapshot {

        public static CandidatePlanSnapshot from(CandidateSubscriptionPlan p) {
            return new CandidatePlanSnapshot(
                    p.getName(), p.getDescription(),
                    p.getPriceMonthly(), p.getPriceYearly(),
                    p.getApplicationLimit(), p.getCvBoostLimit(), p.getCvCreateLimit(),
                    p.isAiCvWriter(), p.isPremiumTemplateAccess(),
                    p.getDurationDays(), p.isActive());
        }
    }
}