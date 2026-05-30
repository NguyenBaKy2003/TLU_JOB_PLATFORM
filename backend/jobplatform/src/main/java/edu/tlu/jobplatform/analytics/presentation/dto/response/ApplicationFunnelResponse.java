package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.ApplicationFunnelStats;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class ApplicationFunnelResponse {

    private final UUID companyId;
    private final UUID jobPostId; // null = toàn công ty

    // ── Funnel stages
    private final long submitted;
    private final long reviewing; // REVIEWING + SHORTLISTED
    private final long interviewing; // INTERVIEW_SCHEDULED + INTERVIEWED
    private final long offered; // OFFERED + ACCEPTED
    private final long hired;

    // ── Terminal / exit
    private final long rejected;
    private final long withdrawn;
    private final long declined;
    private final long cancelled;

    // ── Computed (làm tròn 1 chữ số thập phân)
    private final double overallConversionRate;
    private final double screeningPassRate;
    private final double interviewRate;
    private final double offerRate;

    public static ApplicationFunnelResponse from(ApplicationFunnelStats s) {
        return ApplicationFunnelResponse.builder()
                .companyId(s.getCompanyId())
                .jobPostId(s.getJobPostId())
                .submitted(s.getSubmitted())
                .reviewing(s.getReviewing())
                .interviewing(s.getInterviewing())
                .offered(s.getOffered())
                .hired(s.getHired())
                .rejected(s.getRejected())
                .withdrawn(s.getWithdrawn())
                .declined(s.getDeclined())
                .cancelled(s.getCancelled())
                .overallConversionRate(round1(s.getOverallConversionRate()))
                .screeningPassRate(round1(s.getScreeningPassRate()))
                .interviewRate(round1(s.getInterviewRate()))
                .offerRate(round1(s.getOfferRate()))
                .build();
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}