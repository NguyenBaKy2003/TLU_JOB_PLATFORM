package edu.tlu.jobplatform.job.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Response đầy đủ cho trang chi tiết */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostDetailResponse {

        private final UUID id;
        private final UUID companyId;
        private final UUID postedBy;
        private final String title;
        private final String slug;
        private final String description;
        private final String requirements;
        private final String benefits;
        private final String jobType;
        private final String level;
        private final String category;

        // Salary
        private final String salaryDisplay;
        private final Boolean salaryNegotiable;

        // WorkLocation
        private final String workLocationType;
        private final String workLocationCity;
        private final String workLocationAddress;

        private final Integer experienceYears;
        private final Integer vacancies;
        private final LocalDate deadline;
        private final JobStatus status;
        private final boolean acceptingApplications;

        private final int viewCount;
        private final int applicationCount;

        private final List<SkillDto> skills;

        private final LocalDateTime publishedAt;
        private final LocalDateTime createdAt;

        public static JobPostDetailResponse from(JobPost j) {
                List<SkillDto> skills = j.getSkills() == null ? List.of()
                                : j.getSkills().stream().map(SkillDto::from).toList();

                return JobPostDetailResponse.builder()
                                .id(j.getId())
                                .companyId(j.getCompanyId())
                                .postedBy(j.getPostedBy())
                                .title(j.getTitle())
                                .slug(j.getSlug())
                                .description(j.getDescription())
                                .requirements(j.getRequirements())
                                .benefits(j.getBenefits())
                                .jobType(j.getJobType())
                                .level(j.getLevel())
                                .category(j.getCategory())
                                .salaryDisplay(j.getSalary() != null ? j.getSalary().display() : null)
                                .salaryNegotiable(j.getSalary() != null ? j.getSalary().isNegotiable() : null)
                                .workLocationType(j.getWorkLocation() != null ? j.getWorkLocation().getType().name()
                                                : null)
                                .workLocationCity(j.getWorkLocation() != null ? j.getWorkLocation().getCity() : null)
                                .workLocationAddress(
                                                j.getWorkLocation() != null ? j.getWorkLocation().getAddress() : null)
                                .experienceYears(j.getExperienceYears())
                                .vacancies(j.getVacancies())
                                .deadline(j.getDeadline())
                                .status(j.getStatus())
                                .acceptingApplications(j.isAcceptingApplications())
                                .viewCount(j.getViewCount())
                                .applicationCount(j.getApplicationCount())
                                .skills(skills)
                                .publishedAt(j.getPublishedAt())
                                .createdAt(j.getCreatedAt())
                                .build();
        }

        @Getter
        @Builder
        public static class SkillDto {
                private final String skillName;
                private final String level;
                private final boolean required;

                public static SkillDto from(JobPostSkill s) {
                        return SkillDto.builder()
                                        .skillName(s.getSkillName())
                                        .level(s.getLevel())
                                        .required(s.isRequired())
                                        .build();
                }
        }
}