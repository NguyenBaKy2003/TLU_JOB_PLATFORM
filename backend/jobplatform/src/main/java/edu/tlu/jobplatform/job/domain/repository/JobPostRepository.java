package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostRepository {

    Optional<JobPost> findById(UUID id);

    /** Tất cả tin của một công ty (employer xem) */
    List<JobPost> findByCompanyId(UUID companyId);

    /** Tin đang published của một công ty (public profile) */
    List<JobPost> findPublishedByCompanyId(UUID companyId);

    /** Tìm tin sắp hết hạn — dùng bởi scheduler */
    List<JobPost> findByStatusAndDeadlineBefore(JobStatus status, LocalDateTime threshold);

    /** Tìm tin featured đang active */
    List<JobPost> findFeaturedAndPublished();

    JobPost save(JobPost jobPost);

    void deleteById(UUID id);
}