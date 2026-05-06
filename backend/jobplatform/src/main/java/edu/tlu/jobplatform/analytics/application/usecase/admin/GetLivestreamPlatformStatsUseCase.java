package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.TimeSeriesData;
import edu.tlu.jobplatform.analytics.infrastructure.query.AnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * UseCase: Lấy thống kê livestream toàn platform cho Admin.
 */
@Service
@RequiredArgsConstructor
public class GetLivestreamPlatformStatsUseCase {

    private final AnalyticsQueryService queryService;

    public List<TimeSeriesData> execute(Command cmd) {
        return queryService.getStreamSessionsTimeSeries(cmd.months());
    }

    public record Command(int months) {
        public Command {
            if (months <= 0)
                months = 6;
        }
    }
}