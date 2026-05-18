package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CandidateTrendRequest {
    private final UUID candidateId;
    private final List<String> recentKeywords; // 20 từ khóa gần nhất
    private final List<String> viewedJobTitles; // 10 job title đã xem lâu nhất
    private final List<String> appliedJobTitles; // tất cả job đã apply
    private final List<String> savedJobTitles; // job đã lưu
    private final List<String> candidateSkills; // skills từ profile
    private final String candidateLevel; // JUNIOR/MIDDLE/SENIOR
    private final String candidateLocation;
}