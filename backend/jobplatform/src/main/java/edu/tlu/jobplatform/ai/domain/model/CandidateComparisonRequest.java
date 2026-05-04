package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CandidateComparisonRequest {
    private final UUID jobPostId;
    private final String jobTitle;
    private final String jobRequirements;
    private final String jobLevel;
    private final List<CandidateProfile> candidates;

    @Getter
    @Builder
    public static class CandidateProfile {
        private final UUID applicationId;
        private final String candidateName;
        private final String cvText;
        private final int aiScore; // điểm AI đã tính sẵn
        private final int skillMatchScore;
        private final int experienceScore;
        private final int educationScore;
        private final List<String> strengths;
        private final List<String> gaps;
    }
}