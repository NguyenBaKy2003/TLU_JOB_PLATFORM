package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

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

    // ── CV Create quota (không reset — giới hạn số CV đồng thời) ────
    @Column(name = "cv_create_quota_limit", nullable = false)
    private int cvCreateQuotaLimit;

    @Column(name = "cv_create_quota_used", nullable = false)
    private int cvCreateQuotaUsed;

    // ── Feature flags
    @Column(name = "ai_cv_writer", nullable = false)
    private boolean aiCvWriter;

    @Column(name = "premium_template_access", nullable = false)
    private boolean premiumTemplateAccess;

    // ── Metadata ─────
    @Column(name = "current_payment_id")
    private UUID currentPaymentId;

    @Column(name = "last_quota_reset_at")
    private LocalDateTime lastQuotaResetAt;
}