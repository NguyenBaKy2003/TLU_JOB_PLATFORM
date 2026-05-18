package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobRecommendResult {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RecommendedJob {
        private UUID jobPostId;
        private String jobTitle;
        private String companyName;
        private int matchScore;
        private String matchReason;
        private String urgencySignal;

        @JsonProperty("isNew")
        private boolean isNew;
    }

    private List<RecommendedJob> jobs;
    private List<String> inferredGoals;
    private String careerStage;
    private String searchPatternSummary;
}