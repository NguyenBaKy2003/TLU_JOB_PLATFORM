package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

// ── UpdateJobPostUseCase 
@Slf4j
@Service
@RequiredArgsConstructor
public class GetMyJobPostsUseCase {

    private final JobPostRepository jobPostRepository;

    public record Query(
            UUID postedBy,
            String keyword,
            JobStatus status,
            LocalDateTime createdAtFrom,
            LocalDateTime createdAtTo) {
    }

    @Transactional(readOnly = true)
    public Page<JobPost> execute(Query query, Pageable pageable) {
        return jobPostRepository.searchMyJobs(
                query.postedBy(),
                query.status(),
                query.keyword(),
                query.createdAtFrom(),
                query.createdAtTo(),
                pageable);
    }

}