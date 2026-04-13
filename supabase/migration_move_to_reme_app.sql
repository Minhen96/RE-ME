-- ========================================================
-- MIGRATE TO reme_app SCHEMA
-- ========================================================

-- 1. Create the new schema
CREATE SCHEMA IF NOT EXISTS reme_app;

-- 2. Move existing tables from public to reme_app
ALTER TABLE IF EXISTS public.profiles SET SCHEMA reme_app;
ALTER TABLE IF EXISTS public.hobbies SET SCHEMA reme_app;
ALTER TABLE IF EXISTS public.activity_logs SET SCHEMA reme_app;
ALTER TABLE IF EXISTS public.reflections SET SCHEMA reme_app;
ALTER TABLE IF EXISTS public.moments SET SCHEMA reme_app;
ALTER TABLE IF EXISTS public.user_memories SET SCHEMA reme_app;

-- 3. Move functions from public to reme_app
-- Note: PostgreSQL functions include their parameter types in the identifier
ALTER FUNCTION public.match_memories(vector(1536), float, int, uuid) SET SCHEMA reme_app;

-- 4. Grant necessary permissions for Supabase API to access the new schema
GRANT USAGE ON SCHEMA reme_app TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA reme_app TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA reme_app TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA reme_app TO anon, authenticated, service_role;

-- 5. Ensure future tables in this schema also have permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA reme_app GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA reme_app GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA reme_app GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- ========================================================
-- VERIFICATION QUERY
-- ========================================================
-- Run this to check if tables moved successfully:
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'reme_app';
