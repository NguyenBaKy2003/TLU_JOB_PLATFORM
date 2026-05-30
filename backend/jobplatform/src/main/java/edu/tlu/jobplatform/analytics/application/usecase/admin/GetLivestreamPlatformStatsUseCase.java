package edu.tlu.jobplatform.analytics.application.usecase.admin;

import edu.tlu.jobplatform.analytics.domain.model.TimeSeriesData;
import edu.tlu.jobplatform.analytics.infrastructure.query.AdminAnalyticsQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetLivestreamPlatformStatsUseCase {

    private final AdminAnalyticsQueryService queryService;

    public List<TimeSeriesData> execute(Command cmd) {
        return queryService.getStreamSessionsTimeSeries(cmd.months());
    }

    public record Command(int months) {
    }
}