package edu.tlu.jobplatform.analytics.presentation.dto.response;

import edu.tlu.jobplatform.analytics.domain.model.JobPerformanceStats;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class JobPerformanceResponse {

    private final List<JobItem> jobs;
    private final int total;

    public static JobPerformanceResponse from(List<JobPerformanceStats> stats) {
        List<JobItem> items = stats.stream()
                .map(s -> JobItem.builder()
                        .jobPostId(s.getJobPostId())
                        .title(s.getTitle())
                        .status(s.getStatus())
                        .viewCount(s.getViewCount())
                        .totalApplications(s.getTotalApplications())
                        .screening(s.getScreening())
                        .interviewing(s.getInterviewing())
                        .offered(s.getOffered())
                        .hired(s.getHired())
                        .conversionRate(Math.round(s.getConversionRate() * 10.0) / 10.0)
                        .deadline(s.getDeadline())
                        .build())
                .toList();

        return JobPerformanceResponse.builder()
                .jobs(items)
                .total(items.size())
                .build();
    }

    @Getter
    @Builder
    public static class JobItem {
        private final UUID jobPostId;
        private final String title;
        private final String status;
        private final int viewCount;
        private final long totalApplications;
        private final long screening;
        private final long interviewing;
        private final long offered;
        private final long hired;
        private final double conversionRate;
        private final String deadline;
    }
}