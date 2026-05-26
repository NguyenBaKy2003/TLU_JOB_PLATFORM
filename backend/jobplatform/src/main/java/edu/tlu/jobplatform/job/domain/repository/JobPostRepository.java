package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostRepository {

    Optional<JobPost> findById(UUID id);

    Optional<JobPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);

    /** Lọc theo companyId + status — dùng cho GetCompanyJobsUseCase */
    Page<JobPost> findByCompanyIdAndStatus(UUID companyId, JobStatus status, Pageable pageable);

    Page<JobPost> findByPostedBy(UUID postedBy, Pageable pageable);

    Page<JobPost> findPublished(Pageable pageable);

    List<JobPost> findByStatusAndDeadlineBefore(JobStatus status, LocalDate date);

    Page<JobPost> findByStatus(JobStatus status, Pageable pageable);

    JobPost save(JobPost jobPost);

    void deleteById(UUID id);

    List<JobPost> findAllById(Collection<UUID> ids);
}