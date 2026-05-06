package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Value object cho dữ liệu time-series (chart theo tháng/tuần).
 */
@Getter
@Builder
public class TimeSeriesData {

    private final String label; // VD: "2026-01", "T1/2026"
    private final Number value;
    private final String period; // MONTH | WEEK | DAY

    /** Tạo danh sách time-series từ raw data */
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