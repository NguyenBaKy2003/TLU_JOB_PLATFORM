package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "candidate_subscription_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSubscriptionPlanJpaEntity extends BaseJpaEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_monthly", precision = 12, scale = 2)
    private BigDecimal priceMonthly;

    @Column(name = "price_yearly", precision = 12, scale = 2)
    private BigDecimal priceYearly;

    @Column(name = "application_limit", nullable = false)
    private int applicationLimit;

    @Column(name = "cv_boost_limit", nullable = false)
    private int cvBoostLimit;

    /** FREE_CANDIDATE=1, PRO=5, PREMIUM=-1 */
    @Column(name = "cv_create_limit", nullable = false)
    private int cvCreateLimit;

    @Column(name = "ai_cv_writer", nullable = false)
    private boolean aiCvWriter;

    /** PRO và PREMIUM = true */
    @Column(name = "premium_template_access", nullable = false)
    private boolean premiumTemplateAccess;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "is_free", nullable = false)
    private boolean free;
}