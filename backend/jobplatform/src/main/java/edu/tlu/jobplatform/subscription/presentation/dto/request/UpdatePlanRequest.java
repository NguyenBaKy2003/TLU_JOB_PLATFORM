package edu.tlu.jobplatform.subscription.presentation.dto.request;

/**
 * Tất cả field nullable — partial update (PATCH semantics).
 */

import java.math.BigDecimal;

public record UpdatePlanRequest(
        String name,
        String description,
        BigDecimal priceMonthly,
        BigDecimal priceYearly,
        Integer jobPostLimit,
        Integer featuredJobLimit,
        Integer cvViewLimit,
        Boolean aiFeatures,
        Boolean analyticsAccess,
        Integer durationDays,
        Boolean active) {
}