-- ════════════════════════════════════════════════════════════════
--  V1__create_shared_tables.sql
--  Sprint 1 — Shared Layer
--
--  Tạo các bảng dùng chung toàn hệ thống:
--    - audit_logs : lịch sử mọi hành động
--
--  Quy tắc đặt tên:
--    - Bảng: snake_case, số nhiều
--    - Cột:  snake_case
--    - Index: idx_{table}_{column(s)}
--    - FK:    fk_{table}_{ref_table}
-- ════════════════════════════════════════════════════════════════

-- Extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- trigram search cho FTS

-- ── audit_logs ───────────────────────────────────────────────────
-- Lưu lịch sử hành động của user và system
-- Partition theo tháng để query nhanh (partition được thêm sau)
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL       NOT NULL,
    actor_id        VARCHAR(36),                        -- UUID của user hoặc null (system)
    action          VARCHAR(100)    NOT NULL,           -- VD: JOB_PUBLISHED, USER_BANNED
    resource_type   VARCHAR(50),                        -- VD: JobPost, User
    resource_id     VARCHAR(36),                        -- UUID của entity bị tác động
    old_value       TEXT,                               -- JSON trước khi thay đổi
    new_value       TEXT,                               -- JSON sau khi thay đổi
    ip_address      VARCHAR(45),                        -- IPv4/IPv6
    user_agent      VARCHAR(500),
    trace_id        VARCHAR(36),                        -- Liên kết với request log
    occurred_at     TIMESTAMP       NOT NULL DEFAULT NOW(),
    result          VARCHAR(20)     NOT NULL DEFAULT 'SUCCESS',  -- SUCCESS | FAILURE
    error_message   VARCHAR(500),
    PRIMARY KEY (id, occurred_at)                       -- occurred_at cần cho partition
) PARTITION BY RANGE (occurred_at);

-- Tạo partition cho năm 2026 (thêm partition mới hàng năm/hàng tháng)
CREATE TABLE IF NOT EXISTS audit_logs_2026_q1
    PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS audit_logs_2026_q2
    PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS audit_logs_2026_q3
    PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS audit_logs_2026_q4
    PARTITION OF audit_logs
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

-- Default partition cho các tháng chưa được tạo
CREATE TABLE IF NOT EXISTS audit_logs_default
    PARTITION OF audit_logs DEFAULT;

-- Index để query theo actor (ai đã làm gì?)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
    ON audit_logs (actor_id, occurred_at DESC);

-- Index để query theo resource (chuyện gì xảy ra với entity này?)
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
    ON audit_logs (resource_type, resource_id, occurred_at DESC);

-- Index để query theo action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON audit_logs (action, occurred_at DESC);

-- Index để trace theo traceId
CREATE INDEX IF NOT EXISTS idx_audit_logs_trace
    ON audit_logs (trace_id);

COMMENT ON TABLE audit_logs IS 'Lịch sử tất cả hành động trong hệ thống. Partition theo quý.';
COMMENT ON COLUMN audit_logs.actor_id IS 'UUID của user thực hiện. NULL = system action.';
COMMENT ON COLUMN audit_logs.action IS 'Tên hành động: USER_LOGIN, JOB_PUBLISHED, APPLICATION_SUBMITTED...';
COMMENT ON COLUMN audit_logs.result IS 'Kết quả: SUCCESS hoặc FAILURE';
