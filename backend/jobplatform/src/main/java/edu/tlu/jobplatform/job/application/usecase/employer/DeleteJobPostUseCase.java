package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.infrastructure.event.JobEventPublisher;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Xóa bài đăng tuyển dụng (soft delete).
 *
 * Business Rules:
 * BR-01: Chỉ owner hoặc admin mới được xóa.
 * BR-02: Chỉ được xóa khi status là DRAFT, CLOSED, EXPIRED.
 * Không cho phép xóa bài đang PUBLISHED — phải close trước.
 * BR-03: Nếu bài đang CLOSED/EXPIRED (đã từng publish) → hoàn quota.
 *
 * Transition hợp lệ (theo JobStatus):
 * DRAFT → DELETED ✓
 * CLOSED → DELETED ✓ (hoàn quota)
 * EXPIRED → DELETED ✓ (hoàn quota)
 * PUBLISHED → DELETED ✗ (phải close trước)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final QuotaServicePort quotaService;

    @Transactional
    public void execute(UUID jobPostId) {

        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        // BR-01: Kiểm tra quyền
        if (!SecurityUtils.isOwnerOrAdmin(job.getPostedBy()))
            throw new BusinessRuleException(
                    "Bạn không có quyền xóa bài đăng này.", "FORBIDDEN");

        // BR-02: Không cho xóa bài đang PUBLISHED
        if (job.getStatus() == JobStatus.PUBLISHED)
            throw new BusinessRuleException(
                    "Không thể xóa bài đăng đang hiển thị. Vui lòng đóng bài trước khi xóa.",
                    "JOB_CANNOT_DELETE_PUBLISHED");

        // BR-03: Hoàn quota nếu bài đã từng được publish
        boolean wasPublished = job.getStatus() == JobStatus.CLOSED
                || job.getStatus() == JobStatus.EXPIRED;

        // Soft delete — chuyển status sang DELETED
        job.delete();
        jobPostRepository.save(job);

        // Hoàn quota sau khi save thành công
        if (wasPublished) {
            try {
                quotaService.refundQuota(job.getCompanyId());
                log.info("Quota refunded for company={} after job deleted: {}", job.getCompanyId(), jobPostId);
            } catch (Exception e) {
                // Không rollback transaction — quota refund là best-effort
                log.warn("Failed to refund quota for company={}: {}", job.getCompanyId(), e.getMessage());
            }
        }

        log.info("JobPost deleted (soft): {} [status was={}]", jobPostId, wasPublished ? "PUBLISHED_FAMILY" : "DRAFT");
    }
}