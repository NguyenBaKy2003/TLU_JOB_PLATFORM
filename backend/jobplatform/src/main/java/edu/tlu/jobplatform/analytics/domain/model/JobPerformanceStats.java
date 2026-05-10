package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Value object: hiệu suất của một job post (dùng trong Employer Dashboard).
 */
@Getter
@Builder
@JsonDeserialize(builder = JobPerformanceStats.JobPerformanceStatsBuilder.class)
public class JobPerformanceStats {

    private final UUID jobPostId;
    private final String title;
    private final String status;
    private final int viewCount;
    private final long totalApplications;
    private final long screening;
    private final long interviewing;
    private final long offered;
    private final long hired;
    private final double conversionRate;
    private final String deadline;

    @JsonPOJOBuilder(withPrefix = "")
    public static class JobPerformanceStatsBuilder {
    }
}