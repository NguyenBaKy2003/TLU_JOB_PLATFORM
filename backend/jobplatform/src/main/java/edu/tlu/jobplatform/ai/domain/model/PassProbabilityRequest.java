package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.UUID;

@Getter
@Builder
public class PassProbabilityRequest {
    private final UUID candidateId;
    private final UUID jobPostId;
    private final String cvText;
    private final String jobTitle;
    private final String jobDescription;
    private final String jobRequirements;
    private final String jobLevel;
    private final int currentApplicantCount;
    private final int hiringQuota;
    // Lịch sử của candidate (tính từ DB trước khi gọi port)
    private final int historicalApplyCount; // tổng số job đã apply
    private final int historicalPassCount; // số lần được phỏng vấn
    private final int profileCompleteness; // 0-100, tính từ CV/profile
}