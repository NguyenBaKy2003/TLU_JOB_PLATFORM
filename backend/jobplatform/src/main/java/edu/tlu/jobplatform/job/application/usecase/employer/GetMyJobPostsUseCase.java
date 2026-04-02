package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * UseCase: Employer lấy danh sách tin tuyển dụng của mình.
 * Có thể lọc theo status.
 */
@Service
@RequiredArgsConstructor
public class GetMyJobPostsUseCase {

    private final JobPostRepository jobPostRepository;

    @Transactional(readOnly = true)
    public List<JobPost> execute(UUID companyId, JobStatus filterStatus) {
        List<JobPost> all = jobPostRepository.findByCompanyId(companyId);

        if (filterStatus != null)
            return all.stream().filter(j -> j.getStatus() == filterStatus).toList();

        return all;
    }
}