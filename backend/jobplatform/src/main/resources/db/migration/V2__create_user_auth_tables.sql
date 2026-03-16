-- ════════════════════════════════════════════════════════════════
--  V2__create_user_auth_tables.sql
--  Sprint 1 — User & Auth Domain
-- ════════════════════════════════════════════════════════════════
-- ── users ────────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL,
    auth_provider VARCHAR(50),
    auth_provider_id VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_provider ON users(auth_provider);
WHERE is_active = true;
COMMENT ON TABLE users IS 'Tài khoản người dùng hệ thống';
COMMENT ON COLUMN users.role IS 'CANDIDATE | EMPLOYER | ADMIN | SUPER_ADMIN';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash. NULL nếu đăng nhập chỉ qua OAuth2';
COMMENT ON COLUMN users.is_verified IS 'true sau khi xác thực email bằng OTP';
-- ── oauth2_accounts ──────────────────────────────────────────────
-- Liên kết tài khoản với OAuth2 provider (Google, FaceBook...)
CREATE TABLE IF NOT EXISTS oauth2_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    -- GOOGLE | FaceBook
    provider_id VARCHAR(255) NOT NULL,
    -- ID từ provider
    provider_email VARCHAR(255),
    access_token TEXT,
    -- Lưu tạm, không quan trọng
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_id) -- 1 provider account = 1 user
);
CREATE INDEX IF NOT EXISTS idx_oauth2_user ON oauth2_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_oauth2_provider ON oauth2_accounts (provider, provider_id);
-- ── email_verifications ──────────────────────────────────────────
-- OTP xác thực email khi đăng ký
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp VARCHAR(6) NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'REGISTER',
    -- REGISTER | CHANGE_EMAIL
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    -- NULL = chưa dùng
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_verif_user ON email_verifications (user_id, purpose);
-- ── password_reset_tokens ────────────────────────────────────────
-- Token reset password (gửi qua email)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    -- Hash của token, không lưu raw
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_user ON password_reset_tokens (user_id);
-- ── login_attempts ───────────────────────────────────────────────
-- Brute force protection: đếm số lần sai password
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    success BOOLEAN NOT NULL DEFAULT false,
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Chỉ cần query gần đây, không cần index phức tạp
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts (email, attempted_at DESC);
-- Tự xóa record cũ hơn 24h (dùng pg_cron hoặc scheduled job)
COMMENT ON TABLE login_attempts IS 'Brute force tracking. Record > 24h được cleanup định kỳ.';
-- ── Trigger: auto update updated_at ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();