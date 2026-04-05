package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

// ── SubscriptionPlanJpaEntity ─────────────────────────────────────

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanJpaEntity extends BaseJpaEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String code;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_monthly", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceMonthly;

    @Column(name = "price_yearly", precision = 12, scale = 2)
    private BigDecimal priceYearly;

    @Column(name = "job_post_limit", nullable = false)
    private int jobPostLimit;
    @Column(name = "featured_job_limit", nullable = false)
    private int featuredJobLimit;
    @Column(name = "cv_view_limit", nullable = false)
    private int cvViewLimit;
    @Column(name = "ai_features", nullable = false)
    private boolean aiFeatures;
    @Column(name = "analytics_access", nullable = false)
    private boolean analyticsAccess;
    @Column(name = "duration_days", nullable = false)
    private int durationDays;
}