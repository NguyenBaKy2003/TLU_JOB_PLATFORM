package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CompetitionRateResult {

    public enum Level {
        LOW, MEDIUM, HIGH, EXTREME
    }

    public enum Trend {
        INCREASING, STABLE, DECREASING
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBreakdown {
        private double applicantRatioScore; // 0-30 (30%)
        private double poolQualityScore; // 0-25 (25%)
        private double jobPopularityScore; // 0-15 (15%)
        private double entryBarrierScore; // 0-15 (15%)
        private double urgencyScore; // 0-15 (15%)
    }

    private int competitionScore; // 0-100
    private Level level;
    private Trend trend;
    private int totalApplicants;
    private double averageAIScore;
    private int hiringQuota;
    private double applicationToHiringRatio; // tỷ lệ đơn/vị trí
    private ScoreBreakdown breakdown;
    private String candidateAdvice; // lời khuyên cho candidate
    private String employerInsight; // insight cho employer
}
