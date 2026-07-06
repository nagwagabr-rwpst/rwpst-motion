-- RWPST Motion — Storage bucket limits aligned with client-side validation (10 MB)
-- Run after 001_project_requests.sql

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 10485760, -- 10 MB
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ]
WHERE id = 'project-assets';

-- Ensure anon/authenticated can upload only under logos/, images/, videos/
DROP POLICY IF EXISTS "anon_upload_project_assets" ON storage.objects;

CREATE POLICY "anon_upload_project_assets"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'project-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'images'
      OR (storage.foldername(name))[1] = 'videos'
    )
  );

-- Rollback cleanup: remove objects uploaded during a failed submission
DROP POLICY IF EXISTS "anon_delete_project_assets" ON storage.objects;

CREATE POLICY "anon_delete_project_assets"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'project-assets');

-- Public read for asset URLs returned to the form success flow / admin review
DROP POLICY IF EXISTS "public_read_project_assets" ON storage.objects;

CREATE POLICY "public_read_project_assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-assets');
