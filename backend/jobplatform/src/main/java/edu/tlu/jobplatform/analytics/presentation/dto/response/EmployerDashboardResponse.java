package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.EmployerDashboardStats;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class EmployerDashboardResponse {

    private final UUID companyId;

    // ── Jobs
    private final long activeJobs;
    private final long draftJobs;
    private final long totalJobsAllTime;
    private final long jobsExpiringSoon;

    // ── Applications
    private final long totalApplications;
    private final long newApplicationsToday;
    private final long pendingReview;

    // ── Quota ─
    private final int quotaUsed;
    private final int quotaTotal;
    private final int streamQuotaUsed;
    private final int streamQuotaTotal;

    // ── Livestream ──
    private final long totalStreamSessions;
    private final long totalStreamViewers;
    private final long appliesFromStream;

    public static EmployerDashboardResponse from(EmployerDashboardStats s) {
        return EmployerDashboardResponse.builder()
                .companyId(s.getCompanyId())
                .activeJobs(s.getActiveJobs())
                .draftJobs(s.getDraftJobs())
                .totalJobsAllTime(s.getTotalJobsAllTime())
                .jobsExpiringSoon(s.getJobsExpiringSoon())
                .totalApplications(s.getTotalApplications())
                .newApplicationsToday(s.getNewApplicationsToday())
                .pendingReview(s.getPendingReview())
                .quotaUsed(s.getQuotaUsed())
                .quotaTotal(s.getQuotaTotal())
                .streamQuotaUsed(s.getStreamQuotaUsed())
                .streamQuotaTotal(s.getStreamQuotaTotal())
                .totalStreamSessions(s.getTotalStreamSessions())
                .totalStreamViewers(s.getTotalStreamViewers())
                .appliesFromStream(s.getAppliesFromStream())
                .build();
    }
}