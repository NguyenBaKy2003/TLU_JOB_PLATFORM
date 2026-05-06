package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.TopCompanyStats;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class TopCompaniesResponse {

    private final List<CompanyRankItem> companies;
    private final int total;

    public static TopCompaniesResponse from(List<TopCompanyStats> stats) {
        List<CompanyRankItem> items = stats.stream()
                .map(s -> CompanyRankItem.builder()
                        .rank(s.getRank())
                        .companyId(s.getCompanyId())
                        .companyName(s.getCompanyName())
                        .logoUrl(s.getLogoUrl())
                        .totalJobs(s.getTotalJobs())
                        .totalApplications(s.getTotalApplications())
                        .totalHired(s.getTotalHired())
                        .totalRevenue(s.getTotalRevenue())
                        .streamSessions(s.getStreamSessions())
                        .build())
                .toList();

        return TopCompaniesResponse.builder()
                .companies(items)
                .total(items.size())
                .build();
    }

    @Getter
    @Builder
    public static class CompanyRankItem {
        private final int rank;
        private final UUID companyId;
        private final String companyName;
        private final String logoUrl;
        private final long totalJobs;
        private final long totalApplications;
        private final long totalHired;
        private final BigDecimal totalRevenue;
        private final long streamSessions;
    }
}