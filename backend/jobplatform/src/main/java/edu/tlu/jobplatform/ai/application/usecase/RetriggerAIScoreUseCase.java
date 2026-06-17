package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.usecase.port.out.AIScorePort;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RetriggerAIScoreUseCase {

    private final ApplicationRepository applicationRepo;
    private final JobPostRepository jobPostRepo;
    private final AIScorePort aiScorePort;

    @Transactional(readOnly = true)
    public void execute(UUID applicationId) {
        var app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));
        var job = jobPostRepo.findById(app.getJobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", app.getJobPostId()));

        triggerAIScoring(applicationId, app.getCvUrl(), job.toFullText());
    }

    @Async("aiTaskExecutor")
    protected void triggerAIScoring(UUID applicationId, String cvUrl, String jobFullText) {
        try {
            AIScore score = aiScorePort.calculateScore(applicationId, cvUrl, jobFullText);
            if (score != null) {
                applicationRepo.findById(applicationId).ifPresent(app -> {
                    app.attachAIScore(score);
                    applicationRepo.save(app);
                    log.info("[AIScore] Re-attached: applicationId={} score={}",
                            applicationId, score.getScore());
                });
            }
        } catch (Exception e) {
            log.warn("[AIScore] Retrigger failed: applicationId={} reason={}",
                    applicationId, e.getMessage());
        }
    }
}