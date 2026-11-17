-- Run this 4-line script in Supabase SQL Editor to allow saving and reading schemes:
ALTER TABLE schemes_clean DISABLE ROW LEVEL SECURITY;
ALTER TABLE schemes_raw DISABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_versions DISABLE ROW LEVEL SECURITY;

