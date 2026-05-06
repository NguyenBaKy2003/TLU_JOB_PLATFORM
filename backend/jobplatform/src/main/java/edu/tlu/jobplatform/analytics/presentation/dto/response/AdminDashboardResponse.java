package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.AdminDashboardStats;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminDashboardResponse {

    // ── Users
    private final long totalUsers;
    private final long totalCandidates;
    private final long totalEmployers;
    private final long newUsersThisMonth;
    private final double userGrowthRate;

    // ── Companies
    private final long totalCompanies;
    private final long verifiedCompanies;
    private final long pendingVerification;

    // ── Jobs
    private final long totalJobs;
    private final long activeJobs;
    private final long jobsThisMonth;
    private final double jobGrowthRate;

    // ── Applications
    private final long totalApplications;
    private final long applicationsThisMonth;
    private final double applicationGrowthRate;

    // ── Revenue ──
    private final BigDecimal revenueThisMonth;
    private final BigDecimal revenueLastMonth;
    private final double revenueGrowthRate;

    // ── Livestream ──
    private final long totalStreamSessions;
    private final long streamSessionsThisMonth;
    private final long totalStreamViewers;
    private final long appliesFromStream;

    // ── Moderation ──
    private final long pendingCompanyVerifications;
    private final long pendingJobApprovals;
    private final long flaggedJobs;

    private final LocalDateTime generatedAt;

    public static AdminDashboardResponse from(AdminDashboardStats s) {
        return AdminDashboardResponse.builder()
                .totalUsers(s.getTotalUsers())
                .totalCandidates(s.getTotalCandidates())
                .totalEmployers(s.getTotalEmployers())
                .newUsersThisMonth(s.getNewUsersThisMonth())
                .userGrowthRate(s.getUserGrowthRate())
                .totalCompanies(s.getTotalCompanies())
                .verifiedCompanies(s.getVerifiedCompanies())
                .pendingVerification(s.getPendingVerification())
                .totalJobs(s.getTotalJobs())
                .activeJobs(s.getActiveJobs())
                .jobsThisMonth(s.getJobsThisMonth())
                .jobGrowthRate(s.getJobGrowthRate())
                .totalApplications(s.getTotalApplications())
                .applicationsThisMonth(s.getApplicationsThisMonth())
                .applicationGrowthRate(s.getApplicationGrowthRate())
                .revenueThisMonth(s.getRevenueThisMonth())
                .revenueLastMonth(s.getRevenueLastMonth())
                .revenueGrowthRate(s.getRevenueGrowthRate())
                .totalStreamSessions(s.getTotalStreamSessions())
                .streamSessionsThisMonth(s.getStreamSessionsThisMonth())
                .totalStreamViewers(s.getTotalStreamViewers())
                .appliesFromStream(s.getAppliesFromStream())
                .pendingCompanyVerifications(s.getPendingCompanyVerifications())
                .pendingJobApprovals(s.getPendingJobApprovals())
                .flaggedJobs(s.getFlaggedJobs())
                .generatedAt(s.getGeneratedAt())
                .build();
    }
}