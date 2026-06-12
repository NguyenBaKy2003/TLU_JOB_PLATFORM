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
public class CandidateSearchResult {

    @Getter
    @Setter // ← cần để override matchedSkills/missingSkills sau parse
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MatchedCandidate {
        private UUID candidateProfileId;
        private String candidateName;
        private String headline;
        private String location;
        private int matchScore; // 0-100
        private String matchReason; // giải thích tại sao phù hợp
        private List<String> matchedSkills; // skill ứng viên CÓ trong requiredSkills
        private List<String> missingSkills; // skill ứng viên THIẾU trong requiredSkills
        private String experienceSummary;
        private String availabilityStatus; // ACTIVELY_LOOKING / OPEN_TO_OFFERS
    }

    private List<MatchedCandidate> candidates;
    private String searchSummary; // AI tóm tắt kết quả tìm kiếm
    private List<String> refinementTips; // gợi ý thu hẹp/mở rộng tìm kiếm
    private int totalScanned; // số profile đã quét
}