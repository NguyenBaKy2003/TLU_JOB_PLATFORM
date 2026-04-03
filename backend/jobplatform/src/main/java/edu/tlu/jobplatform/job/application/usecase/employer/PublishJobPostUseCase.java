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

/**
 * UseCase: Publish bài đăng tuyển dụng.
 *
 * Flow:
 * 1. Load bài đăng, kiểm tra ownership
 * 2. Domain service validate nội dung đủ để publish
 * 3. Kiểm tra quota còn không
 * 4. Trừ quota
 * 5. Chuyển status → PUBLISHED
 * 6. Fire JobPublishedEvent → Search + AI index
 *
 * Bước 4+5 trong cùng 1 transaction — nếu save thất bại, quota không bị trừ.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublishJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final JobPostDomainService domainService;
    private final QuotaServicePort quotaService;
    private final JobEventPublisher eventPublisher;

    @Transactional
    public JobPost execute(UUID jobPostId) {

        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        // Chỉ owner mới được publish
        if (!SecurityUtils.isOwnerOrAdmin(job.getPostedBy()))
            throw new BusinessRuleException("Bạn không có quyền publish bài đăng này.", "FORBIDDEN");

        // Validate nội dung JD
        domainService.validateForPublish(job);

        // Kiểm tra và trừ quota (throw QuotaExceededException nếu hết)
        quotaService.consumeQuota(job.getCompanyId());

        // Publish
        job.publish();
        JobPost saved = jobPostRepository.save(job);

        // Fire event → Search index + AI embedding (async)
        eventPublisher.publishJobPublished(saved);

        log.info("JobPost published: {} [company={}]", jobPostId, job.getCompanyId());
        return saved;
    }
}