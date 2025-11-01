-- RE:ME Database Schema
-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  mbti text,
  age int,
  reminder_time time, -- daily reflection preference
  created_at timestamptz default now()
);

-- ============================================
-- HOBBIES TABLE
-- ============================================
create table if not exists hobbies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  category text,
  description text,
  level int default 0,
  exp int default 0,
  meta jsonb default '{}'::jsonb, -- AI-generated metadata: thresholds, subskills
  created_at timestamptz default now(),
  unique(user_id, lower(name))
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  hobby_id uuid references hobbies(id) on delete cascade,
  text text,
  image_path text,
  ai_summary text,
  ai_skills jsonb,
  exp_gained int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- REFLECTIONS TABLE
-- ============================================
create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  text text not null,
  ai_summary text,
  emotion text,
  sentiment_score float,
  created_at timestamptz default now()
);

-- ============================================
-- MOMENTS TABLE (Happy Moments Gallery)
-- ============================================
create table if not exists moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  text text,
  image_path text,
  created_at timestamptz default now()
);

-- ============================================
-- USER MEMORIES TABLE (Vector Embeddings)
-- ============================================
create table if not exists user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  source_type text not null, -- 'activity', 'reflection', 'moment'
  source_id uuid,
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 or similar
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
-- Vector index for similarity search
create index if not exists user_memories_embedding_idx 
  on user_memories using ivfflat (embedding vector_cosine_ops) 
  with (lists = 100);

-- Performance indexes
create index if not exists hobbies_user_id_idx on hobbies(user_id);
create index if not exists activity_logs_user_id_idx on activity_logs(user_id);
create index if not exists activity_logs_hobby_id_idx on activity_logs(hobby_id);
create index if not exists reflections_user_id_idx on reflections(user_id);
create index if not exists moments_user_id_idx on moments(user_id);
create index if not exists user_memories_user_id_idx on user_memories(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table hobbies enable row level security;
alter table activity_logs enable row level security;
alter table reflections enable row level security;
alter table moments enable row level security;
alter table user_memories enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Hobbies policies
create policy "Users can view own hobbies"
  on hobbies for select
  using (user_id = auth.uid());

create policy "Users can insert own hobbies"
  on hobbies for insert
  with check (user_id = auth.uid());

create policy "Users can update own hobbies"
  on hobbies for update
  using (user_id = auth.uid());

create policy "Users can delete own hobbies"
  on hobbies for delete
  using (user_id = auth.uid());

-- Activity logs policies
create policy "Users can view own activity logs"
  on activity_logs for select
  using (user_id = auth.uid());

create policy "Users can insert own activity logs"
  on activity_logs for insert
  with check (user_id = auth.uid());

create policy "Users can update own activity logs"
  on activity_logs for update
  using (user_id = auth.uid());

create policy "Users can delete own activity logs"
  on activity_logs for delete
  using (user_id = auth.uid());

-- Reflections policies
create policy "Users can view own reflections"
  on reflections for select
  using (user_id = auth.uid());

create policy "Users can insert own reflections"
  on reflections for insert
  with check (user_id = auth.uid());

create policy "Users can update own reflections"
  on reflections for update
  using (user_id = auth.uid());

create policy "Users can delete own reflections"
  on reflections for delete
  using (user_id = auth.uid());

-- Moments policies
create policy "Users can view own moments"
  on moments for select
  using (user_id = auth.uid());

create policy "Users can insert own moments"
  on moments for insert
  with check (user_id = auth.uid());

create policy "Users can update own moments"
  on moments for update
  using (user_id = auth.uid());

create policy "Users can delete own moments"
  on moments for delete
  using (user_id = auth.uid());

-- User memories policies
create policy "Users can view own memories"
  on user_memories for select
  using (user_id = auth.uid());

create policy "Users can insert own memories"
  on user_memories for insert
  with check (user_id = auth.uid());

create policy "Users can update own memories"
  on user_memories for update
  using (user_id = auth.uid());

create policy "Users can delete own memories"
  on user_memories for delete
  using (user_id = auth.uid());

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Note: Create these buckets in Supabase dashboard or via SQL
-- insert into storage.buckets (id, name, public) values ('activity-images', 'activity-images', false);
-- insert into storage.buckets (id, name, public) values ('moment-images', 'moment-images', false);

-- Storage policies (run after creating buckets)
-- create policy "Users can upload own activity images"
--   on storage.objects for insert
--   with check (bucket_id = 'activity-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Users can view own activity images"
--   on storage.objects for select
--   using (bucket_id = 'activity-images' and auth.uid()::text = (storage.foldername(name))[1]);
