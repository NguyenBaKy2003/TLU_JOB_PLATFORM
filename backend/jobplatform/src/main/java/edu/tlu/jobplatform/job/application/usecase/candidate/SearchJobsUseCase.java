package edu.tlu.jobplatform.job.application.usecase.candidate;

import edu.tlu.jobplatform.ai.application.usecase.CalculateCompetitionRateUseCase;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;
import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import edu.tlu.jobplatform.job.application.port.out.CompanyQueryPort;
import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchJobsUseCase {

        private final JobSearchPort jobSearchPort;
        private final CompanyQueryPort companyQueryPort;
        private final CalculateCompetitionRateUseCase competitionUseCase;

        @Transactional(readOnly = true)
        public Page<Result> execute(SearchQuery query, Pageable pageable) {
                Page<JobPost> jobs = jobSearchPort.search(
                                query.keyword(),
                                query.city(),
                                query.category(),
                                query.companyId(),
                                query.workLocType(),
                                query.currency(),
                                query.minSalary(),
                                query.maxSalary(),
                                query.postedAfter(),
                                query.jobTypes(),
                                query.levels(),
                                pageable);

                // Batch load — không gọi DB trong loop
                Set<UUID> companyIds = jobs.stream()
                                .map(JobPost::getCompanyId)
                                .collect(Collectors.toSet());
                Set<JobPost> jobSet = jobs.stream().collect(Collectors.toSet());

                Map<UUID, CompanySnapshot> companyMap = companyQueryPort.findByIds(companyIds);
                // 2 queries thay vì N × 3
                Map<UUID, CompetitionRateResult> competitionMap = competitionUseCase.executeAll(jobSet);

                return jobs.map(job -> new Result(
                                job,
                                companyMap.get(job.getCompanyId()),
                                competitionMap.get(job.getId())));
        }

        public record SearchQuery(
                        String keyword,
                        String city,
                        String category,
                        UUID companyId,
                        String workLocType,
                        String currency,
                        BigDecimal minSalary,
                        BigDecimal maxSalary,
                        LocalDateTime postedAfter,
                        List<String> jobTypes,
                        List<String> levels) {
        }

        public record Result(JobPost job, CompanySnapshot company, CompetitionRateResult competition) {
        }
}