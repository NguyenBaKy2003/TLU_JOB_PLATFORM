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
public class CandidateComparisonResult {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankedCandidate {
        private int rank;
        private UUID applicationId;
        private String candidateName;
        private int totalScore;
        private int skillScore;
        private int experienceScore;
        private int educationScore;
        private List<String> uniqueStrengths; // nổi bật hơn các ứng viên khác
        private List<String> relativeWeaknesses; // yếu hơn mặt bằng chung
        private String verdict; // "Ứng viên xuất sắc nhất về kỹ thuật"
    }

    private List<RankedCandidate> ranking;
    private UUID topRecommendation; // applicationId được đề xuất nhất
    private String comparisonSummary; // nhận xét tổng thể về cả pool
    private String recruitmentAdvice; // lời khuyên cho employer
}
