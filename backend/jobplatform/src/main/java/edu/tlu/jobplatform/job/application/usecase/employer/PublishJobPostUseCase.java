package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.service.JobPostDomainService;
import edu.tlu.jobplatform.job.infrastructure.event.JobEventPublisher;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Employer publish tin tuyển dụng.
 *
 * Flow:
 * 1. Load JobPost, kiểm tra ownership
 * 2. Check quota (throw nếu hết)
 * 3. Publish (domain service validate + transition)
 * 4. Nếu featured → check & consume featured quota
 * 5. Consume job post quota
 * 6. Save + publish event
 *
 * Quota bị trừ SAU KHI save thành công để đảm bảo consistency.
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
    public JobPost execute(UUID jobPostId, UUID companyId, boolean featured) {

        // 1. Load & verify ownership
        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (!job.isOwnedBy(companyId))
            throw new BusinessRuleException("Bạn không có quyền thao tác với tin này.", "FORBIDDEN");

        // 2. Check quota trước (sẽ throw QuotaExceededException nếu hết)
        quotaService.checkJobPostQuota(companyId);

        if (featured)
            quotaService.checkFeaturedJobQuota(companyId);

        // 3. Publish (validate đủ điều kiện + state transition)
        domainService.publish(job);

        if (featured)
            job.markFeatured();

        // 4. Save
        JobPost saved = jobPostRepository.save(job);

        // 5. Consume quota SAU KHI save thành công
        quotaService.consumeJobPostQuota(companyId);
        if (featured)
            quotaService.consumeFeaturedJobQuota(companyId);

        // 6. Publish event → notification, search index...
        eventPublisher.publishJobPublished(saved);

        log.info("JobPost published: id={} company={} featured={}", saved.getId(), companyId, featured);
        return saved;
    }
}