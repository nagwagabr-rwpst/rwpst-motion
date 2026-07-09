-- RWPST Motion — Storage stabilization (live production schema)
-- Run after 008_workflow_engine.sql
--
-- Live audit (2026-07-07): project-assets bucket missing, storage policies absent,
-- rollback_project_request missing, request_files uses column "size" (not file_size).
--
-- DO NOT apply 009_storage_stabilization.sql — it incorrectly adds file_path/file_size.
-- This migration is the minimal production-aligned fix.

-- ---------------------------------------------------------------------------
-- 1. project-assets bucket (frontend: supabase-env.js storageBucket)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  true,
  10485760, -- 10 MB — matches projectRequestService.js MAX_FILE_SIZE
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. Storage policies — logos/, images/, videos/ (upload path contract)
-- ---------------------------------------------------------------------------

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

DROP POLICY IF EXISTS "anon_delete_project_assets" ON storage.objects;

CREATE POLICY "anon_delete_project_assets"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'project-assets');

DROP POLICY IF EXISTS "public_read_project_assets" ON storage.objects;

CREATE POLICY "public_read_project_assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-assets');

-- ---------------------------------------------------------------------------
-- 3. rollback_project_request — upload-failure cleanup (missing on production)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rollback_project_request(p_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'request_id is required';
  END IF;

  DELETE FROM public.status_history WHERE request_id = p_request_id;
  DELETE FROM public.request_files WHERE request_id = p_request_id;
  DELETE FROM public.project_requests WHERE id = p_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.rollback_project_request(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.rollback_project_request(UUID) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. insert_request_file — writes to live request_files schema (size column)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.insert_request_file(
  p_request_id UUID,
  p_file_type  TEXT,
  p_file_name  TEXT,
  p_file_url   TEXT,
  p_mime_type  TEXT DEFAULT NULL,
  p_file_size  BIGINT DEFAULT NULL
)
RETURNS TABLE (
  id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'request_id is required';
  END IF;

  IF NULLIF(TRIM(p_file_type), '') IS NULL THEN
    RAISE EXCEPTION 'file_type is required';
  END IF;

  IF NULLIF(TRIM(p_file_name), '') IS NULL THEN
    RAISE EXCEPTION 'file_name is required';
  END IF;

  IF NULLIF(TRIM(p_file_url), '') IS NULL THEN
    RAISE EXCEPTION 'file_url is required';
  END IF;

  IF p_file_type NOT IN ('logo', 'image', 'video') THEN
    RAISE EXCEPTION 'invalid file_type: %', p_file_type;
  END IF;

  INSERT INTO public.request_files (
    request_id,
    file_type,
    file_name,
    file_url,
    mime_type,
    size
  ) VALUES (
    p_request_id,
    TRIM(p_file_type),
    TRIM(p_file_name),
    TRIM(p_file_url),
    NULLIF(TRIM(p_mime_type), ''),
    p_file_size
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_request_file(UUID, TEXT, TEXT, TEXT, TEXT, BIGINT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.insert_request_file(UUID, TEXT, TEXT, TEXT, TEXT, BIGINT) TO anon, authenticated;
