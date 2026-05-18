package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.usecase.port.out.AIScorePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
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

    @Async("aiTaskExecutor")
    @Transactional
    public void execute(UUID applicationId) {
        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));
        JobPost job = jobPostRepo.findById(app.getJobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", app.getJobPostId()));

        AIScore score = aiScorePort.calculateScore(applicationId, app.getCvUrl(), job.toFullText());
        if (score != null) {
            app.attachAIScore(score);
            applicationRepo.save(app);
            log.info("AI rescore done: applicationId={} score={}", applicationId, score.getScore());
        }
    }
}
