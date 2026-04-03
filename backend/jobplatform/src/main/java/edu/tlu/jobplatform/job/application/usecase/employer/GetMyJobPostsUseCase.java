package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// ── UpdateJobPostUseCase ──────────────────────────────────────────

@Slf4j
// ── GetMyJobPostsUseCase ──────────────────────────────────────────

@Service
@RequiredArgsConstructor
public class GetMyJobPostsUseCase {

    private final JobPostRepository jobPostRepository;

    @Transactional(readOnly = true)
    public Page<JobPost> execute(UUID postedBy, Pageable pageable) {
        return jobPostRepository.findByPostedBy(postedBy, pageable);
    }
}