package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.ApplicationTrendData;

import java.util.List;

/**
 * Response DTO cho endpoint xu hướng ứng tuyển & lượt xem.
 */
public record ApplicationTrendResponse(List<DataPoint> data) {

    public record DataPoint(String label, long applications, long views) {
    }

    public static ApplicationTrendResponse from(List<ApplicationTrendData> list) {
        List<DataPoint> points = list.stream()
                .map(d -> new DataPoint(d.getLabel(), d.getApplications(), d.getViews()))
                .toList();
        return new ApplicationTrendResponse(points);
    }
}