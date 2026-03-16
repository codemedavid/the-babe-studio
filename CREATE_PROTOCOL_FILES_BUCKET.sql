-- ================================================
-- Protocol Content Type & File Upload Support
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Add content_type column to protocols (text, file, or image)
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'text';

-- 2. Add file_url column to store uploaded file/image URLs
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 3. Create the 'protocol-files' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('protocol-files', 'protocol-files', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read protocol files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload protocol files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update protocol files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete protocol files" ON storage.objects;

-- 5. Enable public access (VIEWING/DOWNLOADING)
CREATE POLICY "Public can read protocol files" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'protocol-files');

-- 6. Allow uploads to protocol-files bucket
CREATE POLICY "Anyone can upload protocol files" ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'protocol-files');

-- 7. Allow updates to protocol-files bucket
CREATE POLICY "Anyone can update protocol files" ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'protocol-files');

-- 8. Allow deletes from protocol-files bucket
CREATE POLICY "Anyone can delete protocol files" ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'protocol-files');
