package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_subscriptions", indexes = {
        @Index(name = "idx_sub_company", columnList = "company_id"),
        @Index(name = "idx_sub_status", columnList = "status"),
        @Index(name = "idx_sub_expires", columnList = "expires_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySubscriptionJpaEntity extends BaseJpaEntity {

    @Column(name = "company_id", nullable = false)
    private UUID companyId;
    @Column(name = "plan_id", nullable = false)
    private UUID planId;
    @Column(name = "plan_code", length = 30)
    private String planCode;

    @Column(name = "yearly", nullable = false)
    private boolean yearly; // ✅ thêm mới — cần migration: ALTER TABLE ADD COLUMN yearly BOOLEAN NOT NULL
                            // DEFAULT FALSE

    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    // ── Quota (3 loại, embedded) ──────────────────────────────
    @Column(name = "job_post_quota_limit", nullable = false)
    private int jobPostQuotaLimit;
    @Column(name = "job_post_quota_used", nullable = false)
    private int jobPostQuotaUsed;

    @Column(name = "featured_job_quota_limit", nullable = false)
    private int featuredJobQuotaLimit;
    @Column(name = "featured_job_quota_used", nullable = false)
    private int featuredJobQuotaUsed;

    @Column(name = "cv_view_quota_limit", nullable = false)
    private int cvViewQuotaLimit;
    @Column(name = "cv_view_quota_used", nullable = false)
    private int cvViewQuotaUsed;

    @Column(name = "ai_features", nullable = false)
    private boolean aiFeatures;
    @Column(name = "analytics_access", nullable = false)
    private boolean analyticsAccess;

    @Column(name = "current_payment_id")
    private UUID currentPaymentId;
}