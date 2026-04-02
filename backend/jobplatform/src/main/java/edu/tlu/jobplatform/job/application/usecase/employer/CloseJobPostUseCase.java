package edu.tlu.jobplatform.job.application.usecase.employer;

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
 * UseCase: Employer đóng tin tuyển dụng.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloseJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final JobPostDomainService domainService;
    private final JobEventPublisher eventPublisher;

    @Transactional
    public JobPost execute(UUID jobPostId, UUID companyId) {

        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (!job.isOwnedBy(companyId))
            throw new BusinessRuleException("Bạn không có quyền đóng tin này.", "FORBIDDEN");

        domainService.close(job);
        JobPost saved = jobPostRepository.save(job);

        eventPublisher.publishJobClosed(saved);
        log.info("JobPost closed: id={}", jobPostId);
        return saved;
    }
}