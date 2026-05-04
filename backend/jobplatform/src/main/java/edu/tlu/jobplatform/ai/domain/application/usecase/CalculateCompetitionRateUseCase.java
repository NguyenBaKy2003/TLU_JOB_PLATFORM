package edu.tlu.jobplatform.ai.domain.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CompetitionRateRequest;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;
import edu.tlu.jobplatform.ai.domain.port.JobCompetitionPort;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate; //  LocalDate, không phải LocalDateTime
import java.time.temporal.ChronoUnit; //  thêm import này
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalculateCompetitionRateUseCase {

        private final ApplicationRepository applicationRepo;
        private final JobPostRepository jobPostRepo;
        private final JobCompetitionPort competitionPort;

        public CompetitionRateResult execute(UUID jobPostId) {
                JobPost job = jobPostRepo.findById(jobPostId)
                                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

                int totalApplicants = applicationRepo.countByJobPostId(jobPostId);

                double avgAIScore = applicationRepo.averageAIScoreByJobPostId(jobPostId)
                                .orElse(0.0);

                // LocalDate.now() để khớp kiểu với job.getDeadline() (LocalDate)
                long daysLeft = job.getDeadline() != null
                                ? ChronoUnit.DAYS.between(LocalDate.now(), job.getDeadline())
                                : 30L; // deadline null → giả định còn 30 ngày

                CompetitionRateRequest request = CompetitionRateRequest.builder()
                                .jobPostId(jobPostId)
                                .totalApplicants(totalApplicants)
                                .hiringQuota(job.getVacancies() != null ? job.getVacancies() : 1)
                                .averageAIScore(avgAIScore)
                                .totalViews(job.getViewCount())
                                .totalSaves(0)
                                .daysUntilDeadline(Math.max(0, daysLeft))
                                .jobLevel(job.getLevel())
                                .category(job.getCategory())
                                .build();

                return competitionPort.calculate(request);
        }
}