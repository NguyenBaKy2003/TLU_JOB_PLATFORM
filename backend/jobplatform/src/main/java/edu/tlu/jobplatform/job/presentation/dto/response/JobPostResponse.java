package edu.tlu.jobplatform.job.presentation.dto.response;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;

import java.time.LocalDateTime;
import java.util.UUID;

// ── JobPostResponse (list item — ít field) ────────────────────

public record JobPostResponse(
                UUID id,
                UUID companyId,
                String title,
                String categoryCode,
                String level,
                String jobType,
                String salaryDisplay,
                String workLocationDisplay,
                String city,
                JobStatus status,
                boolean featured,
                int viewCount,
                LocalDateTime deadline,
                LocalDateTime publishedAt,
                LocalDateTime createdAt) {
        public static JobPostResponse from(JobPost job) {
                return new JobPostResponse(
                                job.getId(),
                                job.getCompanyId(),
                                job.getTitle(),
                                job.getCategoryCode(),
                                job.getLevel(),
                                job.getJobType(),
                                job.getSalary() != null ? job.getSalary().display() : null,
                                job.getWorkLocation() != null ? job.getWorkLocation().display() : null,
                                job.getWorkLocation() != null ? job.getWorkLocation().getCity() : null,
                                job.getStatus(),
                                job.isFeatured(),
                                job.getViewCount(),
                                job.getDeadline(),
                                job.getPublishedAt(),
                                job.getCreatedAt());
        }
}