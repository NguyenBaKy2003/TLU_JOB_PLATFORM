package edu.tlu.jobplatform.livestream.presentation.dto.response;

import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.model.vo.*;

import java.util.List;
import java.util.UUID;

//  SessionAnalyticsResponse (employer dashboard) ─
public record SessionAnalyticsResponse(
        UUID sessionId,
        int peakViewerCount,
        long totalWatchSeconds,
        long avgWatchSeconds,
        int applyClickCount,
        int cvViewCount,
        int pollResponseCount,
        int qaQuestionCount,
        List<HeatmapPoint> heatmap) {
    public static SessionAnalyticsResponse from(StreamAnalytics a, int totalViewers) {
        return new SessionAnalyticsResponse(
                a.getSessionId(),
                a.getPeakViewerCount(),
                a.getTotalWatchSeconds(),
                a.getAvgWatchSeconds(totalViewers),
                a.getApplyClickCount(),
                a.getCvViewCount(),
                a.getPollResponseCount(),
                a.getQaQuestionCount(),
                a.getDropOffHeatmap());
    }
}
