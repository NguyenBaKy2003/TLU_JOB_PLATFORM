package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;
import lombok.NoArgsConstructor;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PassProbabilityResult {

    public enum ConfidenceLevel {
        HIGH, MEDIUM, LOW
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImprovementTip {
        private String area; // "Kỹ năng", "Kinh nghiệm", "Học vấn"
        private String tip; // nội dung gợi ý
        private int estimatedBoost; // ước tính tăng bao nhiêu % nếu cải thiện
    }

    private double probability; // 0.0 → 1.0
    private ConfidenceLevel confidenceLevel;
    private int matchScore; // 0-100, từ AI phân tích CV vs JD
    private List<String> strongPoints; // điểm mạnh so với JD
    private List<String> weakPoints; // điểm yếu so với JD
    private List<ImprovementTip> improvementTips;
    private String summary;
}