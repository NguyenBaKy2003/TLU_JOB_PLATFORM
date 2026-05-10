package edu.tlu.jobplatform.analytics.domain.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@JsonDeserialize(builder = TopCompanyStats.TopCompanyStatsBuilder.class)
public class TopCompanyStats {

    private final UUID companyId;
    private final String companyName;
    private final String logoUrl;
    private final long totalJobs;
    private final long totalApplications;
    private final long totalHired;
    private final BigDecimal totalRevenue;
    private final long streamSessions;
    private final int rank;

    @JsonPOJOBuilder(withPrefix = "")
    public static class TopCompanyStatsBuilder {
    }
}