package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Value object tổng hợp số liệu platform-wide cho Admin Dashboard.
 */
@Getter
@Builder
public class AdminDashboardStats {

    // ── Users ──
    private final long totalUsers;
    private final long totalCandidates;
    private final long totalEmployers;
    private final long newUsersThisMonth;
    private final double userGrowthRate; // % so với tháng trước

    // ── Companies ──
    private final long totalCompanies;
    private final long verifiedCompanies;
    private final long pendingVerification;

    // ── Jobs ─
    private final long totalJobs;
    private final long activeJobs;
    private final long jobsThisMonth;
    private final double jobGrowthRate;

    // ── Applications ──
    private final long totalApplications;
    private final long applicationsThisMonth;
    private final double applicationGrowthRate;

    // ── Revenue ─
    private final BigDecimal revenueThisMonth;
    private final BigDecimal revenueLastMonth;
    private final double revenueGrowthRate;

    // ── Livestream ─
    private final long totalStreamSessions;
    private final long streamSessionsThisMonth;
    private final long totalStreamViewers;
    private final long appliesFromStream;

    // ── Moderation queue
    private final long pendingCompanyVerifications;
    private final long pendingJobApprovals;
    private final long flaggedJobs;

    private final LocalDateTime generatedAt;
}