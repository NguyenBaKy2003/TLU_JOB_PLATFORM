package edu.tlu.jobplatform.job.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// ── UpdateJobPostRequest ──────────────────────────────────────

public record UpdateJobPostRequest(

        @NotBlank @Size(max = 255) String title,

        @NotBlank String description,

        String requirements,
        String benefits,
        String categoryCode,
        String level,
        String jobType,

        @Min(1) @Max(100) int headcount,

        boolean salaryNegotiate,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String currency,

        @NotBlank String workLocationType,

        String city,
        String address,
        LocalDateTime deadline,

        List<CreateJobPostRequest.SkillRequest> skills) {
}