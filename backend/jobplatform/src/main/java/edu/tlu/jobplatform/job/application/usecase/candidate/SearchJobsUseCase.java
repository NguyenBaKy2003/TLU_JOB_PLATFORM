package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import edu.tlu.jobplatform.job.application.port.out.CompanyQueryPort;
import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchJobsUseCase {

    private final JobSearchPort jobSearchPort;
    private final CompanyQueryPort companyQueryPort;

    @Transactional(readOnly = true)
    public Page<Result> execute(SearchQuery query, Pageable pageable) {
        Page<JobPost> jobs = jobSearchPort.search(
                query.keyword(), query.city(), query.category(),
                query.jobType(), query.level(), query.companyId(), pageable);

        Set<UUID> companyIds = jobs.stream()
                .map(JobPost::getCompanyId)
                .collect(Collectors.toSet());

        Map<UUID, CompanySnapshot> companyMap = companyQueryPort.findByIds(companyIds);

        return jobs.map(job -> new Result(job, companyMap.get(job.getCompanyId())));
    }

    public record SearchQuery(
            String keyword,
            String city,
            String category,
            String jobType,
            String level,
            UUID companyId) {
    }

    public record Result(JobPost job, CompanySnapshot company) {
    }
}