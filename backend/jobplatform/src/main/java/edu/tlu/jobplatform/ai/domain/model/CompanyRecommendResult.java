package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CompanyRecommendResult {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RecommendedCompany {
        private UUID companyId;
        private String companyName;
        private int fitScore;
        private String fitReason;
        private List<String> openPositions;

        private String logoUrl;
        private String industry;
        private String slug;
        private Integer openJobs;
    }

    private List<RecommendedCompany> companies;
    private String personalitySummary;
}