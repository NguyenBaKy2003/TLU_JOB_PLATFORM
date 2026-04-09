package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.service.ApplicationDomainService;
import edu.tlu.jobplatform.application.infrastructure.event.ApplicationDomainEventPublisher;
import edu.tlu.jobplatform.application.usecase.port.out.AIScorePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Ứng viên nộp đơn ứng tuyển.
 *
 * Flow:
 * 1. Validate: job đang nhận CV, chưa nộp trước đó, có CV
 * 2. Tạo Application (SUBMITTED)
 * 3. Tăng applicationCount của JobPost
 * 4. Fire ApplicationSubmittedEvent (email xác nhận)
 * 5. Trigger AI scoring bất đồng bộ
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubmitApplicationUseCase {

    private final ApplicationRepository applicationRepo;
    private final JobPostRepository jobPostRepo;
    private final ApplicationDomainService domainService;
    private final ApplicationDomainEventPublisher eventPublisher;
    private final AIScorePort aiScorePort;

    @Transactional
    public Application execute(Command cmd) {

        // Load bài đăng
        JobPost job = jobPostRepo.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        // BR: job phải đang nhận CV
        domainService.validateSubmission(cmd.cvUrl(), job.isAcceptingApplications());

        // BR: không được nộp 2 lần
        if (applicationRepo.existsByJobPostIdAndCandidateId(cmd.jobPostId(), cmd.candidateId()))
            throw new BusinessRuleException(
                    "Bạn đã nộp đơn vào vị trí này rồi.", "ALREADY_APPLIED");

        Application application = Application.builder()
                .id(UUID.randomUUID())
                .jobPostId(cmd.jobPostId())
                .candidateId(cmd.candidateId())
                .companyId(job.getCompanyId())
                .cvUrl(cmd.cvUrl())
                .coverLetter(cmd.coverLetter())
                .expectedSalary(cmd.expectedSalary())
                .status(ApplicationStatus.SUBMITTED)
                .aiScoreCalculated(false)
                .appliedAt(LocalDateTime.now())
                .build();

        Application saved = applicationRepo.save(application);

        // Tăng applicationCount
        job.incrementApplications();
        jobPostRepo.save(job);

        // Fire event → email xác nhận
        eventPublisher.publishApplicationSubmitted(saved, job.getTitle());

        // AI scoring bất đồng bộ
        triggerAIScoring(saved.getId(), cmd.cvUrl(), job.toFullText());

        log.info("Application submitted: id={} candidate={} job={}",
                saved.getId(), cmd.candidateId(), cmd.jobPostId());
        return saved;
    }

    /** Tính điểm AI trong background — không block response */
    @Async("aiTaskExecutor")
    protected void triggerAIScoring(UUID applicationId, String cvUrl, String jobFullText) {
        try {
            var score = aiScorePort.calculateScore(applicationId, cvUrl, jobFullText);
            if (score != null) {
                applicationRepo.findById(applicationId).ifPresent(app -> {
                    app.attachAIScore(score);
                    applicationRepo.save(app);
                    log.info("AI score attached: applicationId={} score={}", applicationId, score.getScore());
                });
            }
        } catch (Exception e) {
            log.warn("AI scoring failed for applicationId={}: {}", applicationId, e.getMessage());
        }
    }

    public record Command(
            UUID jobPostId,
            UUID candidateId,
            String cvUrl,
            String coverLetter,
            String expectedSalary) {
    }
}