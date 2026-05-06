package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Value object tổng hợp số liệu của một Employer.
 * Query từ job/ và application/ domain — không cross-domain.
 */
@Getter
@Builder
public class EmployerDashboardStats {

    private final UUID companyId;

    // ── Job overview ──
    private final long activeJobs;
    private final long draftJobs;
    private final long totalJobsAllTime;
    private final long jobsExpiringSoon; // deadline ≤ 7 ngày

    // ── Application overview ──
    private final long totalApplications;
    private final long newApplicationsToday;
    private final long pendingReview; // status = SUBMITTED

    // ── Quota
    private final int quotaUsed;
    private final int quotaTotal;
    private final int streamQuotaUsed;
    private final int streamQuotaTotal;

    // ── Livestream overview
    private final long totalStreamSessions;
    private final long totalStreamViewers;
    private final long appliesFromStream;
}