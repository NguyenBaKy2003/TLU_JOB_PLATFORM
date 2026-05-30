package edu.tlu.jobplatform.analytics.application.usecase.employer;

import edu.tlu.jobplatform.analytics.domain.model.ApplicationTrendData;
import edu.tlu.jobplatform.analytics.infrastructure.query.EmployerAnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * UseCase: Lấy xu hướng đơn ứng tuyển và lượt xem theo tháng của một công ty.
 * Dùng cho biểu đồ area chart "Xu hướng ứng tuyển & lượt xem" trên Employer
 * Dashboard.
 */
@Service
@RequiredArgsConstructor
public class GetApplicationTrendUseCase {

    private final EmployerAnalyticsQueryService queryService;

    public List<ApplicationTrendData> execute(Command cmd) {
        return queryService.getApplicationTrend(cmd.companyId(), cmd.months());
    }

    public record Command(UUID companyId, int months) {
    }
}