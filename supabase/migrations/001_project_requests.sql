-- RWPST Motion — Project Request MVP schema
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.request_counters (
  year         INTEGER PRIMARY KEY,
  last_number  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.project_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number       TEXT NOT NULL UNIQUE,
  submission_id        UUID NOT NULL,
  full_name            TEXT NOT NULL,
  phone                TEXT NOT NULL,
  business_name        TEXT NOT NULL,
  business_type        TEXT NOT NULL,
  business_type_label  TEXT NOT NULL,
  business_type_other  TEXT,
  business_description TEXT NOT NULL,
  facebook_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  video_goal           TEXT NOT NULL,
  video_goal_label     TEXT NOT NULL,
  additional_notes     TEXT,
  payment_status       TEXT NOT NULL DEFAULT 'not_required',
  payment_reference    TEXT,
  payment_package      TEXT,
  status               TEXT NOT NULL DEFAULT 'pending',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.request_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  file_type    TEXT NOT NULL CHECK (file_type IN ('logo', 'image', 'video')),
  file_name    TEXT NOT NULL,
  file_path    TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  mime_type    TEXT,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.status_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  status       TEXT NOT NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_project_requests_request_number
  ON public.project_requests (request_number);

CREATE INDEX IF NOT EXISTS idx_project_requests_status
  ON public.project_requests (status);

CREATE INDEX IF NOT EXISTS idx_project_requests_created_at
  ON public.project_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_files_request_id
  ON public.request_files (request_id);

CREATE INDEX IF NOT EXISTS idx_status_history_request_id
  ON public.status_history (request_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_requests_updated_at ON public.project_requests;
CREATE TRIGGER trg_project_requests_updated_at
  BEFORE UPDATE ON public.project_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Request number generator: RWPST-2026-000001
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM now())::INTEGER;
  next_num     INTEGER;
BEGIN
  INSERT INTO public.request_counters (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE
    SET last_number = public.request_counters.last_number + 1
  RETURNING last_number INTO next_num;

  RETURN 'RWPST-' || current_year::TEXT || '-' || LPAD(next_num::TEXT, 6, '0');
END;
$$;

-- ---------------------------------------------------------------------------
-- Rollback helper (used when file upload fails after request insert)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rollback_project_request(p_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.status_history WHERE request_id = p_request_id;
  DELETE FROM public.request_files WHERE request_id = p_request_id;
  DELETE FROM public.project_requests WHERE id = p_request_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.request_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- Public form: insert-only for anonymous visitors
CREATE POLICY "anon_insert_project_requests"
  ON public.project_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_insert_request_files"
  ON public.request_files
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_insert_status_history"
  ON public.status_history
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No public SELECT/UPDATE/DELETE on tables (rollback uses SECURITY DEFINER RPC)

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT INSERT ON public.project_requests TO anon, authenticated;
GRANT INSERT ON public.request_files TO anon, authenticated;
GRANT INSERT ON public.status_history TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.generate_request_number() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_project_request(UUID) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket: project-assets
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  true,
  26214400, -- 25 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies: anon upload to logos/, images/, videos/
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

CREATE POLICY "anon_delete_project_assets"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'project-assets');

CREATE POLICY "public_read_project_assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-assets');
