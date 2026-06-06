package edu.tlu.jobplatform.application.presentation.dto.response;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class InterviewScheduleResponse {

    private UUID applicationId;
    private LocalDateTime scheduledAt;
    private String location;
    private String note;

    // Candidate info
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidateAvatarUrl;

    // Job info
    private UUID jobPostId;
    private String jobTitle;

    public static InterviewScheduleResponse from(
            Application app,
            CandidateInfo candidate,
            String jobTitle) {

        return InterviewScheduleResponse.builder()
                .applicationId(app.getId())
                .scheduledAt(app.getInterviewScheduledAt())
                .location(app.getInterviewLocation())
                .note(app.getInterviewNote())
                .candidateId(app.getCandidateId())
                .candidateName(candidate != null ? candidate.getFullName() : null)
                .candidateEmail(candidate != null ? candidate.getEmail() : null)
                .candidateAvatarUrl(candidate != null ? candidate.getAvatarUrl() : null)
                .jobPostId(app.getJobPostId())
                .jobTitle(jobTitle)
                .build();
    }
}