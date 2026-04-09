package edu.tlu.jobplatform.application.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationDetailResponse {

    private final UUID id;
    private final UUID jobPostId;
    private final UUID candidateId;
    private final UUID companyId;
    private final String cvUrl;
    private final String coverLetter;
    private final String expectedSalary;
    private final ApplicationStatus status;
    private final String rejectionReason;

    // Interview info
    private final LocalDateTime interviewScheduledAt;
    private final String interviewLocation;
    private final String interviewNote;

    // AI Score
    private final boolean aiScoreCalculated;
    private final AIScoreDto aiScore;

    private final LocalDateTime appliedAt;
    private final LocalDateTime updatedAt;

    // Status change history
    private final List<StatusLogDto> statusHistory;

    public static ApplicationDetailResponse from(Application a) {
        return from(a, List.of());
    }

    public static ApplicationDetailResponse from(Application a,
            List<ApplicationStatusLog> logs) {
        AIScoreDto scoreDto = null;
        if (a.getAiScore() != null) {
            var s = a.getAiScore();
            scoreDto = AIScoreDto.builder()
                    .score(s.getScore()).label(s.getLabel())
                    .skillMatchScore(s.getSkillMatchScore())
                    .experienceScore(s.getExperienceScore())
                    .educationScore(s.getEducationScore())
                    .strengths(s.getStrengths()).gaps(s.getGaps())
                    .summary(s.getSummary()).build();
        }

        List<StatusLogDto> history = logs.stream()
                .map(l -> StatusLogDto.builder()
                        .fromStatus(l.getFromStatus()).toStatus(l.getToStatus())
                        .note(l.getNote()).changedAt(l.getChangedAt()).build())
                .toList();

        return ApplicationDetailResponse.builder()
                .id(a.getId()).jobPostId(a.getJobPostId())
                .candidateId(a.getCandidateId()).companyId(a.getCompanyId())
                .cvUrl(a.getCvUrl()).coverLetter(a.getCoverLetter())
                .expectedSalary(a.getExpectedSalary()).status(a.getStatus())
                .rejectionReason(a.getRejectionReason())
                .interviewScheduledAt(a.getInterviewScheduledAt())
                .interviewLocation(a.getInterviewLocation())
                .interviewNote(a.getInterviewNote())
                .aiScoreCalculated(a.isAiScoreCalculated()).aiScore(scoreDto)
                .appliedAt(a.getAppliedAt()).updatedAt(a.getUpdatedAt())
                .statusHistory(history).build();
    }

    @Getter
    @Builder
    public static class StatusLogDto {
        private final ApplicationStatus fromStatus;
        private final ApplicationStatus toStatus;
        private final String note;
        private final LocalDateTime changedAt;
    }

    @Getter
    @Builder
    public static class AIScoreDto {
        private final int score;
        private final String label;
        private final int skillMatchScore;
        private final int experienceScore;
        private final int educationScore;
        private final List<String> strengths;
        private final List<String> gaps;
        private final String summary;
    }
}