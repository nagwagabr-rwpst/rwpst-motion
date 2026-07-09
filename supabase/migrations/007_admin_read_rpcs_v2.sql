-- RWPST Motion — Admin read RPCs v2 (pagination + lookup by request number)
-- Run after 006_admin_read_rpcs.sql
--
-- Replaces get_project_requests() with paginated list_project_requests().
-- Adds get_project_request_by_number(). Refreshes retained RPCs with RBAC hooks.

-- ---------------------------------------------------------------------------
-- list_project_requests — paginated list (newest first)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.list_project_requests(
  p_limit  INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id                   UUID,
  request_number       TEXT,
  submission_id        UUID,
  full_name            TEXT,
  phone                TEXT,
  business_name        TEXT,
  business_type        TEXT,
  business_type_label  TEXT,
  business_type_other  TEXT,
  business_description TEXT,
  facebook_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  video_goal           TEXT,
  video_goal_label     TEXT,
  additional_notes     TEXT,
  payment_status       TEXT,
  payment_reference    TEXT,
  payment_package      TEXT,
  status               TEXT,
  created_at           TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit  INTEGER;
  v_offset INTEGER;
BEGIN
  -- ==================================================
  -- Future RBAC hook
  -- Replace with:
  -- PERFORM public.assert_admin();
  -- after admin role system is introduced.
  -- ==================================================

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  v_limit  := COALESCE(p_limit, 50);
  v_offset := COALESCE(p_offset, 0);

  IF v_limit < 1 OR v_limit > 200 THEN
    RAISE EXCEPTION 'p_limit must be between 1 and 200';
  END IF;

  IF v_offset < 0 THEN
    RAISE EXCEPTION 'p_offset must be at least 0';
  END IF;

  RETURN QUERY
  SELECT
    pr.id,
    pr.request_number,
    pr.submission_id,
    pr.full_name,
    pr.phone,
    pr.business_name,
    pr.business_type,
    pr.business_type_label,
    pr.business_type_other,
    pr.business_description,
    pr.facebook_url,
    pr.instagram_url,
    pr.website_url,
    pr.video_goal,
    pr.video_goal_label,
    pr.additional_notes,
    pr.payment_status,
    pr.payment_reference,
    pr.payment_package,
    pr.status,
    pr.created_at,
    pr.updated_at
  FROM public.project_requests pr
  ORDER BY pr.created_at DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

-- ---------------------------------------------------------------------------
-- get_project_request — single request by primary key
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_project_request(p_request_id UUID)
RETURNS TABLE (
  id                   UUID,
  request_number       TEXT,
  submission_id        UUID,
  full_name            TEXT,
  phone                TEXT,
  business_name        TEXT,
  business_type        TEXT,
  business_type_label  TEXT,
  business_type_other  TEXT,
  business_description TEXT,
  facebook_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  video_goal           TEXT,
  video_goal_label     TEXT,
  additional_notes     TEXT,
  payment_status       TEXT,
  payment_reference    TEXT,
  payment_package      TEXT,
  status               TEXT,
  created_at           TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ==================================================
  -- Future RBAC hook
  -- Replace with:
  -- PERFORM public.assert_admin();
  -- after admin role system is introduced.
  -- ==================================================

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'request_id is required';
  END IF;

  RETURN QUERY
  SELECT
    pr.id,
    pr.request_number,
    pr.submission_id,
    pr.full_name,
    pr.phone,
    pr.business_name,
    pr.business_type,
    pr.business_type_label,
    pr.business_type_other,
    pr.business_description,
    pr.facebook_url,
    pr.instagram_url,
    pr.website_url,
    pr.video_goal,
    pr.video_goal_label,
    pr.additional_notes,
    pr.payment_status,
    pr.payment_reference,
    pr.payment_package,
    pr.status,
    pr.created_at,
    pr.updated_at
  FROM public.project_requests pr
  WHERE pr.id = p_request_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- get_project_request_by_number — single request by request_number
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_project_request_by_number(p_request_number TEXT)
RETURNS TABLE (
  id                   UUID,
  request_number       TEXT,
  submission_id        UUID,
  full_name            TEXT,
  phone                TEXT,
  business_name        TEXT,
  business_type        TEXT,
  business_type_label  TEXT,
  business_type_other  TEXT,
  business_description TEXT,
  facebook_url         TEXT,
  instagram_url        TEXT,
  website_url          TEXT,
  video_goal           TEXT,
  video_goal_label     TEXT,
  additional_notes     TEXT,
  payment_status       TEXT,
  payment_reference    TEXT,
  payment_package      TEXT,
  status               TEXT,
  created_at           TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_number TEXT;
BEGIN
  -- ==================================================
  -- Future RBAC hook
  -- Replace with:
  -- PERFORM public.assert_admin();
  -- after admin role system is introduced.
  -- ==================================================

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  v_request_number := NULLIF(TRIM(p_request_number), '');

  IF v_request_number IS NULL THEN
    RAISE EXCEPTION 'request_number is required';
  END IF;

  RETURN QUERY
  SELECT
    pr.id,
    pr.request_number,
    pr.submission_id,
    pr.full_name,
    pr.phone,
    pr.business_name,
    pr.business_type,
    pr.business_type_label,
    pr.business_type_other,
    pr.business_description,
    pr.facebook_url,
    pr.instagram_url,
    pr.website_url,
    pr.video_goal,
    pr.video_goal_label,
    pr.additional_notes,
    pr.payment_status,
    pr.payment_reference,
    pr.payment_package,
    pr.status,
    pr.created_at,
    pr.updated_at
  FROM public.project_requests pr
  WHERE pr.request_number = v_request_number;
END;
$$;

-- ---------------------------------------------------------------------------
-- get_request_files — files attached to a request
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_request_files(p_request_id UUID)
RETURNS TABLE (
  id         UUID,
  request_id UUID,
  file_type  TEXT,
  file_name  TEXT,
  file_path  TEXT,
  file_url   TEXT,
  mime_type  TEXT,
  file_size  BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ==================================================
  -- Future RBAC hook
  -- Replace with:
  -- PERFORM public.assert_admin();
  -- after admin role system is introduced.
  -- ==================================================

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'request_id is required';
  END IF;

  RETURN QUERY
  SELECT
    rf.id,
    rf.request_id,
    rf.file_type,
    rf.file_name,
    rf.file_path,
    rf.file_url,
    rf.mime_type,
    rf.file_size,
    rf.created_at
  FROM public.request_files rf
  WHERE rf.request_id = p_request_id
  ORDER BY rf.created_at ASC;
END;
$$;

-- ---------------------------------------------------------------------------
-- get_status_history — status audit trail for a request
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_status_history(p_request_id UUID)
RETURNS TABLE (
  id         UUID,
  request_id UUID,
  status     TEXT,
  note       TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ==================================================
  -- Future RBAC hook
  -- Replace with:
  -- PERFORM public.assert_admin();
  -- after admin role system is introduced.
  -- ==================================================

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'request_id is required';
  END IF;

  RETURN QUERY
  SELECT
    sh.id,
    sh.request_id,
    sh.status,
    sh.note,
    sh.created_at
  FROM public.status_history sh
  WHERE sh.request_id = p_request_id
  ORDER BY sh.created_at ASC;
END;
$$;

-- ---------------------------------------------------------------------------
-- Retire superseded list RPC from 006
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_project_requests();

-- ---------------------------------------------------------------------------
-- Grants — EXECUTE only; no table-level SELECT grants (RLS unchanged)
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.list_project_requests(INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_project_request(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_project_request_by_number(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_request_files(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_status_history(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.list_project_requests(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_request_by_number(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_request_files(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_status_history(UUID) TO authenticated;
