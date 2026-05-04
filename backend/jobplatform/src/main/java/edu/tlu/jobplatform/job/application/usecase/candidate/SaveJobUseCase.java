package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

// ── SaveJobUseCase ────
@Slf4j
@Service
@RequiredArgsConstructor
public class SaveJobUseCase {

    private final SavedJobRepository savedJobRepository;
    private final JobPostRepository jobPostRepository;

    @Transactional
    public boolean toggle(UUID candidateId, UUID jobPostId) {
        jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (savedJobRepository.existsByCandidateIdAndJobPostId(candidateId, jobPostId)) {
            savedJobRepository.deleteByCandidateIdAndJobPostId(candidateId, jobPostId);
            return false;
        }

        savedJobRepository.save(SavedJob.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .jobPostId(jobPostId)
                .savedAt(LocalDateTime.now())
                .build());
        return true;
    }

    @Transactional(readOnly = true)
    public Page<JobPostResponse> getSavedJobs(UUID candidateId, Pageable pageable) {
        Page<SavedJob> savedJobs = savedJobRepository.findByCandidateId(candidateId, pageable);

        return savedJobs.map(saved -> jobPostRepository.findById(saved.getJobPostId())
                .map(JobPostResponse::from)
                .orElseGet(() -> {
                    log.warn("JobPost {} not found for savedJob, skipping", saved.getJobPostId());
                    return null;
                }));
    }
}