package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.TimeSeriesData;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TimeSeriesResponse {

    private final String period;
    private final List<DataPoint> data;

    public static TimeSeriesResponse from(List<TimeSeriesData> series) {
        String period = series.isEmpty() ? "MONTH" : series.get(0).getPeriod();
        List<DataPoint> points = series.stream()
                .map(d -> new DataPoint(d.getLabel(), d.getValue()))
                .toList();
        return TimeSeriesResponse.builder()
                .period(period)
                .data(points)
                .build();
    }

    public record DataPoint(String label, Number value) {
    }
}