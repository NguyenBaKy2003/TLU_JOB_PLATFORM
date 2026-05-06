package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.AdminDashboardStats;
import edu.tlu.jobplatform.analytics.infrastructure.query.AnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * UseCase: Lấy tổng quan dashboard cho Admin.
 *
 * Delegate hoàn toàn xuống AnalyticsQueryService (cached).
 * Admin có thể force-refresh bằng cách truyền forceRefresh=true
 * → evict cache trước khi query.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GetAdminDashboardUseCase {

    private final AnalyticsQueryService queryService;

    public AdminDashboardStats execute() {
        log.debug("GetAdminDashboardUseCase executed");
        return queryService.buildAdminDashboard();
    }
}