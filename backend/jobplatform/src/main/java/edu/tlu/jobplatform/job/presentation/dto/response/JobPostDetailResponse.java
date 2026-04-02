package edu.tlu.jobplatform.job.presentation.dto.response;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// ── JobPostDetailResponse (full detail) ──────────────────────

public record JobPostDetailResponse(
                UUID id,
                UUID companyId,
                String title,
                String description,
                String requirements,
                String benefits,
                String categoryCode,
                String level,
                String jobType,
                int headcount,
                // Salary
                boolean salaryNegotiate,
                BigDecimal salaryMin,
                BigDecimal salaryMax,
                String salaryCurrency,
                String salaryDisplay,
                // Location
                String workLocationType,
                String city,
                String address,
                String workLocationDisplay,
                // Status
                JobStatus status,
                boolean featured,
                int viewCount,
                // Skills
                List<SkillResponse> skills,
                // Dates
                LocalDateTime deadline,
                LocalDateTime publishedAt,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
        public static JobPostDetailResponse from(JobPost job) {
                List<SkillResponse> skills = job.getSkills().stream()
                                .map(s -> new SkillResponse(s.getSkillName(), s.isRequired(), s.getYearsRequired()))
                                .toList();

                return new JobPostDetailResponse(
                                job.getId(), job.getCompanyId(), job.getTitle(),
                                job.getDescription(), job.getRequirements(), job.getBenefits(),
                                job.getCategoryCode(), job.getLevel(), job.getJobType(), job.getHeadcount(),
                                job.getSalary() != null && job.getSalary().isNegotiate(),
                                job.getSalary() != null ? job.getSalary().getMin() : null,
                                job.getSalary() != null ? job.getSalary().getMax() : null,
                                job.getSalary() != null ? job.getSalary().getCurrency() : null,
                                job.getSalary() != null ? job.getSalary().display() : null,
                                job.getWorkLocation() != null ? job.getWorkLocation().getType().name() : null,
                                job.getWorkLocation() != null ? job.getWorkLocation().getCity() : null,
                                job.getWorkLocation() != null ? job.getWorkLocation().getAddress() : null,
                                job.getWorkLocation() != null ? job.getWorkLocation().display() : null,
                                job.getStatus(), job.isFeatured(), job.getViewCount(),
                                skills,
                                job.getDeadline(), job.getPublishedAt(), job.getCreatedAt(), job.getUpdatedAt());
        }

        public record SkillResponse(String skillName, boolean required, int yearsRequired) {
        }
}