package edu.tlu.jobplatform.application.infrastructure.persistence.entity;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications", indexes = {
        @Index(name = "idx_app_candidate", columnList = "candidate_id"),
        @Index(name = "idx_app_job", columnList = "job_post_id"),
        @Index(name = "idx_app_company", columnList = "company_id"),
        @Index(name = "idx_app_status", columnList = "status"),
        @Index(name = "idx_app_unique", columnList = "job_post_id, candidate_id", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationJpaEntity extends BaseJpaEntity {

    @Column(name = "job_post_id", nullable = false)
    private UUID jobPostId;
    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;
    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "cv_url", nullable = false, length = 1000)
    private String cvUrl;
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;
    @Column(name = "expected_salary", length = 100)
    private String expectedSalary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // ── Interview ─
    @Column(name = "interview_scheduled_at")
    private LocalDateTime interviewScheduledAt;
    @Column(name = "interview_location", length = 500)
    private String interviewLocation;
    @Column(name = "interview_note", columnDefinition = "TEXT")
    private String interviewNote;

    // ── AI Score (embedded) ─
    @Column(name = "ai_score")
    private Integer aiScore;
    @Column(name = "ai_skill_match_score")
    private Integer aiSkillMatchScore;
    @Column(name = "ai_experience_score")
    private Integer aiExperienceScore;
    @Column(name = "ai_education_score")
    private Integer aiEducationScore;
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;
    @Column(name = "ai_model_version", length = 50)
    private String aiModelVersion;
    @Column(name = "ai_score_calculated")
    private boolean aiScoreCalculated;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;
}