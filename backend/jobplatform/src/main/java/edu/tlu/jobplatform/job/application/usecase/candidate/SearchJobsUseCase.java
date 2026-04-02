package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.application.port.out.JobSearchPort.SearchCriteria;
import edu.tlu.jobplatform.job.application.port.out.JobSearchPort.SearchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * UseCase: Tìm kiếm tin tuyển dụng.
 * Public — không cần auth.
 */
@Service
@RequiredArgsConstructor
public class SearchJobsUseCase {

    private final JobSearchPort jobSearchPort;

    @Transactional(readOnly = true)
    public SearchResult execute(SearchCriteria criteria) {
        return jobSearchPort.search(criteria);
    }
}