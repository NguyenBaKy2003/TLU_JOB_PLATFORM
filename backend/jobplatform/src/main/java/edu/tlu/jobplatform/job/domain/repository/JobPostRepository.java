package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobPostRepository {

    Optional<JobPost> findById(UUID id);

    Optional<JobPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /** Danh sách bài đăng của công ty */
    Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable);

    /** Danh sách bài đăng của employer */
    Page<JobPost> findByPostedBy(UUID postedBy, Pageable pageable);

    /** Bài đăng đang PUBLISHED — public listing */
    Page<JobPost> findPublished(Pageable pageable);

    /** Tìm bài đăng PUBLISHED sắp hết hạn — để scheduler xử lý */
    List<JobPost> findPublishedExpiredBefore(LocalDate date);

    /** Tìm bài đăng theo status — Admin */
    Page<JobPost> findByStatus(JobStatus status, Pageable pageable);

    JobPost save(JobPost jobPost);

    void deleteById(UUID id);
}