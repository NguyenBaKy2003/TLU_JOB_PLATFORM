package edu.tlu.jobplatform.job.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// ── CreateJobPostRequest ──────────────────────────────────────

public record CreateJobPostRequest(

        @NotBlank @Size(max = 255) String title,

        @NotBlank String description,

        String requirements,
        String benefits,

        @NotBlank String categoryCode,

        @NotBlank String level, // INTERN | JUNIOR | SENIOR | MANAGER | DIRECTOR

        @NotBlank String jobType, // FULL_TIME | PART_TIME | CONTRACT | FREELANCE

        @Min(1) @Max(100) int headcount,

        // Salary
        boolean salaryNegotiate,
        @DecimalMin("0") BigDecimal salaryMin,
        @DecimalMin("0") BigDecimal salaryMax,
        String currency,

        // Work location
        @NotBlank String workLocationType, // ONSITE | REMOTE | HYBRID

        String city,
        String address,

        LocalDateTime deadline,

        List<SkillRequest> skills) {
    public record SkillRequest(
            @NotBlank String skillName,
            boolean required,
            @Min(0) int yearsRequired) {
    }
}