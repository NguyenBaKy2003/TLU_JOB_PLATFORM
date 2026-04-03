package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// ── SearchJobsUseCase ─────────────────────────────────────────────

@Service
@RequiredArgsConstructor
class SearchJobsUseCase {

    private final JobSearchPort jobSearchPort;

    @Transactional(readOnly = true)
    public Page<JobPost> execute(SearchQuery query, Pageable pageable) {
        return jobSearchPort.search(
                query.keyword(), query.city(), query.category(),
                query.jobType(), query.level(), query.companyId(), pageable);
    }

    public record SearchQuery(
            String keyword,
            String city,
            String category,
            String jobType,
            String level,
            UUID companyId // nullable — filter theo công ty cụ thể
    ) {
    }
}
