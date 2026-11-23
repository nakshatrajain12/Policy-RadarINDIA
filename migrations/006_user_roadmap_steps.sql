-- =========================================================
-- Migration 006: User Roadmap Step Status Persistence with RLS
-- Stores roadmap milestone progress for authenticated founders
-- =========================================================

CREATE TABLE IF NOT EXISTS user_roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scheme_id TEXT NOT NULL,
    step_key TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'done')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, step_key)
);

-- Turn on Row Level Security so users can only access their own roadmap records
ALTER TABLE user_roadmap_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmap steps" 
    ON user_roadmap_steps FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap steps" 
    ON user_roadmap_steps FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap steps" 
    ON user_roadmap_steps FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap steps" 
    ON user_roadmap_steps FOR DELETE 
    USING (auth.uid() = user_id);
