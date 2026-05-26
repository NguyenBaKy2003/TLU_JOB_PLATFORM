package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * GET /api/v1/companies/{id}/jobs
 * Lấy danh sách việc làm PUBLISHED của một công ty.
 */
@Service
@RequiredArgsConstructor
public class GetCompanyJobsUseCase {

    private final JobPostRepository jobPostRepository;

    public record Command(UUID companyId, int page, int size) {
    }

    public PageResponse<JobPost> execute(Command cmd) {
        var pageable = PageRequest.of(
                cmd.page(),
                cmd.size(),
                Sort.by("createdAt").descending());

        var result = jobPostRepository.findByCompanyIdAndStatus(
                cmd.companyId(), JobStatus.PUBLISHED, pageable);

        return PageResponse.from(result);
    }
}