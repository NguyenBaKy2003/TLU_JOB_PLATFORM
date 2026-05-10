package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Value object tổng hợp số liệu platform-wide cho Admin Dashboard.
 */
@Getter
@Builder
@JsonDeserialize(builder = AdminDashboardStats.AdminDashboardStatsBuilder.class)
public class AdminDashboardStats {

    private final long totalUsers;
    private final long totalCandidates;
    private final long totalEmployers;
    private final long newUsersThisMonth;
    private final double userGrowthRate;
    private final long totalCompanies;
    private final long verifiedCompanies;
    private final long pendingVerification;
    private final long totalJobs;
    private final long activeJobs;
    private final long jobsThisMonth;
    private final double jobGrowthRate;
    private final long totalApplications;
    private final long applicationsThisMonth;
    private final double applicationGrowthRate;
    private final BigDecimal revenueThisMonth;
    private final BigDecimal revenueLastMonth;
    private final double revenueGrowthRate;
    private final long totalStreamSessions;
    private final long streamSessionsThisMonth;
    private final long totalStreamViewers;
    private final long appliesFromStream;
    private final long pendingCompanyVerifications;
    private final long pendingJobApprovals;
    private final long flaggedJobs;
    private final LocalDateTime generatedAt;

    @JsonPOJOBuilder(withPrefix = "")
    public static class AdminDashboardStatsBuilder {
    }
}