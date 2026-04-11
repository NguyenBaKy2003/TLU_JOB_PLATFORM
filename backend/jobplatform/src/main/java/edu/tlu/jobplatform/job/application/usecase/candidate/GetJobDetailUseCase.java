package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetJobDetailUseCase {

    private final JobPostRepository jobPostRepository;

    @Transactional
    public JobPost executeById(UUID jobPostId) {
        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));
        job.incrementView();
        return jobPostRepository.save(job);
    }

    @Transactional
    public JobPost executeBySlug(String slug) {
        JobPost job = jobPostRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", slug));
        job.incrementView();
        return jobPostRepository.save(job);
    }
}
