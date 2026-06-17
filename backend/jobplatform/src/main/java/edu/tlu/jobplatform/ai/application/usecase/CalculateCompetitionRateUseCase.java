package edu.tlu.jobplatform.ai.application.usecase;

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

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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
                return calculate(
                                job,
                                applicationRepo.countByJobPostId(jobPostId),
                                applicationRepo.averageAIScoreByJobPostId(jobPostId).orElse(0.0));
        }

        public Map<UUID, CompetitionRateResult> executeAll(Set<JobPost> jobs) {
                if (jobs == null || jobs.isEmpty())
                        return Map.of();

                Set<UUID> jobIds = jobs.stream().map(JobPost::getId).collect(Collectors.toSet());

                Map<UUID, Integer> counts = applicationRepo.countByJobPostIds(jobIds);
                Map<UUID, Double> avgScores = applicationRepo.avgAiScoreByJobPostIds(jobIds);

                Map<UUID, JobPost> jobMap = jobs.stream()
                                .collect(Collectors.toMap(JobPost::getId, j -> j));

                return jobIds.stream().collect(Collectors.toMap(
                                id -> id,
                                id -> calculate(
                                                jobMap.get(id),
                                                counts.getOrDefault(id, 0),
                                                avgScores.getOrDefault(id, 0.0))));
        }

        private CompetitionRateResult calculate(JobPost job, int totalApplicants, double avgAIScore) {
                long daysLeft = job.getDeadline() != null
                                ? ChronoUnit.DAYS.between(LocalDate.now(), job.getDeadline())
                                : 30L;

                CompetitionRateRequest request = CompetitionRateRequest.builder()
                                .jobPostId(job.getId())
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