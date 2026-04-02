package edu.tlu.jobplatform.job.presentation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

// ── JobSearchRequest ──────────────────────────────────────────

public record JobSearchRequest(
        String keyword,
        String categoryCode,
        String level,
        String jobType,
        String city,
        String workLocationType,
        Long salaryMin,
        Long salaryMax,
        String skills, // comma-separated: "Java,Spring"

        boolean featuredOnly,

        @Min(0) int page,
        @Min(1) @Max(50) int size,

        String sortBy // newest | salary | relevance
) {
    public JobSearchRequest {
        if (page < 0)
            page = 0;
        if (size <= 0)
            size = 20;
        if (sortBy == null)
            sortBy = "newest";
    }
}