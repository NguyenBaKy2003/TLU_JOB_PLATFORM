package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.job.domain.service.CompanySnapshotResolver;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetSavedJobsUseCase {

    private final SavedJobRepository savedJobRepository;
    private final JobPostRepository jobPostRepository;
    private final CompanySnapshotResolver companySnapshotResolver;

    public record Result(
            Page<JobPostResponse> jobs,
            Map<String, Long> categoryCounts) {
    }

    @Transactional(readOnly = true)
    public Result execute(
            UUID candidateId,
            String keyword,
            String jobType,
            String category,
            LocalDateTime savedAtFrom,
            LocalDateTime savedAtTo,
            Pageable pageable) {

        boolean noFilter = isBlank(keyword)
                && isBlank(jobType)
                && isBlank(category)
                && savedAtFrom == null
                && savedAtTo == null;

        Page<SavedJob> savedPage = noFilter
                ? savedJobRepository.findByCandidateId(candidateId, pageable)
                : savedJobRepository.searchByCandidateId(
                        candidateId, keyword, jobType, category,
                        savedAtFrom, savedAtTo, pageable);

        // Batch load jobs
        Set<UUID> jobPostIds = savedPage.stream()
                .map(SavedJob::getJobPostId)
                .collect(Collectors.toSet());

        Map<UUID, edu.tlu.jobplatform.job.domain.model.JobPost> jobMap = jobPostRepository.findAllById(jobPostIds)
                .stream()
                .collect(Collectors.toMap(
                        j -> j.getId(),
                        j -> j));

        // Batch load companies
        Set<UUID> companyIds = jobMap.values().stream()
                .map(j -> j.getCompanyId())
                .collect(Collectors.toSet());

        Map<UUID, CompanySnapshot> companyMap = companySnapshotResolver.resolveAll(companyIds);

        // Map sang response
        Page<JobPostResponse> jobPage = savedPage.map(saved -> {
            var job = jobMap.get(saved.getJobPostId());
            if (job == null) {
                log.warn("JobPost {} not found for savedJob, skipping", saved.getJobPostId());
                return null;
            }
            CompanySnapshot company = companyMap.get(job.getCompanyId());
            return JobPostResponse.from(job, company);
        });

        Map<String, Long> counts = savedJobRepository.countByCategoryForCandidate(candidateId);

        return new Result(jobPage, counts);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}