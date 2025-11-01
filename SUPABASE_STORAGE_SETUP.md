# Supabase Storage Setup

## Creating Storage Buckets

You need to create two storage buckets in your Supabase project for image uploads:

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**

### Create these buckets:

#### 1. `moment-images` bucket
- **Name**: `moment-images`
- **Public bucket**: ✅ Yes (check this box)
- Click **Create bucket**

#### 2. `activity-images` bucket
- **Name**: `activity-images`
- **Public bucket**: ✅ Yes (check this box)
- Click **Create bucket**

### Set Bucket Policies

For each bucket, you need to set up RLS (Row Level Security) policies:

1. Click on the bucket name
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Select **"For full customization"**

#### Policy for INSERT (Upload)
```sql
-- Policy name: Allow authenticated users to upload
-- Target roles: authenticated
-- Using expression:
auth.uid() IS NOT NULL

-- With check expression:
bucket_id = 'moment-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy for SELECT (Read/Download)
```sql
-- Policy name: Allow public to read
-- Target roles: public
-- Using expression:
true
```

#### Policy for UPDATE (Update)
```sql
-- Policy name: Allow users to update their own images
-- Target roles: authenticated
-- Using expression:
auth.uid()::text = (storage.foldername(name))[1]

-- With check expression:
bucket_id = 'moment-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy for DELETE (Delete)
```sql
-- Policy name: Allow users to delete their own images
-- Target roles: authenticated
-- Using expression:
auth.uid()::text = (storage.foldername(name))[1]
```

**Repeat the same policies for the `activity-images` bucket** (just change `bucket_id = 'moment-images'` to `bucket_id = 'activity-images'`)

### Quick Policy Setup (Alternative)

Alternatively, you can use these simplified policies:

**For INSERT:**
```sql
((bucket_id = 'moment-images') AND (auth.uid() IS NOT NULL))
```

**For SELECT (public read):**
```sql
bucket_id = 'moment-images'
```

**For UPDATE/DELETE:**
```sql
((bucket_id = 'moment-images') AND ((storage.foldername(name))[1] = (auth.uid())::text))
```

This ensures:
- ✅ Only authenticated users can upload images
- ✅ Images are stored in user-specific folders (userId/filename.jpg)
- ✅ Users can only modify/delete their own images
- ✅ Anyone can view images (public bucket)
