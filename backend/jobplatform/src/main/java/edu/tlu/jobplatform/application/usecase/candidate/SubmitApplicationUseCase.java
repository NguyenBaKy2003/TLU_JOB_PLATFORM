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
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeCandidateQuotaUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmitApplicationUseCase {

    private final ApplicationRepository applicationRepo;
    private final JobPostRepository jobPostRepo;
    private final ApplicationDomainService domainService;
    private final ApplicationDomainEventPublisher eventPublisher;
    private final AIScorePort aiScorePort;
    private final ConsumeCandidateQuotaUseCase consumeQuotaUseCase;

    @Transactional
    public Application execute(Command cmd) {

        // 1. Load bài đăng
        JobPost job = jobPostRepo.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        // 2. Validate: job đang nhận CV, CV hợp lệ
        domainService.validateSubmission(cmd.cvUrl(), job.isAcceptingApplications());

        // 3. Validate: chưa nộp đơn trước đó
        if (applicationRepo.existsByJobPostIdAndCandidateId(cmd.jobPostId(), cmd.candidateId()))
            throw new BusinessRuleException(
                    "Bạn đã nộp đơn vào vị trí này rồi.", "ALREADY_APPLIED");

        // 4. Trừ quota ứng tuyển — phải trước khi tạo Application
        // Ném BusinessRuleException nếu:
        // - Không có gói active → "NO_ACTIVE_CANDIDATE_SUBSCRIPTION"
        // - Đã hết lượt trong tháng → "APPLICATION_QUOTA_EXCEEDED"
        // Cả hai lỗi đều rollback toàn bộ transaction (quota + application).
        consumeQuotaUseCase.execute(cmd.candidateId(), ConsumeCandidateQuotaUseCase.QuotaType.APPLICATION);

        // 5. Tạo Application
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

        // 6. Tăng applicationCount trên JobPost
        job.incrementApplications();
        jobPostRepo.save(job);

        // 7. Fire event → email xác nhận ứng tuyển
        eventPublisher.publishApplicationSubmitted(saved, job.getTitle());

        // 8. AI scoring bất đồng bộ — không block response
        triggerAIScoring(saved.getId(), cmd.cvUrl(), job.toFullText());

        log.info("[SubmitApplication] Submitted: id={} candidate={} job={}",
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
                    log.info("[AIScore] Attached: applicationId={} score={}",
                            applicationId, score.getScore());
                });
            }
        } catch (Exception e) {
            log.warn("[AIScore] Failed: applicationId={} reason={}", applicationId, e.getMessage());
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