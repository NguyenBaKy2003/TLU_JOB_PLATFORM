package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA Entity cho bảng candidate_subscriptions.
 *
 * Migration SQL:
 * ─────────────────────────────────────────────────────────────────
 * CREATE TABLE candidate_subscriptions (
 * id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 * candidate_id UUID NOT NULL,
 * plan_id UUID NOT NULL,
 * plan_code VARCHAR(30),
 * yearly BOOLEAN NOT NULL DEFAULT FALSE,
 * started_at TIMESTAMP,
 * expires_at TIMESTAMP,
 * status VARCHAR(20) NOT NULL,
 * -- application quota (reset hàng tháng)
 * application_quota_limit INT NOT NULL DEFAULT 5,
 * application_quota_used INT NOT NULL DEFAULT 0,
 * -- cv boost quota (reset hàng tháng)
 * cv_boost_quota_limit INT NOT NULL DEFAULT 0,
 * cv_boost_quota_used INT NOT NULL DEFAULT 0,
 * -- job alert quota (số alert đang active)
 * job_alert_quota_limit INT NOT NULL DEFAULT 3,
 * job_alert_quota_used INT NOT NULL DEFAULT 0,
 * -- mock interview quota (one-time per period)
 * mock_interview_quota_limit INT NOT NULL DEFAULT 0,
 * mock_interview_quota_used INT NOT NULL DEFAULT 0,
 * -- feature flags
 * ai_cv_writer BOOLEAN NOT NULL DEFAULT FALSE,
 * salary_insights BOOLEAN NOT NULL DEFAULT FALSE,
 * profile_analytics BOOLEAN NOT NULL DEFAULT FALSE,
 * advanced_filters BOOLEAN NOT NULL DEFAULT FALSE,
 * -- metadata
 * current_payment_id UUID,
 * last_quota_reset_at TIMESTAMP,
 * created_at TIMESTAMP NOT NULL DEFAULT now(),
 * updated_at TIMESTAMP NOT NULL DEFAULT now()
 * );
 *
 * CREATE INDEX idx_candidate_sub_candidate ON
 * candidate_subscriptions(candidate_id);
 * CREATE INDEX idx_candidate_sub_status ON candidate_subscriptions(status);
 * CREATE INDEX idx_candidate_sub_expires ON
 * candidate_subscriptions(expires_at);
 * CREATE INDEX idx_candidate_sub_reset ON
 * candidate_subscriptions(last_quota_reset_at)
 * WHERE status = 'ACTIVE';
 * ─────────────────────────────────────────────────────────────────
 */
@Entity
@Table(name = "candidate_subscriptions", indexes = {
        @Index(name = "idx_candidate_sub_candidate", columnList = "candidate_id"),
        @Index(name = "idx_candidate_sub_status", columnList = "status"),
        @Index(name = "idx_candidate_sub_expires", columnList = "expires_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSubscriptionJpaEntity extends BaseJpaEntity {

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "plan_code", length = 30)
    private String planCode;

    @Column(name = "yearly", nullable = false)
    private boolean yearly;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CandidateSubscriptionStatus status;

    // ── Application quota (reset hàng tháng) ─────────────────────────
    @Column(name = "application_quota_limit", nullable = false)
    private int applicationQuotaLimit;

    @Column(name = "application_quota_used", nullable = false)
    private int applicationQuotaUsed;

    // ── CV Boost quota (reset hàng tháng) ────────────────────────────
    @Column(name = "cv_boost_quota_limit", nullable = false)
    private int cvBoostQuotaLimit;

    @Column(name = "cv_boost_quota_used", nullable = false)
    private int cvBoostQuotaUsed;

    // ── Job alert quota (số alert đang active) ───────────────────────
    @Column(name = "job_alert_quota_limit", nullable = false)
    private int jobAlertQuotaLimit;

    @Column(name = "job_alert_quota_used", nullable = false)
    private int jobAlertQuotaUsed;

    // ── Mock interview quota (one-time per period) ───────────────────
    @Column(name = "mock_interview_quota_limit", nullable = false)
    private int mockInterviewQuotaLimit;

    @Column(name = "mock_interview_quota_used", nullable = false)
    private int mockInterviewQuotaUsed;

    // ── Feature flags ─────────────────────────────────────────────────
    @Column(name = "ai_cv_writer", nullable = false)
    private boolean aiCvWriter;

    @Column(name = "salary_insights", nullable = false)
    private boolean salaryInsights;

    @Column(name = "profile_analytics", nullable = false)
    private boolean profileAnalytics;

    @Column(name = "advanced_filters", nullable = false)
    private boolean advancedFilters;

    // ── Metadata ──────────────────────────────────────────────────────
    @Column(name = "current_payment_id")
    private UUID currentPaymentId;

    /**
     * Thời điểm reset quota tháng gần nhất — scheduler dùng để xác định cần reset
     * chưa
     */
    @Column(name = "last_quota_reset_at")
    private LocalDateTime lastQuotaResetAt;
}