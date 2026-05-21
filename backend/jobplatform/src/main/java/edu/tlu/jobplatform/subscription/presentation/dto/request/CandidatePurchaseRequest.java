package edu.tlu.jobplatform.subscription.presentation.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request body cho POST /api/v1/subscriptions/candidate/purchase
 */
public record CandidatePurchaseRequest(
        @NotNull(message = "Vui lòng chọn gói dịch vụ") UUID planId,

        boolean yearly) {
}