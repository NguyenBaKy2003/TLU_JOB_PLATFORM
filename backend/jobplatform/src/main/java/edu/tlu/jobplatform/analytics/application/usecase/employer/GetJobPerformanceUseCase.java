package edu.tlu.jobplatform.analytics.application.usecase.employer;

import edu.tlu.jobplatform.analytics.domain.model.JobPerformanceStats;
import edu.tlu.jobplatform.analytics.infrastructure.query.EmployerAnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * UseCase: Lấy bảng hiệu suất từng job post của một công ty.
 * Gồm: views, application funnel, conversion rate, deadline còn lại.
 */
@Service
@RequiredArgsConstructor
public class GetJobPerformanceUseCase {

    private final EmployerAnalyticsQueryService queryService;

    public List<JobPerformanceStats> execute(Command cmd) {
        return queryService.getJobPerformance(cmd.companyId());
    }

    public record Command(UUID companyId) {
    }
}