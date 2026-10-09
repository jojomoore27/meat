-- ========================================================
-- BestGrassFedCattle — Supabase Storage Setup (Media Bucket)
-- Run this in your Supabase SQL Editor to enable direct,
-- permanent cloud picture uploads from any device.
-- ========================================================

-- 1. Create public 'media' bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  15728640, -- 15MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable public read access for all visitors across any device
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 3. Enable uploads into the media bucket
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- 4. Enable updates and deletes
DROP POLICY IF EXISTS "Public Manage Access" ON storage.objects;
CREATE POLICY "Public Manage Access"
ON storage.objects FOR ALL
USING (bucket_id = 'media');
