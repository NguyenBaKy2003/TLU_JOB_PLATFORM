package edu.tlu.jobplatform.job.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import edu.tlu.jobplatform.job.application.usecase.candidate.SearchJobsUseCase;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostResponse {

        private final UUID id;
        private final UUID companyId;
        private final String companyName;
        private final String companyLogoUrl;
        private final String title;
        private final String slug;
        private final String jobType;
        private final String level;
        private final String category;
        private final String salaryDisplay;
        private final String workLocationType;
        private final String workLocationCity;
        private final Integer experienceYears;
        private final Integer vacancies;
        private final LocalDate deadline;
        private final JobStatus status;
        private final int viewCount;
        private final int applicationCount;
        private final LocalDateTime publishedAt;
        private final LocalDateTime createdAt;
        private final String rejectionReason;

        /** Dùng cho search/list có company info */
        public static JobPostResponse from(SearchJobsUseCase.Result result) {
                return from(result.job(), result.company());
        }

        /** Dùng cho findPublished listing (không có company) */
        public static JobPostResponse from(JobPost j) {
                return from(j, null);
        }

        /** Dùng cho SavedJobs — có company snapshot */
        public static JobPostResponse from(JobPost j, CompanySnapshot c) {
                return JobPostResponse.builder()
                                .id(j.getId())
                                .companyId(j.getCompanyId())
                                .companyName(c != null ? c.name() : null)
                                .companyLogoUrl(c != null ? c.logoUrl() : null)
                                .title(j.getTitle())
                                .slug(j.getSlug())
                                .jobType(j.getJobType())
                                .level(j.getLevel())
                                .category(j.getCategory())
                                .salaryDisplay(j.getSalary() != null ? j.getSalary().display() : null)
                                .workLocationType(j.getWorkLocation() != null
                                                ? j.getWorkLocation().getType().name()
                                                : null)
                                .workLocationCity(j.getWorkLocation() != null
                                                ? j.getWorkLocation().getCity()
                                                : null)
                                .experienceYears(j.getExperienceYears())
                                .vacancies(j.getVacancies())
                                .deadline(j.getDeadline())
                                .status(j.getStatus())
                                .viewCount(j.getViewCount())
                                .applicationCount(j.getApplicationCount())
                                .publishedAt(j.getPublishedAt())
                                .rejectionReason(j.getRejectionReason())
                                .createdAt(j.getCreatedAt())
                                .build();
        }
}