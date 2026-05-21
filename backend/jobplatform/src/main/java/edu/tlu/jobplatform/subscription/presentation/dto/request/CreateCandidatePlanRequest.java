package edu.tlu.jobplatform.subscription.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Request body cho POST /api/v1/admin/candidate-plans
 */
public record CreateCandidatePlanRequest(
        @NotBlank @Size(max = 30) String code,

        @NotBlank @Size(max = 100) String name,

        String description,

        // null nếu là gói free
        @DecimalMin("0") BigDecimal priceMonthly,

        @DecimalMin("0") BigDecimal priceYearly,

        /** -1 = unlimited */
        @Min(-1) int applicationLimit,

        @Min(0) int cvBoostLimit,

        /** -1 = unlimited */
        @Min(-1) int jobAlertLimit,

        @Min(0) int mockInterviewLimit,

        boolean aiCvWriter,
        boolean salaryInsights,
        boolean profileAnalytics,
        boolean advancedFilters,

        /** null nếu gói free không có thời hạn */
        Integer durationDays,

        boolean free) {
}