package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.service.JobPostDomainService;
import edu.tlu.jobplatform.job.infrastructure.event.JobEventPublisher;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublishJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final JobPostDomainService domainService;
    private final QuotaServicePort quotaService;
    private final JobEventPublisher eventPublisher;

    /**
     * Flow:
     * 1. Load + ownership check
     * 2. Validate nội dung JD
     * 3. Trừ job post quota
     * 4. Nếu featured → trừ featured quota
     * (exception ở bước 4 → rollback toàn bộ transaction kể cả bước 3)
     * 5. Publish + đánh dấu featured nếu có
     * 6. Save + fire event
     */
    @Transactional
    public JobPost execute(Command cmd) {

        JobPost job = jobPostRepository.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        if (!SecurityUtils.isOwnerOrAdmin(job.getPostedBy()))
            throw new BusinessRuleException(
                    "Bạn không có quyền publish bài đăng này.", "FORBIDDEN");

        domainService.validateForPublish(job);

        // Trừ quota đăng tin thường — throw nếu hết
        quotaService.consumeQuota(job.getCompanyId());

        // Trừ quota featured nếu cần — throw nếu hết (rollback cả bước trên)
        if (cmd.featured()) {
            quotaService.consumeFeaturedQuota(job.getCompanyId());
            job.markFeatured();
        }

        job.publish();
        JobPost saved = jobPostRepository.save(job);
        eventPublisher.publishJobPublished(saved);

        log.info("JobPost published: {} [company={}, featured={}]",
                cmd.jobPostId(), job.getCompanyId(), cmd.featured());
        return saved;
    }

    /** Backward-compatible: publish không featured */
    @Transactional
    public JobPost execute(UUID jobPostId) {
        return execute(new Command(jobPostId, false));
    }

    public record Command(UUID jobPostId, boolean featured) {
    }
}