-- ── Users ─────────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL CHECK (role IN ('CANDIDATE', 'EMPLOYER'."ADMIN")),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    oauth2_only BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- ── Candidate Profiles ────────────────────────────────────────────
CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    headline VARCHAR(255),
    summary TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(10),
    marital_status VARCHAR(20),
    profile_url VARCHAR(255) UNIQUE,
    job_search_status VARCHAR(20) CHECK (
        job_search_status IN (
            'ACTIVELY_LOOKING',
            'OPEN_TO_OFFERS',
            'NOT_LOOKING'
        )
    ),
    expected_salary INT DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'VND',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- ── Skills ────────────────────────────────────────────────────────
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50),
    years_of_exp INT DEFAULT 0
);
-- ── Experiences ───────────────────────────────────────────────────
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- ── Educations ────────────────────────────────────────────────────
CREATE TABLE educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    school VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    degree VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- ── Languages ─────────────────────────────────────────────────────
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (
        level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVE')
    )
);
-- ── Social Links ──────────────────────────────────────────────────
CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (
        platform IN (
            'LINKEDIN',
            'GITHUB',
            'DRIBBLE',
            'INSTAGRAM',
            'PORTFOLIO',
            'BEHANCE'
        )
    ),
    url VARCHAR(500) NOT NULL
);
-- ── Desired Jobs ──────────────────────────────────────────────────
CREATE TABLE desired_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    industry VARCHAR(255),
    min_salary INT DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'VND'
);
CREATE TABLE desired_job_contract_types (
    desired_job_id UUID NOT NULL REFERENCES desired_jobs(id) ON DELETE CASCADE,
    contract_type VARCHAR(50) NOT NULL CHECK (
        contract_type IN ('FULL_TIME', 'PART_TIME', 'REMOTE', 'INTERNSHIP')
    ),
    PRIMARY KEY (desired_job_id, contract_type)
);
CREATE TABLE desired_job_levels (
    desired_job_id UUID NOT NULL REFERENCES desired_jobs(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL CHECK (
        level IN (
            'FRESHER',
            'JUNIOR',
            'SENIOR',
            'MANAGER',
            'DIRECTOR'
        )
    ),
    PRIMARY KEY (desired_job_id, level)
);
-- ── Benefits ──────────────────────────────────────────────────────
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);
-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX idx_skills_profile ON skills(candidate_profile_id);
CREATE INDEX idx_experiences_profile ON experiences(candidate_profile_id);
CREATE INDEX idx_educations_profile ON educations(candidate_profile_id);
CREATE INDEX idx_languages_profile ON languages(candidate_profile_id);
CREATE INDEX idx_social_links_profile ON social_links(candidate_profile_id);
CREATE INDEX idx_desired_jobs_profile ON desired_jobs(candidate_profile_id);
CREATE INDEX idx_benefits_profile ON benefits(candidate_profile_id);