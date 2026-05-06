package edu.tlu.jobplatform.subscription.presentation.dto.request;

// ─
// Request DTOs
// ─
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreatePlanRequest(
                @NotBlank @Size(max = 30) String code,
                @NotBlank @Size(max = 100) String name,
                String description,
                @NotNull @DecimalMin("0") BigDecimal priceMonthly,
                @NotNull @DecimalMin("0") BigDecimal priceYearly,
                @Min(-1) int jobPostLimit,
                @Min(0) int featuredJobLimit,
                @Min(-1) int cvViewLimit,
                boolean aiFeatures,
                boolean analyticsAccess,
                @NotNull int durationDays) {
}
