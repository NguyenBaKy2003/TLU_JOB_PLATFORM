package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CompetitionRateRequest {
    private final UUID jobPostId;
    private final int totalApplicants;
    private final int hiringQuota; // số vị trí cần tuyển
    private final double averageAIScore; // điểm AI trung bình của pool
    private final int totalViews;
    private final int totalSaves;
    private final long daysUntilDeadline;
    private final String jobLevel; // JUNIOR, MIDDLE, SENIOR
    private final String category; // ngành nghề
}
