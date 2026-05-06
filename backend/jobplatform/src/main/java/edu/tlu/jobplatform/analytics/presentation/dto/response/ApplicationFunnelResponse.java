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

    private final long submitted;
    private final long screening;
    private final long interviewing;
    private final long offered;
    private final long hired;
    private final long rejected;
    private final long withdrawn;

    private final double overallConversionRate;
    private final double screeningPassRate;

    public static ApplicationFunnelResponse from(ApplicationFunnelStats s) {
        return ApplicationFunnelResponse.builder()
                .companyId(s.getCompanyId())
                .jobPostId(s.getJobPostId())
                .submitted(s.getSubmitted())
                .screening(s.getScreening())
                .interviewing(s.getInterviewing())
                .offered(s.getOffered())
                .hired(s.getHired())
                .rejected(s.getRejected())
                .withdrawn(s.getWithdrawn())
                .overallConversionRate(Math.round(s.getOverallConversionRate() * 10.0) / 10.0)
                .screeningPassRate(Math.round(s.getScreeningPassRate() * 10.0) / 10.0)
                .build();
    }
}