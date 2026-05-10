package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Value object: phễu ứng tuyển của một job hoặc toàn bộ company.
 */
@Getter
@Builder
@JsonDeserialize(builder = ApplicationFunnelStats.ApplicationFunnelStatsBuilder.class)
public class ApplicationFunnelStats {

    private final UUID companyId;
    private final UUID jobPostId;
    private final long submitted;
    private final long screening;
    private final long interviewing;
    private final long offered;
    private final long hired;
    private final long rejected;
    private final long withdrawn;

    public double getOverallConversionRate() {
        if (submitted == 0)
            return 0.0;
        return (double) hired / submitted * 100;
    }

    public double getScreeningPassRate() {
        if (submitted == 0)
            return 0.0;
        return (double) screening / submitted * 100;
    }

    @JsonPOJOBuilder(withPrefix = "")
    public static class ApplicationFunnelStatsBuilder {
    }
}