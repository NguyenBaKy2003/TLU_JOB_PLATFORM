package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.AdminDashboardStats;
import edu.tlu.jobplatform.analytics.infrastructure.query.AdminAnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetAdminDashboardUseCase {

    private final AdminAnalyticsQueryService queryService;

    public AdminDashboardStats execute() {
        return queryService.buildAdminDashboard();
    }
}