package edu.tlu.jobplatform.analytics.domain.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonDeserialize(builder = TimeSeriesData.TimeSeriesDataBuilder.class)
public class TimeSeriesData {

    private final String label;
    private final Number value;
    private final String period;

    @JsonPOJOBuilder(withPrefix = "")
    public static class TimeSeriesDataBuilder {
    }

    public static List<TimeSeriesData> ofMonthly(List<Object[]> rows) {
        return rows.stream()
                .map(r -> TimeSeriesData.builder()
                        .label(String.valueOf(r[0]))
                        .value((Number) r[1])
                        .period("MONTH")
                        .build())
                .toList();
    }
}