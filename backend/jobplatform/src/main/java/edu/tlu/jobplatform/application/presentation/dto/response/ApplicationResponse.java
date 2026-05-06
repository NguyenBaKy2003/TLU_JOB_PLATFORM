package edu.tlu.jobplatform.application.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

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
    private final Integer aiScore;
    private final String aiScoreLabel;
    private final LocalDateTime appliedAt;
    private final LocalDateTime interviewScheduledAt;

    private final CandidateInfo candidate;
    private final JobInfo job;
    private final CompanyInfo company;

    // ── Factory methods ─

    public static ApplicationResponse from(Application a) {
        return from(a, null, null, null);
    }

    public static ApplicationResponse from(Application a, CandidateInfo candidateInfo) {
        return from(a, candidateInfo, null, null);
    }

    public static ApplicationResponse from(Application a, CandidateInfo candidateInfo, JobInfo jobInfo) {
        return from(a, candidateInfo, jobInfo, null);
    }

    public static ApplicationResponse from(Application a,
            CandidateInfo candidateInfo,
            JobInfo jobInfo,
            CompanyInfo companyInfo) {
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
                .candidate(candidateInfo)
                .job(jobInfo)
                .company(companyInfo)
                .build();
    }

    // ── Nested DTOs

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class JobInfo {
        private final UUID id;
        private final String title;
        private final String slug;
        private final String jobType;
        private final String level;
        private final String workLocationCity;
        private final String salary;
        private final String deadline;

        /** Overload ngắn — dùng cho Employer (không cần salary/deadline) */
        public static JobInfo of(UUID id, String title, String slug,
                String jobType, String level,
                String workLocationCity) {
            return JobInfo.builder()
                    .id(id).title(title).slug(slug)
                    .jobType(jobType).level(level)
                    .workLocationCity(workLocationCity)
                    .build();
        }

        /** Overload đầy đủ — dùng cho Candidate */
        public static JobInfo of(UUID id, String title, String slug,
                String jobType, String level,
                String workLocationCity,
                String deadline, String salary) {
            return JobInfo.builder()
                    .id(id).title(title).slug(slug)
                    .jobType(jobType).level(level)
                    .workLocationCity(workLocationCity)
                    .deadline(deadline)
                    .salary(salary)
                    .build();
        }
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CompanyInfo {
        private final UUID id;
        private final String name;
        private final String logoUrl;
        private final String industry;
        private final String website;
        private final String size;
        private final String city;

        public static CompanyInfo of(UUID id, String name, String logoUrl,
                String industry, String website,
                String size, String city) {
            return CompanyInfo.builder()
                    .id(id).name(name).logoUrl(logoUrl)
                    .industry(industry).website(website)
                    .size(size).city(city)
                    .build();
        }
    }
}