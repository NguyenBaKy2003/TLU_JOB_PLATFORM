package edu.tlu.jobplatform.application.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/** Response ngắn gọn cho danh sách */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationResponse {

    private final UUID id;
    private final UUID jobPostId;
    private final UUID candidateId;
    private final UUID companyId;
    private final ApplicationStatus status;
    private final String cvUrl;
    private final boolean hasAIScore;
    private final Integer aiScore; // null nếu chưa tính
    private final String aiScoreLabel; // "Rất phù hợp"
    private final LocalDateTime appliedAt;
    private final LocalDateTime interviewScheduledAt;

    public static ApplicationResponse from(Application a) {
        return ApplicationResponse.builder()
                .id(a.getId())
                .jobPostId(a.getJobPostId())
                .candidateId(a.getCandidateId())
                .companyId(a.getCompanyId())
                .status(a.getStatus())
                .cvUrl(a.getCvUrl())
                .hasAIScore(a.hasAIScore())
                .aiScore(a.getAiScore() != null ? a.getAiScore().getScore() : null)
                .aiScoreLabel(a.getAiScore() != null ? a.getAiScore().getLabel() : null)
                .appliedAt(a.getAppliedAt())
                .interviewScheduledAt(a.getInterviewScheduledAt())
                .build();
    }
}