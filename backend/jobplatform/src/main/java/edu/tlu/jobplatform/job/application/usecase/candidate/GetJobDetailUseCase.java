package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Xem chi tiết tin tuyển dụng.
 * Public — không cần auth. Tăng viewCount.
 */
@Service
@RequiredArgsConstructor
public class GetJobDetailUseCase {

    private final JobPostRepository jobPostRepository;

    @Transactional
    public JobPost execute(UUID jobPostId) {
        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        // Tăng view count — chấp nhận eventual consistency, không cần exact
        job.incrementViewCount();
        jobPostRepository.save(job);

        return job;
    }
}