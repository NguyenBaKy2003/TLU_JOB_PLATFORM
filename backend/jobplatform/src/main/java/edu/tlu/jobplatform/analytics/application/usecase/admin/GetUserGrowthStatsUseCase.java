package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.TimeSeriesData;
import edu.tlu.jobplatform.analytics.infrastructure.query.AnalyticsQueryService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * UseCase: Lấy biểu đồ tăng trưởng người dùng theo tháng.
 */
@Service
@RequiredArgsConstructor
public class GetUserGrowthStatsUseCase {

    private static final int MAX_MONTHS = 24;
    private final AnalyticsQueryService queryService;

    public List<TimeSeriesData> execute(Command cmd) {
        if (cmd.months() < 1 || cmd.months() > MAX_MONTHS)
            throw new BusinessRuleException(
                    "Số tháng phải từ 1 đến " + MAX_MONTHS, "INVALID_MONTHS_RANGE");

        return queryService.getUserGrowthTimeSeries(cmd.months());
    }

    public record Command(int months) {
        public Command {
            if (months <= 0)
                months = 12; // default
        }
    }
}