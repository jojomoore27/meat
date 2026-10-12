-- ========================================================
-- BestGrassFedCattle — Supabase Storage Permissions Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This grants full upload & deletion rights for pictures in the 'media' bucket.
-- ========================================================

-- 1. Ensure the public 'media' bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  15728640, -- 15MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Clean up any existing policies on the media bucket
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Manage Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Bucket Full Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Bucket Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Media Bucket Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Media Bucket Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Media Bucket Public Update" ON storage.objects;

-- 3. Enable public view access across all devices
CREATE POLICY "Media Bucket Public Read"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'media');

-- 4. Enable picture uploads from website admin panel
CREATE POLICY "Media Bucket Public Insert"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id = 'media');

-- 5. Enable picture deletions when posts/media are deleted
CREATE POLICY "Media Bucket Public Delete"
ON storage.objects FOR DELETE
TO public, anon, authenticated
USING (bucket_id = 'media');

-- 6. Enable picture updates/re-uploads
CREATE POLICY "Media Bucket Public Update"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');
