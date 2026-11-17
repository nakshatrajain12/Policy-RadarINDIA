-- ========================================================
-- Migration 005: Schema v2 (Data Foundation & Auditing)
-- Adds structured eligibility, source audit tracking,
-- scrape runs observability, and analytics snapshots
-- ========================================================

-- 1. Upgrade schemes_clean with v2 columns
ALTER TABLE schemes_clean 
    ADD COLUMN IF NOT EXISTS canonical_name TEXT,
    ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'central',
    ADD COLUMN IF NOT EXISTS state_code TEXT DEFAULT 'PAN',
    ADD COLUMN IF NOT EXISTS implementing_agency TEXT,
    ADD COLUMN IF NOT EXISTS benefit_type TEXT DEFAULT 'grant',
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS eligibility JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'auto_approved',
    ADD COLUMN IF NOT EXISTS confidence NUMERIC DEFAULT 0.90,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE;

-- 2. Audit Trail: scheme_sources (verifiable citations & quotes)
CREATE TABLE IF NOT EXISTS scheme_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID REFERENCES schemes_clean(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    http_status INTEGER DEFAULT 200,
    content_hash TEXT,
    evidence JSONB DEFAULT '{}'
);

-- 3. Observability: scrape_runs (tracks scraping health & counts)
CREATE TABLE IF NOT EXISTS scrape_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    found INTEGER DEFAULT 0,
    inserted INTEGER DEFAULT 0,
    updated INTEGER DEFAULT 0,
    rejected INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'
);

-- 4. Precomputed Snapshots: analytics_snapshots (sub-150ms analytics)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB NOT NULL,
    facts JSONB DEFAULT '[]',
    ai_brief TEXT,
    brief_verified BOOLEAN DEFAULT FALSE
);

-- 5. Copilot Semantic Cache: qa_cache (sub-200ms Q&A repeats)
CREATE TABLE IF NOT EXISTS qa_cache (
    question_hash TEXT PRIMARY KEY,
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,
    chart_spec JSONB,
    snapshot_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_schemes_clean_level ON schemes_clean(level);
CREATE INDEX IF NOT EXISTS idx_schemes_clean_state ON schemes_clean(state_code);
CREATE INDEX IF NOT EXISTS idx_schemes_clean_review ON schemes_clean(review_status);
CREATE INDEX IF NOT EXISTS idx_schemes_clean_benefit ON schemes_clean(benefit_type);

-- GIN indexes for array containment queries
CREATE INDEX IF NOT EXISTS idx_schemes_clean_sectors_gin ON schemes_clean USING gin(sector_eligibility);
CREATE INDEX IF NOT EXISTS idx_schemes_clean_stages_gin ON schemes_clean USING gin(startup_stage);
CREATE INDEX IF NOT EXISTS idx_schemes_clean_tags_gin ON schemes_clean USING gin(tags);

-- Disable RLS on pipeline & analytics tables
ALTER TABLE scheme_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE qa_cache DISABLE ROW LEVEL SECURITY;
