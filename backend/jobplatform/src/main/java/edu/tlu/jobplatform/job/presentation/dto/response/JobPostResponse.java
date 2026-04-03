package edu.tlu.jobplatform.job.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/** Response ngắn gọn cho danh sách */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostResponse {

        private final UUID id;
        private final UUID companyId;
        private final String title;
        private final String slug;
        private final String jobType;
        private final String level;
        private final String category;
        private final String salaryDisplay; // "20tr - 35tr VND"
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

        public static JobPostResponse from(JobPost j) {
                return JobPostResponse.builder()
                                .id(j.getId())
                                .companyId(j.getCompanyId())
                                .title(j.getTitle())
                                .slug(j.getSlug())
                                .jobType(j.getJobType())
                                .level(j.getLevel())
                                .category(j.getCategory())
                                .salaryDisplay(j.getSalary() != null ? j.getSalary().display() : null)
                                .workLocationType(j.getWorkLocation() != null ? j.getWorkLocation().getType().name()
                                                : null)
                                .workLocationCity(j.getWorkLocation() != null ? j.getWorkLocation().getCity() : null)
                                .experienceYears(j.getExperienceYears())
                                .vacancies(j.getVacancies())
                                .deadline(j.getDeadline())
                                .status(j.getStatus())
                                .viewCount(j.getViewCount())
                                .applicationCount(j.getApplicationCount())
                                .publishedAt(j.getPublishedAt())
                                .createdAt(j.getCreatedAt())
                                .build();
        }
}