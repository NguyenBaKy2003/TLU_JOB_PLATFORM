package edu.tlu.jobplatform.subscription.presentation.dto.request;

import java.math.BigDecimal;

/**
 * Request body cho PATCH /api/v1/admin/candidate-plans/{planId}
 * Tất cả field nullable — PATCH semantics, chỉ update field được gửi lên.
 *
 * Toggle active OFF: { "active": false }
 * Đổi giá: { "priceMonthly": 120000, "priceYearly": 1090000 }
 * Bật AI CV Writer: { "aiCvWriter": true }
 */
public record UpdateCandidatePlanRequest(
        String name,
        String description,
        BigDecimal priceMonthly,
        BigDecimal priceYearly,
        Integer applicationLimit,
        Integer cvBoostLimit,
        Integer jobAlertLimit,
        Integer mockInterviewLimit,
        Boolean aiCvWriter,
        Boolean salaryInsights,
        Boolean profileAnalytics,
        Boolean advancedFilters,
        Integer durationDays,
        Boolean active) {
}