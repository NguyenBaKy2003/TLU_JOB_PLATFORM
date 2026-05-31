package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface JobPostRepository {

    Optional<JobPost> findById(UUID id);

    Optional<JobPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);

    Page<JobPost> findByCompanyIdAndStatus(UUID companyId, JobStatus status, Pageable pageable);

    Page<JobPost> findByPostedBy(UUID postedBy, Pageable pageable);

    Page<JobPost> searchMyJobs(UUID postedBy, JobStatus status, String keyword,
            LocalDateTime createdAtFrom, LocalDateTime createdAtTo, Pageable pageable);

    Map<JobStatus, Long> countMyJobsByStatus(UUID postedBy);

    Page<JobPost> findPublished(Pageable pageable);

    List<JobPost> findByStatusAndDeadlineBefore(JobStatus status, LocalDate date);

    Page<JobPost> findByStatus(JobStatus status, Pageable pageable);

    JobPost save(JobPost jobPost);

    void deleteById(UUID id);

    List<JobPost> findAllById(Collection<UUID> ids);

    Page<JobPost> findAllExceptDeleted(Pageable pageable);

    Page<JobPost> adminSearch(String keyword, JobStatus status,
            String city, String category, Pageable pageable);
}