package edu.tlu.jobplatform.ai.domain.model;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
public class CandidateTrendRequest {

    private final UUID candidateId;

    // ── Lịch sử hành vi ──────────────────────────────────────────────────────
    @Builder.Default
    private final List<String> recentKeywords = List.of(); // 20 từ khóa gần nhất

    @Builder.Default
    private final List<String> viewedJobTitles = List.of(); // 10 job title đã xem lâu nhất

    @Builder.Default
    private final List<String> appliedJobTitles = List.of(); // tất cả job đã apply

    @Builder.Default
    private final List<String> savedJobTitles = List.of(); // job đã lưu

    // ── Thông tin profile ─────────────────────────────────────────────────────
    @Builder.Default
    private final List<String> candidateSkills = List.of(); // skills từ profile

    private final String candidateLevel; // JUNIOR/MIDDLE/SENIOR
    private final String candidateLocation;

    // ── Dữ liệu job pool — được inject từ UseCase, không query trong adapter ──
    @Builder.Default
    private final List<JobPost> publishedJobs = List.of();

    @Builder.Default
    private final Map<UUID, String> companyNameMap = Map.of();
}