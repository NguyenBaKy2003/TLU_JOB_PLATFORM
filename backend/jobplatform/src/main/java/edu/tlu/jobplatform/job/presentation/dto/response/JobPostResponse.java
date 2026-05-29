package edu.tlu.jobplatform.job.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.ai.domain.model.CompetitionRateResult;
import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import edu.tlu.jobplatform.job.application.usecase.candidate.SearchJobsUseCase;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostResponse {

        private final UUID id;
        private final UUID companyId;
        private final String companyName;
        private final String companyLogoUrl;
        private final String title;
        private final String slug;
        private final String jobType;
        private final String level;
        private final String category;
        private final String salaryDisplay;
        private final String workLocationType;
        private final String workLocationCity;
        private final Integer experienceYears;
        private final Integer vacancies;
        private final LocalDate deadline;
        private final JobStatus status;
        private final int viewCount;
        private final int applicationCount;
        private final boolean featured;
        private final LocalDateTime publishedAt;
        private final LocalDateTime createdAt;
        private final String rejectionReason;

        /** Summary cạnh tranh — đủ dùng cho list, không nặng như full breakdown */
        private final CompetitionSummaryDto competition;

        // ── Factory methods ──────────────────────────────────────────────────────

        /** Dùng cho search/list có company info + competition */
        public static JobPostResponse from(SearchJobsUseCase.Result result) {
                return from(result.job(), result.company(), result.competition());
        }

        /** Dùng cho findPublished listing (không có company, không có competition) */
        public static JobPostResponse from(JobPost j) {
                return from(j, null, null);
        }

        /** Dùng cho SavedJobs — có company snapshot, không có competition */
        public static JobPostResponse from(JobPost j, CompanySnapshot c) {
                return from(j, c, null);
        }

        /** Base builder — tất cả overload đổ về đây */
        public static JobPostResponse from(JobPost j, CompanySnapshot c, CompetitionRateResult comp) {
                return JobPostResponse.builder()
                                .id(j.getId())
                                .companyId(j.getCompanyId())
                                .companyName(c != null ? c.name() : null)
                                .companyLogoUrl(c != null ? c.logoUrl() : null)
                                .title(j.getTitle())
                                .slug(j.getSlug())
                                .jobType(j.getJobType())
                                .level(j.getLevel())
                                .category(j.getCategory())
                                .salaryDisplay(j.getSalary() != null ? j.getSalary().display() : null)
                                .workLocationType(j.getWorkLocation() != null
                                                ? j.getWorkLocation().getType().name()
                                                : null)
                                .workLocationCity(j.getWorkLocation() != null
                                                ? j.getWorkLocation().getCity()
                                                : null)
                                .experienceYears(j.getExperienceYears())
                                .vacancies(j.getVacancies())
                                .deadline(j.getDeadline())
                                .featured(j.isFeatured())
                                .status(j.getStatus())
                                .viewCount(j.getViewCount())
                                .applicationCount(j.getApplicationCount())
                                .publishedAt(j.getPublishedAt())
                                .createdAt(j.getCreatedAt())
                                .rejectionReason(j.getRejectionReason())
                                .competition(comp != null ? CompetitionSummaryDto.from(comp) : null)
                                .build();
        }

        // ── Inner DTOs ────────────────────────────────────────────────────────────

        /**
         * Chỉ chứa thông tin tóm tắt cạnh tranh dùng cho list view.
         * Detail view dùng full {@link CompetitionRateResult} trong
         * JobPostDetailResponse.
         */
        @Getter
        @Builder
        @JsonInclude(JsonInclude.Include.NON_NULL)
        public static class CompetitionSummaryDto {

                /** Điểm cạnh tranh tổng hợp 0–100 */
                private final int score;

                /** LOW / MEDIUM / HIGH / EXTREME */
                private final String level;

                /** Tổng số ứng viên đã apply */
                private final int totalApplicants;

                /** Tỷ lệ ứng viên / số lượng tuyển */
                private final double applicationToHiringRatio;

                /** Lời khuyên ngắn cho candidate */
                private final String candidateAdvice;

                public static CompetitionSummaryDto from(CompetitionRateResult r) {
                        return CompetitionSummaryDto.builder()
                                        .score(r.getCompetitionScore())
                                        .level(r.getLevel().name())
                                        .totalApplicants(r.getTotalApplicants())
                                        .applicationToHiringRatio(r.getApplicationToHiringRatio())
                                        .candidateAdvice(r.getCandidateAdvice())
                                        .build();
                }
        }
}