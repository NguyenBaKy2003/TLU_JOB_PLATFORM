package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.TopCompanyStats;
import edu.tlu.jobplatform.analytics.infrastructure.query.AdminAnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetTopCompaniesUseCase {

    private final AdminAnalyticsQueryService queryService;

    public List<TopCompanyStats> execute(Command cmd) {
        return queryService.getTopCompanies(cmd.limit());
    }

    public record Command(int limit) {
    }
}