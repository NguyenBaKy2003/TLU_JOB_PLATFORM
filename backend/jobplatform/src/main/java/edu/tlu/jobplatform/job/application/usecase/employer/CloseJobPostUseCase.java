package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
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

// ── CloseJobPostUseCase ───────────────────────────────────────────

@Slf4j
@Service
@RequiredArgsConstructor
public class CloseJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final JobEventPublisher eventPublisher;

    @Transactional
    public JobPost execute(UUID jobPostId) {

        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (!SecurityUtils.isOwnerOrAdmin(job.getPostedBy()))
            throw new BusinessRuleException("Bạn không có quyền đóng bài đăng này.", "FORBIDDEN");

        job.close();
        JobPost saved = jobPostRepository.save(job);

        eventPublisher.publishJobClosed(saved);

        log.info("JobPost closed: {}", jobPostId);
        return saved;
    }
}
