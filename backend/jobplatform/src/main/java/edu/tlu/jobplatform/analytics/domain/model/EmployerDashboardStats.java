package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Value object tổng hợp số liệu của một Employer.
 * Query từ job/ và application/ domain — không cross-domain.
 */
@Getter
@Builder
@JsonDeserialize(builder = EmployerDashboardStats.EmployerDashboardStatsBuilder.class)
public class EmployerDashboardStats {

    private final UUID companyId;
    private final long activeJobs;
    private final long draftJobs;
    private final long totalJobsAllTime;
    private final long jobsExpiringSoon;
    private final long totalApplications;
    private final long newApplicationsToday;
    private final long pendingReview;
    private final int quotaUsed;
    private final int quotaTotal;
    private final int streamQuotaUsed;
    private final int streamQuotaTotal;
    private final long totalStreamSessions;
    private final long totalStreamViewers;
    private final long appliesFromStream;

    @JsonPOJOBuilder(withPrefix = "")
    public static class EmployerDashboardStatsBuilder {
    }
}