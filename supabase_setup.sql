-- =========================================================
-- Policy-RadarINDIA Complete Database Setup
-- Run this entire script in Supabase SQL Editor once
-- =========================================================

-- 1. Bronze Layer (Raw Scraped Data)
CREATE TABLE IF NOT EXISTS schemes_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    source_url TEXT NOT NULL,
    raw_content JSONB NOT NULL,
    content_hash TEXT NOT NULL
);

-- 2. Silver Layer (Clean Processed Policies)
CREATE TABLE IF NOT EXISTS schemes_clean (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_name TEXT NOT NULL,
    ministry TEXT NOT NULL,
    launch_year INTEGER,
    status TEXT,
    category TEXT,
    source_url TEXT,
    funding_type TEXT,
    max_funding_amount BIGINT,
    total_budget_allocated BIGINT,
    startups_funded_count INTEGER,
    sector_eligibility TEXT[],
    startup_stage TEXT[],
    dpiit_required BOOLEAN,
    geographic_restriction TEXT,
    application_portal TEXT,
    application_deadline DATE,
    processing_timeline TEXT,
    required_documents TEXT[],
    success_stories TEXT,
    sector_distribution JSONB,
    nlp_summary TEXT,
    content_hash TEXT,
    last_scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_summarised_hash TEXT,
    UNIQUE(scheme_name, ministry)
);

-- 3. AI Recommendation Cache
CREATE TABLE IF NOT EXISTS recommendation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector TEXT NOT NULL,
    stage TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT '',
    recommendations JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sector, stage, state)
);

-- 4. Version History (Tracks changes to government schemes over time)
CREATE TABLE IF NOT EXISTS scheme_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID REFERENCES schemes_clean(id) ON DELETE CASCADE,
    scheme_name TEXT,
    ministry TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_fields TEXT[],
    old_values JSONB,
    new_values JSONB
);

-- 5. User Profiles (Linked with Supabase Authentication)
CREATE TABLE IF NOT EXISTS startup_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    company_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    stage TEXT NOT NULL,
    geographic_restriction TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON startup_profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON startup_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON startup_profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 6. Analytics Materialized Views
CREATE MATERIALIZED VIEW IF NOT EXISTS funding_by_ministry AS
SELECT ministry, funding_type, SUM(total_budget_allocated) as total_budget
FROM schemes_clean
GROUP BY ministry, funding_type;

CREATE MATERIALIZED VIEW IF NOT EXISTS sector_distribution AS
SELECT unnest(sector_eligibility) as sector, COUNT(*) as scheme_count, SUM(max_funding_amount) as total_funding
FROM schemes_clean
GROUP BY sector;

CREATE MATERIALIZED VIEW IF NOT EXISTS stage_coverage AS
SELECT unnest(startup_stage) as stage, COUNT(*) as scheme_count
FROM schemes_clean
GROUP BY stage;

