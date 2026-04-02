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

    @Column(name = "plan_code", nullable = false, length = 30)
    private String planCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // ── Quota fields (flattened từ Value Objects) ─────────────
    @Column(name = "job_post_limit", nullable = false)
    private int jobPostLimit;

    @Column(name = "job_post_used", nullable = false)
    private int jobPostUsed;

    @Column(name = "featured_job_limit", nullable = false)
    private int featuredJobLimit;

    @Column(name = "featured_job_used", nullable = false)
    private int featuredJobUsed;

    @Column(name = "cv_view_limit", nullable = false)
    private int cvViewLimit;

    @Column(name = "cv_view_used", nullable = false)
    private int cvViewUsed;

    @Column(name = "ai_features", nullable = false)
    private boolean aiFeatures;

    @Column(name = "analytics_access", nullable = false)
    private boolean analyticsAccess;

    @Column(name = "current_payment_id")
    private UUID currentPaymentId;
}