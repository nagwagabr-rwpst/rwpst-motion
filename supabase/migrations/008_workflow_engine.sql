-- RWPST Motion — Workflow engine (state machine + change_project_status RPC)
-- Run after 007_admin_read_rpcs_v2.sql
--
-- Introduces workflow_transitions reference data and a transactional admin RPC
-- to move project_requests through the production lifecycle.

-- ---------------------------------------------------------------------------
-- workflow_transitions — allowed status edges (reference data)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workflow_transitions (
  from_status TEXT NOT NULL,
  to_status   TEXT NOT NULL,
  PRIMARY KEY (from_status, to_status)
);

ALTER TABLE public.workflow_transitions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Default workflow — idempotent seed
-- ---------------------------------------------------------------------------

INSERT INTO public.workflow_transitions (from_status, to_status) VALUES
  -- Intake & sales
  ('pending',          'contacted'),
  ('pending',          'cancelled'),
  ('contacted',        'quotation_sent'),
  ('contacted',        'cancelled'),
  ('quotation_sent',   'payment_pending'),
  ('quotation_sent',   'contacted'),
  ('quotation_sent',   'cancelled'),
  ('payment_pending',  'paid'),
  ('payment_pending',  'quotation_sent'),
  ('payment_pending',  'cancelled'),

  -- Production pipeline
  ('paid',             'script_writing'),
  ('paid',             'cancelled'),
  ('script_writing',   'storyboard'),
  ('script_writing',   'cancelled'),
  ('storyboard',       'production'),
  ('storyboard',       'script_writing'),
  ('storyboard',       'cancelled'),
  ('production',       'editing'),
  ('production',       'storyboard'),
  ('production',       'cancelled'),
  ('editing',          'review'),
  ('editing',          'production'),
  ('editing',          'cancelled'),
  ('review',           'approved'),
  ('review',           'client_revision'),
  ('review',           'editing'),
  ('review',           'cancelled'),
  ('client_revision',  'editing'),
  ('client_revision',  'review'),
  ('client_revision',  'cancelled'),

  -- Delivery & closure (terminal states have no outbound edges)
  ('approved',         'delivered'),
  ('delivered',        'completed')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- ---------------------------------------------------------------------------
-- change_project_status — validated, transactional status transition RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.change_project_status(
  p_request_id UUID,
  p_new_status TEXT,
  p_note       TEXT DEFAULT NULL
)
RETURNS TABLE (
  request_id     UUID,
  previous_status TEXT,
  new_status     TEXT,
  changed_at     TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id     UUID;
  v_current_status TEXT;
  v_new_status     TEXT;
  v_note           TEXT;
  v_changed_at     TIMESTAMPTZ;
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

  v_new_status := NULLIF(TRIM(p_new_status), '');

  IF v_new_status IS NULL THEN
    RAISE EXCEPTION 'new_status is required';
  END IF;

  v_note := NULLIF(TRIM(p_note), '');

  SELECT pr.id, pr.status
  INTO v_request_id, v_current_status
  FROM public.project_requests pr
  WHERE pr.id = p_request_id
  FOR UPDATE;

  IF v_request_id IS NULL THEN
    RAISE EXCEPTION 'request not found';
  END IF;

  IF v_current_status = v_new_status THEN
    RAISE EXCEPTION 'WORKFLOW:invalid_transition:Request is already in status %', v_current_status;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.workflow_transitions wt
    WHERE wt.from_status = v_current_status
      AND wt.to_status = v_new_status
  ) THEN
    RAISE EXCEPTION 'WORKFLOW:invalid_transition:Transition from % to % is not allowed',
      v_current_status, v_new_status;
  END IF;

  UPDATE public.project_requests
  SET status = v_new_status
  WHERE id = v_request_id;

  INSERT INTO public.status_history (request_id, status, note)
  VALUES (v_request_id, v_new_status, v_note);

  v_changed_at := now();

  RETURN QUERY
  SELECT v_request_id, v_current_status, v_new_status, v_changed_at;
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants — EXECUTE only; existing table RLS policies unchanged
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.change_project_status(UUID, TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.change_project_status(UUID, TEXT, TEXT) TO authenticated;
