/**
 * JPA Entity cho bảng candidate_subscription_plans.
 *
 * Migration SQL:
 * ────────────────
 * -- Nếu tạo mới:
 * CREATE TABLE candidate_subscription_plans (
 * id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 * code VARCHAR(30) NOT NULL UNIQUE,
 * name VARCHAR(100) NOT NULL,
 * description TEXT,
 * price_monthly NUMERIC(12,2),
 * price_yearly NUMERIC(12,2),
 * application_limit INT NOT NULL DEFAULT 5,
 * cv_boost_limit INT NOT NULL DEFAULT 0,
 * cv_create_limit INT NOT NULL DEFAULT 1,
 * ai_cv_writer BOOLEAN NOT NULL DEFAULT FALSE,
 * premium_template_access BOOLEAN NOT NULL DEFAULT FALSE,
 * duration_days INT,
 * is_active BOOLEAN NOT NULL DEFAULT TRUE,
 * is_free BOOLEAN NOT NULL DEFAULT FALSE,
 * created_at TIMESTAMP NOT NULL DEFAULT now(),
 * updated_at TIMESTAMP NOT NULL DEFAULT now()
 * );
 *
 * -- Seed data
 * INSERT INTO candidate_subscription_plans
 * (id, code, name, description,
 * price_monthly, price_yearly,
 * application_limit, cv_boost_limit, cv_create_limit,
 * ai_cv_writer, premium_template_access,
 * duration_days, is_active, is_free)
 * VALUES
 * (gen_random_uuid(), 'FREE_CANDIDATE', 'Gói Basic', 'Dùng thử miễn phí',
 * NULL, NULL, 5, 0, 1, FALSE, FALSE, NULL, TRUE, TRUE),
 * (gen_random_uuid(), 'PRO', 'Gói Pro', 'Dành cho ứng viên tích cực',
 * 99000, 899000, -1, 3, 5, FALSE, TRUE, 30, TRUE, FALSE),
 * (gen_random_uuid(), 'PREMIUM', 'Gói Premium', 'Đầy đủ tính năng AI',
 * 199000, 1799000, -1, -1, -1, TRUE, TRUE, 30, TRUE, FALSE);
 *
 * -- Nếu ALTER bảng đã có:
 * ALTER TABLE candidate_subscription_plans
 * DROP COLUMN IF EXISTS job_alert_limit,
 * DROP COLUMN IF EXISTS mock_interview_limit,
 * DROP COLUMN IF EXISTS salary_insights,
 * DROP COLUMN IF EXISTS profile_analytics,
 * DROP COLUMN IF EXISTS advanced_filters,
 * ADD COLUMN IF NOT EXISTS cv_create_limit INT NOT NULL DEFAULT 1,
 * ADD COLUMN IF NOT EXISTS premium_template_access BOOLEAN NOT NULL DEFAULT
 * FALSE;
 * ────────────────
 */