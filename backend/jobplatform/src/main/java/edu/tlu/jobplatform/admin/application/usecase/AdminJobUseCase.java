package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Admin quản lý bài đăng:
 * - Xem danh sách theo status
 * - Force-close bài vi phạm
 * - Force-delete bài vi phạm
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminJobUseCase {

    private final JobPostRepository jobPostRepo;

    @Transactional(readOnly = true)
    public Page<JobPost> listByStatus(JobStatus status, Pageable pageable) {
        if (status != null)
            return jobPostRepo.findByStatus(status, pageable);
        return jobPostRepo.findPublished(pageable);
    }

    /** Admin đóng bài đăng vi phạm */
    @Transactional
    public JobPost forceClose(UUID jobPostId, String reason) {
        JobPost job = jobPostRepo.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (job.getStatus() != JobStatus.PUBLISHED)
            throw new BusinessRuleException(
                    "Chỉ có thể force-close bài đang PUBLISHED.", "INVALID_JOB_STATUS");

        job.close();
        log.warn("Admin force-closed job: {} reason='{}'", jobPostId, reason);
        return jobPostRepo.save(job);
    }

    /** Admin xóa bài đăng vi phạm */
    @Transactional
    public void forceDelete(UUID jobPostId) {
        JobPost job = jobPostRepo.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        job.delete();
        jobPostRepo.save(job);
        log.warn("Admin force-deleted job: {}", jobPostId);
    }

    /** Tìm kiếm đa điều kiện cho admin */
    @Transactional(readOnly = true)
    public Page<JobPost> adminSearch(String keyword, JobStatus status,
            String city, String category, Pageable pageable) {
        return jobPostRepo.adminSearch(keyword, status, city, category, pageable);
    }

}
