package edu.tlu.jobplatform.application.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationDetailResponse {

    private final UUID id;
    private final UUID jobPostId;
    private final UUID candidateId;
    private final UUID companyId;
    private final String cvUrl;
    private final String coverLetter;
    private final String expectedSalary;
    private final ApplicationStatus status;
    private final String rejectionReason;

    // ── Candidate info (populated từ UserRepository) ──────────
    private final CandidateInfo candidate;

    // ── Interview ─────────────────────────────────────────────
    private final LocalDateTime interviewScheduledAt;
    private final String interviewLocation;
    private final String interviewNote;

    // ── AI Score ──────────────────────────────────────────────
    private final boolean aiScoreCalculated;
    private final AIScoreDto aiScore;

    // ── Metadata ──────────────────────────────────────────────
    private final LocalDateTime appliedAt;
    private final LocalDateTime updatedAt;
    private final List<StatusLogDto> statusHistory;

    // ─────────────────────────────────────────────────────────
    // Factory methods
    // ─────────────────────────────────────────────────────────

    /** Không có candidate info (dùng khi candidate tự xem đơn của mình) */
    public static ApplicationDetailResponse from(Application a) {
        return from(a, List.of(), null);
    }

    /** Có status logs (dùng khi candidate xem lịch sử) */
    public static ApplicationDetailResponse from(Application a,
            List<ApplicationStatusLog> logs) {
        return from(a, logs, null);
    }

    /** Đầy đủ: có logs + candidate info (dùng cho employer / admin) */
    public static ApplicationDetailResponse from(Application a,
            List<ApplicationStatusLog> logs,
            CandidateInfo candidateInfo) {
        AIScoreDto scoreDto = null;
        if (a.getAiScore() != null) {
            var s = a.getAiScore();
            scoreDto = AIScoreDto.builder()
                    .score(s.getScore()).label(s.getLabel())
                    .skillMatchScore(s.getSkillMatchScore())
                    .experienceScore(s.getExperienceScore())
                    .educationScore(s.getEducationScore())
                    .strengths(s.getStrengths()).gaps(s.getGaps())
                    .summary(s.getSummary()).build();
        }

        List<StatusLogDto> history = logs.stream()
                .map(l -> StatusLogDto.builder()
                        .fromStatus(l.getFromStatus()).toStatus(l.getToStatus())
                        .note(l.getNote()).changedAt(l.getChangedAt()).build())
                .toList();

        return ApplicationDetailResponse.builder()
                .id(a.getId()).jobPostId(a.getJobPostId())
                .candidateId(a.getCandidateId()).companyId(a.getCompanyId())
                .cvUrl(a.getCvUrl()).coverLetter(a.getCoverLetter())
                .expectedSalary(a.getExpectedSalary()).status(a.getStatus())
                .rejectionReason(a.getRejectionReason())
                .candidate(candidateInfo)
                .interviewScheduledAt(a.getInterviewScheduledAt())
                .interviewLocation(a.getInterviewLocation())
                .interviewNote(a.getInterviewNote())
                .aiScoreCalculated(a.isAiScoreCalculated()).aiScore(scoreDto)
                .appliedAt(a.getAppliedAt()).updatedAt(a.getUpdatedAt())
                .statusHistory(history).build();
    }

    // ─────────────────────────────────────────────────────────
    // Nested DTOs
    // ─────────────────────────────────────────────────────────

    /** Thông tin ứng viên — resolve từ UserRepository */
    @Getter
    @Builder
    public static class CandidateInfo {
        private final UUID id;
        private final String fullName;
        private final String email;
        private final String phone;
        private final String avatarUrl;

        public static CandidateInfo of(UUID id, String fullName,
                String email, String phone,
                String avatarUrl) {
            return CandidateInfo.builder()
                    .id(id).fullName(fullName).email(email)
                    .phone(phone).avatarUrl(avatarUrl).build();
        }
    }

    @Getter
    @Builder
    public static class StatusLogDto {
        private final ApplicationStatus fromStatus;
        private final ApplicationStatus toStatus;
        private final String note;
        private final LocalDateTime changedAt;
    }

    @Getter
    @Builder
    public static class AIScoreDto {
        private final int score;
        private final String label;
        private final int skillMatchScore;
        private final int experienceScore;
        private final int educationScore;
        private final List<String> strengths;
        private final List<String> gaps;
        private final String summary;
    }
}