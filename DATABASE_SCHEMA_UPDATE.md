# Database Schema Updates for Image Upload & Emotion Features

You need to add several columns to your database tables to support the new features.

## Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy and paste the SQL below
6. Click **"Run"**

### SQL Migration Script:

```sql
-- ========================================
-- MOMENTS TABLE UPDATES
-- ========================================

-- Add image_path column to moments table
ALTER TABLE moments
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add emotion column to moments table (if not exists)
ALTER TABLE moments
ADD COLUMN IF NOT EXISTS emotion TEXT;

-- Add sentiment_score column to moments table (if not exists)
ALTER TABLE moments
ADD COLUMN IF NOT EXISTS sentiment_score FLOAT;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN moments.image_path IS 'Path to uploaded image in Supabase Storage (moment-images bucket)';
COMMENT ON COLUMN moments.emotion IS 'Detected or user-provided emotion (e.g., joyful, grateful, peaceful)';
COMMENT ON COLUMN moments.sentiment_score IS 'Sentiment score from -1 (negative) to 1 (positive)';

-- ========================================
-- ACTIVITIES TABLE UPDATES
-- ========================================

-- Add image_path column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add emotion and sentiment tracking for activities (optional but recommended)
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS emotion TEXT,
ADD COLUMN IF NOT EXISTS sentiment_score FLOAT;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN activities.image_path IS 'Path to uploaded image in Supabase Storage (activity-images bucket)';
COMMENT ON COLUMN activities.emotion IS 'Detected or user-provided emotion during activity (e.g., focused, energized, relaxed)';
COMMENT ON COLUMN activities.sentiment_score IS 'Sentiment score from -1 (negative) to 1 (positive)';
```

## Option 2: Using Supabase Table Editor

### For `moments` table:

Add three columns:

#### 1. Add `image_path` column:
1. Go to **Table Editor** → Select **moments** table
2. Click **"+ Add Column"**
3. Fill in:
   - **Name**: `image_path`
   - **Type**: `text`
   - **Default value**: (leave empty)
   - **Is nullable**: ✓ Yes
   - **Is unique**: ☐ No
4. Click **"Save"**

#### 2. Add `emotion` column:
1. Click **"+ Add Column"**
2. Fill in:
   - **Name**: `emotion`
   - **Type**: `text`
   - **Default value**: (leave empty)
   - **Is nullable**: ✓ Yes
   - **Is unique**: ☐ No
3. Click **"Save"**

#### 3. Add `sentiment_score` column:
1. Click **"+ Add Column"**
2. Fill in:
   - **Name**: `sentiment_score`
   - **Type**: `float8` (or `double precision`)
   - **Default value**: (leave empty)
   - **Is nullable**: ✓ Yes
   - **Is unique**: ☐ No
3. Click **"Save"**

### For `activities` table:

Add three columns:

#### 1. Add `image_path` column:
1. Go to **Table Editor** → Select **activities** table
2. Click **"+ Add Column"**
3. Fill in:
   - **Name**: `image_path`
   - **Type**: `text`
   - **Default value**: (leave empty)
   - **Is nullable**: ✓ Yes
   - **Is unique**: ☐ No
4. Click **"Save"**

#### 2. Add `emotion` column (optional but recommended):
1. Click **"+ Add Column"**
2. Fill in:
   - **Name**: `emotion`
   - **Type**: `text`
   - **Default value**: (leave empty)
   - **Is nullable**: ✓ Yes
   - **Is unique**: ☐ No
3. Click **"Save"**

#### 3. Add `sentiment_score` column (optional but recommended):
1. Click **"+ Add Column"**
2. Fill in:
   - **Name**: `sentiment_score`
   - **Type**: `float8` (or `double precision`)
   - **Default value**: (leave empty)
   - **Is nullable**: ✓ Yes
   - **Is unique**: ☐ No
3. Click **"Save"**

## Verify the Changes

Run this query to verify all columns were added:

```sql
-- Check moments table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'moments'
AND column_name IN ('image_path', 'emotion', 'sentiment_score')
ORDER BY column_name;

-- Check activities table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
AND column_name IN ('image_path', 'emotion', 'sentiment_score')
ORDER BY column_name;
```

Expected output:
```
-- For moments:
column_name      | data_type         | is_nullable
-----------------|-------------------|-------------
emotion          | text              | YES
image_path       | text              | YES
sentiment_score  | double precision  | YES

-- For activities:
column_name      | data_type         | is_nullable
-----------------|-------------------|-------------
emotion          | text              | YES
image_path       | text              | YES
sentiment_score  | double precision  | YES
```

## What This Enables

After adding these columns:
- ✅ Users can upload images when creating moments
- ✅ Users can upload images when logging activities
- ✅ Images are stored in Supabase Storage buckets
- ✅ Image paths are saved in the database for retrieval
- ✅ Emotion and sentiment analysis for moments
- ✅ Emotion and sentiment tracking for activities (helps understand emotional patterns during hobbies)
- ✅ Dashboard can filter positive moments by sentiment score
- ✅ Future features can analyze emotional trends across activities and moments
