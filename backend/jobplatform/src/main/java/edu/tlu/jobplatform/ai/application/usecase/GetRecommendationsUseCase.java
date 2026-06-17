package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CandidateTrendRequest;
import edu.tlu.jobplatform.ai.domain.model.CompanyRecommendResult;
import edu.tlu.jobplatform.ai.domain.model.JobRecommendResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateTrendAnalysisPort;
import edu.tlu.jobplatform.ai.domain.port.SearchEventRepository;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob;
import edu.tlu.jobplatform.candidate.domain.model.Skill;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.job.application.port.out.CompanyQueryPort;
import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetRecommendationsUseCase {

        private final SearchEventRepository searchEventRepo;
        private final CandidateProfileRepository candidateRepo;
        private final CandidateTrendAnalysisPort trendPort;
        private final JobSearchPort jobSearchPort;
        private final CompanyQueryPort companyQueryPort;

        @Cacheable(value = "recommendations", key = "#candidateId")
        public RecommendationBundle execute(UUID candidateId) {

                CandidateProfile candidate = candidateRepo.findById(candidateId)
                                .orElseThrow(() -> ResourceNotFoundException.of("Candidate", candidateId));

                LocalDateTime since = LocalDateTime.now().minusDays(30);

                List<String> keywords = searchEventRepo.findKeywordsByCandidate(candidateId, since, 20);
                List<String> viewedTitles = searchEventRepo.findTopViewedJobTitles(candidateId, since, 10);
                List<String> appliedTitles = searchEventRepo.findAppliedJobTitles(candidateId);
                List<String> savedTitles = searchEventRepo.findSavedJobTitles(candidateId);

                List<String> skillNames = candidate.getSkills().stream()
                                .map(Skill::getName)
                                .toList();

                String level = candidate.getDesiredJobs().stream()
                                .findFirst()
                                .map(dj -> dj.getLevels().stream()
                                                .map(DesiredJob.Level::name)
                                                .collect(Collectors.joining(", ")))
                                .orElse(null);

                List<JobPost> publishedJobs = jobSearchPort.search(
                                null, null, null, null, null, null,
                                null, null, null, null, null,
                                PageRequest.of(0, 6)).getContent();

                Set<UUID> companyIds = publishedJobs.stream()
                                .map(JobPost::getCompanyId)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toSet());

                Map<UUID, String> companyNameMap = companyIds.isEmpty()
                                ? Map.of()
                                : companyQueryPort.findByIds(companyIds).entrySet().stream()
                                                .collect(Collectors.toMap(
                                                                Map.Entry::getKey,
                                                                e -> e.getValue() != null && e.getValue().name() != null
                                                                                ? e.getValue().name()
                                                                                : ""));

                CandidateTrendRequest request = CandidateTrendRequest.builder()
                                .candidateId(candidateId)
                                .recentKeywords(keywords)
                                .viewedJobTitles(viewedTitles)
                                .appliedJobTitles(appliedTitles)
                                .savedJobTitles(savedTitles)
                                .candidateSkills(skillNames)
                                .candidateLevel(level)
                                .candidateLocation(candidate.getLocation())
                                .publishedJobs(publishedJobs)
                                .companyNameMap(companyNameMap)
                                .build();

                JobRecommendResult jobs = trendPort.recommendJobs(request);
                CompanyRecommendResult companies = trendPort.recommendCompanies(request);

                return new RecommendationBundle(jobs, companies);
        }

        @Getter
        @NoArgsConstructor
        @AllArgsConstructor
        public static class RecommendationBundle {
                private JobRecommendResult jobs;
                private CompanyRecommendResult companies;
        }
}