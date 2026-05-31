package edu.tlu.jobplatform.livestream.presentation.dto.response;

import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;

import java.util.UUID;

public record StreamAnalyticsResponse(
        UUID   sessionId,
        int    peakViewerCount,
        int    totalViewerCount,
        long   totalWatchSeconds,
        int    applyClickCount,
        int    cvViewCount,
        int    pollResponseCount,
        int    qaQuestionCount
) {
    public static StreamAnalyticsResponse from(StreamAnalytics a) {
        return new StreamAnalyticsResponse(
            a.getSessionId(),
            a.getPeakViewerCount(),
            a.getTotalViewerCount(),
            a.getTotalWatchSeconds(),
            a.getApplyClickCount(),
            a.getCvViewCount(),
            a.getPollResponseCount(),
            a.getQaQuestionCount()
        );
    }
}