package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * JPA Entity cho bảng candidate_subscription_plans.
 *
 * Migration SQL:
 * ─────────────────────────────────────────────────────────────────
 * CREATE TABLE candidate_subscription_plans (
 * id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 * code VARCHAR(30) NOT NULL UNIQUE,
 * name VARCHAR(100) NOT NULL,
 * description TEXT,
 * price_monthly NUMERIC(12,2),
 * price_yearly NUMERIC(12,2),
 * application_limit INT NOT NULL DEFAULT 5,
 * cv_boost_limit INT NOT NULL DEFAULT 0,
 * job_alert_limit INT NOT NULL DEFAULT 3,
 * mock_interview_limit INT NOT NULL DEFAULT 0,
 * ai_cv_writer BOOLEAN NOT NULL DEFAULT FALSE,
 * salary_insights BOOLEAN NOT NULL DEFAULT FALSE,
 * profile_analytics BOOLEAN NOT NULL DEFAULT FALSE,
 * advanced_filters BOOLEAN NOT NULL DEFAULT FALSE,
 * duration_days INT,
 * is_active BOOLEAN NOT NULL DEFAULT TRUE,
 * is_free BOOLEAN NOT NULL DEFAULT FALSE,
 * created_at TIMESTAMP NOT NULL DEFAULT now(),
 * updated_at TIMESTAMP NOT NULL DEFAULT now()
 * );
 *
 * -- Seed data
 * INSERT INTO candidate_subscription_plans VALUES
 * (gen_random_uuid(), 'BASIC', 'Gói Basic', 'Dùng thử miễn phí',
 * NULL, NULL, 5, 0, 3, 0, FALSE, FALSE, FALSE, FALSE, NULL, TRUE, TRUE),
 * (gen_random_uuid(), 'PRO', 'Gói Pro', 'Dành cho ứng viên tích cực',
 * 99000, 899000, -1, 3, 10, 0, FALSE, FALSE, TRUE, TRUE, 30, TRUE, FALSE),
 * (gen_random_uuid(), 'PREMIUM', 'Gói Premium', 'Đầy đủ tính năng AI',
 * 199000, 1799000, -1, -1, -1, 5, TRUE, TRUE, TRUE, TRUE, 30, TRUE, FALSE);
 * ─────────────────────────────────────────────────────────────────
 */
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

    @Column(name = "job_alert_limit", nullable = false)
    private int jobAlertLimit;

    @Column(name = "mock_interview_limit", nullable = false)
    private int mockInterviewLimit;

    @Column(name = "ai_cv_writer", nullable = false)
    private boolean aiCvWriter;

    @Column(name = "salary_insights", nullable = false)
    private boolean salaryInsights;

    @Column(name = "profile_analytics", nullable = false)
    private boolean profileAnalytics;

    @Column(name = "advanced_filters", nullable = false)
    private boolean advancedFilters;

    /** null nếu là gói FREE (không có thời hạn) */
    @Column(name = "duration_days")
    private Integer durationDays;

    /** true = gói miễn phí (BASIC) — dùng để tự động gán khi candidate đăng ký */
    @Column(name = "is_free", nullable = false)
    private boolean free;
}