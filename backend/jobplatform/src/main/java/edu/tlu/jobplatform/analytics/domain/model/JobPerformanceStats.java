package edu.tlu.jobplatform.analytics.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Value object: hiệu suất của một job post (dùng trong Employer Dashboard).
 */
@Getter
@Builder
public class JobPerformanceStats {

    private final UUID jobPostId;
    private final String title;
    private final String status;
    private final int viewCount;
    private final long totalApplications;
    private final long screening;
    private final long interviewing;
    private final long offered;
    private final long hired;
    private final double conversionRate; // hired / totalApplications * 100
    private final String deadline;
}