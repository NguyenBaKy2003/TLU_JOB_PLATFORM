package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

/**
 * Value object: số đơn ứng tuyển và lượt xem job post theo một tháng.
 * Dùng cho biểu đồ xu hướng trên Employer Dashboard.
 */
@Getter
@Builder
@JsonDeserialize(builder = ApplicationTrendData.ApplicationTrendDataBuilder.class)
public class ApplicationTrendData {

    /** Nhãn tháng định dạng "YYYY-MM", ví dụ "2025-06" */
    private final String label;

    /** Số đơn ứng tuyển trong tháng */
    private final long applications;

    /** Tổng lượt xem job post trong tháng */
    private final long views;

    @JsonPOJOBuilder(withPrefix = "")
    public static class ApplicationTrendDataBuilder {
    }
}