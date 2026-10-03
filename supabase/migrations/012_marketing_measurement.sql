-- RWPST Motion — first-party marketing measurement
-- Run after 011_trial_order.sql, as one script in the Supabase SQL Editor.
--
-- Anonymous sessions and funnel events. No customer table.
-- Orders link to a session through project_requests.marketing_session_id.
-- Price, payment, offer, and status behavior of create_trial_order are unchanged.
--
-- create_trial_order: the 11-argument function is created first, with
-- p_marketing_session_id uuid default null. The previous 10-argument
-- overload is dropped only after that create. A completed run of this
-- script does not leave the old production RPC alongside the new one.

-- ---------------------------------------------------------------------------
-- marketing_sessions — one anonymous browsing session
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketing_sessions (
  id            UUID PRIMARY KEY,
  source        TEXT,
  medium        TEXT,
  campaign      TEXT,
  content       TEXT,
  term          TEXT,
  landing_page  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketing_sessions_source_len CHECK (source IS NULL OR char_length(source) <= 200),
  CONSTRAINT marketing_sessions_medium_len CHECK (medium IS NULL OR char_length(medium) <= 200),
  CONSTRAINT marketing_sessions_campaign_len CHECK (campaign IS NULL OR char_length(campaign) <= 200),
  CONSTRAINT marketing_sessions_content_len CHECK (content IS NULL OR char_length(content) <= 200),
  CONSTRAINT marketing_sessions_term_len CHECK (term IS NULL OR char_length(term) <= 200),
  CONSTRAINT marketing_sessions_landing_page_len CHECK (
    char_length(landing_page) BETWEEN 1 AND 300
  )
);

COMMENT ON TABLE public.marketing_sessions IS
  'Anonymous marketing session. No name, email, or phone.';
COMMENT ON COLUMN public.marketing_sessions.id IS
  'Client-generated session UUID. This is the session identifier.';
COMMENT ON COLUMN public.marketing_sessions.content IS
  'utm_content. Used as the ad identifier, for example ad002.';
COMMENT ON COLUMN public.marketing_sessions.term IS
  'utm_term when present. Meta usually leaves this empty.';
COMMENT ON COLUMN public.marketing_sessions.landing_page IS
  'Path of the first page in the session, without query string.';

CREATE INDEX IF NOT EXISTS idx_marketing_sessions_created_at
  ON public.marketing_sessions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_sessions_campaign
  ON public.marketing_sessions (campaign)
  WHERE campaign IS NOT NULL;

-- ---------------------------------------------------------------------------
-- marketing_events — append-only funnel events for a session
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketing_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.marketing_sessions(id) ON DELETE CASCADE,
  event_name  TEXT NOT NULL,
  page        TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketing_events_name_check CHECK (
    event_name IN ('page_view', 'cta_click', 'order_form_view', 'order_submit')
  ),
  CONSTRAINT marketing_events_page_len CHECK (char_length(page) BETWEEN 1 AND 300),
  CONSTRAINT marketing_events_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

COMMENT ON TABLE public.marketing_events IS
  'Anonymous funnel events. metadata is exact: {} for page_view and order_form_view, {cta} for cta_click, {request_id, request_number} for order_submit.';

CREATE INDEX IF NOT EXISTS idx_marketing_events_session_created
  ON public.marketing_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_events_name_created
  ON public.marketing_events (event_name, created_at DESC);

-- Exact metadata shape per event_name. Extra keys are rejected.
ALTER TABLE public.marketing_events
  DROP CONSTRAINT IF EXISTS marketing_events_metadata_shape;

ALTER TABLE public.marketing_events
  ADD CONSTRAINT marketing_events_metadata_shape CHECK (
    (
      event_name IN ('page_view', 'order_form_view')
      AND metadata = '{}'::jsonb
    )
    OR (
      event_name = 'cta_click'
      AND metadata - 'cta' = '{}'::jsonb
      AND jsonb_typeof(metadata->'cta') = 'string'
      AND metadata->>'cta' IN ('hero_trial', 'pricing_trial', 'proof_trial')
    )
    OR (
      event_name = 'order_submit'
      AND metadata - 'request_id' - 'request_number' = '{}'::jsonb
      AND jsonb_typeof(metadata->'request_id') = 'string'
      AND jsonb_typeof(metadata->'request_number') = 'string'
      AND metadata->>'request_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND metadata->>'request_number' ~ '^RWPST-TRL-[0-9]{8}-[0-9]{4}$'
    )
  );

-- ---------------------------------------------------------------------------
-- RLS — no anon policies. Writes go through SECURITY DEFINER RPCs only.
-- ---------------------------------------------------------------------------

ALTER TABLE public.marketing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.marketing_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.marketing_events FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- record_marketing_session
-- Inserts a session. On a later visit, each attribution field is replaced
-- only when the new value is non-null. A null UTM field keeps the stored
-- value. A direct revisit does not erase existing campaign attribution.
-- A later URL that supplies UTM values may replace those fields.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_marketing_session(
  p_session_id    UUID,
  p_landing_page  TEXT,
  p_source        TEXT DEFAULT NULL,
  p_medium        TEXT DEFAULT NULL,
  p_campaign      TEXT DEFAULT NULL,
  p_content       TEXT DEFAULT NULL,
  p_term          TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source       TEXT;
  v_medium       TEXT;
  v_campaign     TEXT;
  v_content      TEXT;
  v_term         TEXT;
  v_landing_page TEXT;
  v_has_touch    BOOLEAN;
  v_session_id   UUID;
BEGIN
  IF p_session_id IS NULL THEN
    RAISE EXCEPTION 'MARKETING:session_id_required';
  END IF;

  v_source := NULLIF(LEFT(regexp_replace(TRIM(COALESCE(p_source, '')), '[[:cntrl:]]', '', 'g'), 200), '');
  v_medium := NULLIF(LEFT(regexp_replace(TRIM(COALESCE(p_medium, '')), '[[:cntrl:]]', '', 'g'), 200), '');
  v_campaign := NULLIF(LEFT(regexp_replace(TRIM(COALESCE(p_campaign, '')), '[[:cntrl:]]', '', 'g'), 200), '');
  v_content := NULLIF(LEFT(regexp_replace(TRIM(COALESCE(p_content, '')), '[[:cntrl:]]', '', 'g'), 200), '');
  v_term := NULLIF(LEFT(regexp_replace(TRIM(COALESCE(p_term, '')), '[[:cntrl:]]', '', 'g'), 200), '');

  v_landing_page := regexp_replace(TRIM(COALESCE(p_landing_page, '')), '[[:cntrl:]]', '', 'g');
  v_landing_page := split_part(v_landing_page, '?', 1);
  v_landing_page := split_part(v_landing_page, '#', 1);
  IF v_landing_page ~* '^https?://' THEN
    v_landing_page := regexp_replace(v_landing_page, '^https?://[^/]+', '');
  END IF;
  IF v_landing_page IS NULL OR v_landing_page = '' THEN
    v_landing_page := '/';
  END IF;
  IF left(v_landing_page, 1) <> '/' THEN
    v_landing_page := '/' || v_landing_page;
  END IF;
  v_landing_page := left(v_landing_page, 300);

  v_has_touch :=
    v_campaign IS NOT NULL
    OR v_content IS NOT NULL
    OR v_term IS NOT NULL
    OR (v_source IS NOT NULL AND v_source <> 'direct')
    OR (v_medium IS NOT NULL AND v_medium <> 'none');

  IF NOT v_has_touch THEN
    v_source := COALESCE(v_source, 'direct');
    v_medium := COALESCE(v_medium, 'none');
  END IF;

  INSERT INTO public.marketing_sessions (
    id,
    source,
    medium,
    campaign,
    content,
    term,
    landing_page
  ) VALUES (
    p_session_id,
    v_source,
    v_medium,
    v_campaign,
    v_content,
    v_term,
    v_landing_page
  )
  ON CONFLICT (id) DO UPDATE SET
    source = CASE
      WHEN v_has_touch AND EXCLUDED.source IS NOT NULL THEN EXCLUDED.source
      ELSE marketing_sessions.source
    END,
    medium = CASE
      WHEN v_has_touch AND EXCLUDED.medium IS NOT NULL THEN EXCLUDED.medium
      ELSE marketing_sessions.medium
    END,
    campaign = CASE
      WHEN v_has_touch AND EXCLUDED.campaign IS NOT NULL THEN EXCLUDED.campaign
      ELSE marketing_sessions.campaign
    END,
    content = CASE
      WHEN v_has_touch AND EXCLUDED.content IS NOT NULL THEN EXCLUDED.content
      ELSE marketing_sessions.content
    END,
    term = CASE
      WHEN v_has_touch AND EXCLUDED.term IS NOT NULL THEN EXCLUDED.term
      ELSE marketing_sessions.term
    END,
    updated_at = now()
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_marketing_session(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_marketing_session(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- record_marketing_event
-- Inserts one allowlisted event for an existing session.
-- Metadata must be the exact object for that event. Extra keys are rejected.
-- page_view, order_form_view: {}
-- cta_click: { "cta": "hero_trial" | "pricing_trial" | "proof_trial" }
-- order_submit: { "request_id": "<uuid>", "request_number": "RWPST-TRL-YYYYMMDD-NNNN" }
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_marketing_event(
  p_session_id  UUID,
  p_event_name  TEXT,
  p_page        TEXT,
  p_metadata    JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_name TEXT;
  v_page       TEXT;
  v_metadata   JSONB;
  v_event_id   UUID;
BEGIN
  IF p_session_id IS NULL THEN
    RAISE EXCEPTION 'MARKETING:session_id_required';
  END IF;

  v_event_name := NULLIF(TRIM(COALESCE(p_event_name, '')), '');
  IF v_event_name IS NULL OR v_event_name NOT IN (
    'page_view',
    'cta_click',
    'order_form_view',
    'order_submit'
  ) THEN
    RAISE EXCEPTION 'MARKETING:invalid_event';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.marketing_sessions
    WHERE id = p_session_id
  ) THEN
    RAISE EXCEPTION 'MARKETING:unknown_session';
  END IF;

  IF p_metadata IS NOT NULL AND octet_length(p_metadata::text) > 4000 THEN
    RAISE EXCEPTION 'MARKETING:metadata_too_large';
  END IF;

  IF p_metadata IS NULL THEN
    v_metadata := '{}'::jsonb;
  ELSIF jsonb_typeof(p_metadata) <> 'object' THEN
    RAISE EXCEPTION 'MARKETING:invalid_metadata';
  ELSE
    v_metadata := p_metadata;
  END IF;

  IF v_event_name IN ('page_view', 'order_form_view') THEN
    IF v_metadata <> '{}'::jsonb THEN
      RAISE EXCEPTION 'MARKETING:invalid_metadata';
    END IF;

  ELSIF v_event_name = 'cta_click' THEN
    IF v_metadata->'cta' IS NULL
       OR jsonb_typeof(v_metadata->'cta') <> 'string'
       OR v_metadata - 'cta' <> '{}'::jsonb
       OR (v_metadata->>'cta') NOT IN ('hero_trial', 'pricing_trial', 'proof_trial') THEN
      RAISE EXCEPTION 'MARKETING:invalid_metadata';
    END IF;
    v_metadata := jsonb_build_object('cta', v_metadata->>'cta');

  ELSIF v_event_name = 'order_submit' THEN
    IF v_metadata->'request_id' IS NULL
       OR v_metadata->'request_number' IS NULL
       OR jsonb_typeof(v_metadata->'request_id') <> 'string'
       OR jsonb_typeof(v_metadata->'request_number') <> 'string'
       OR v_metadata - 'request_id' - 'request_number' <> '{}'::jsonb
       OR (v_metadata->>'request_id') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
       OR (v_metadata->>'request_number') !~ '^RWPST-TRL-[0-9]{8}-[0-9]{4}$' THEN
      RAISE EXCEPTION 'MARKETING:invalid_metadata';
    END IF;
    v_metadata := jsonb_build_object(
      'request_id', lower(v_metadata->>'request_id'),
      'request_number', v_metadata->>'request_number'
    );

  ELSE
    RAISE EXCEPTION 'MARKETING:invalid_event';
  END IF;

  v_page := regexp_replace(TRIM(COALESCE(p_page, '')), '[[:cntrl:]]', '', 'g');
  v_page := split_part(v_page, '?', 1);
  v_page := split_part(v_page, '#', 1);
  IF v_page ~* '^https?://' THEN
    v_page := regexp_replace(v_page, '^https?://[^/]+', '');
  END IF;
  IF v_page IS NULL OR v_page = '' THEN
    v_page := '/';
  END IF;
  IF left(v_page, 1) <> '/' THEN
    v_page := '/' || v_page;
  END IF;
  v_page := left(v_page, 300);

  INSERT INTO public.marketing_events (session_id, event_name, page, metadata)
  VALUES (p_session_id, v_event_name, v_page, v_metadata)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_marketing_event(UUID, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_marketing_event(UUID, TEXT, TEXT, JSONB) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Link an order to a session. Nullable. No third attribution table.
-- Deleting a session clears the link. Deleting an order leaves the session.
-- ---------------------------------------------------------------------------

ALTER TABLE public.project_requests
  ADD COLUMN IF NOT EXISTS marketing_session_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'project_requests_marketing_session_id_fkey'
      AND conrelid = 'public.project_requests'::regclass
  ) THEN
    ALTER TABLE public.project_requests
      ADD CONSTRAINT project_requests_marketing_session_id_fkey
      FOREIGN KEY (marketing_session_id)
      REFERENCES public.marketing_sessions(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

COMMENT ON COLUMN public.project_requests.marketing_session_id IS
  'Anonymous marketing session that submitted this order. Null for older rows and for orders whose session was not found.';

CREATE INDEX IF NOT EXISTS idx_project_requests_marketing_session_id
  ON public.project_requests (marketing_session_id)
  WHERE marketing_session_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- create_trial_order — 11-argument function, created before the old overload
-- is removed.
--
-- Step 1 below creates:
--   create_trial_order(..., p_marketing_session_id uuid default null)
-- Step 2, after this function exists, drops the previous 10-argument
-- overload. A successful migration does not leave the old production RPC
-- alongside the new one.
--
-- Unknown or missing session id is stored as NULL and does not fail the order.
-- Business values stay fixed: price_egp 199, payment_status pending,
-- payment_package trial_199, offer_type trial_video, status pending.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_trial_order(
  p_customer_name         TEXT,
  p_business_name         TEXT,
  p_whatsapp              TEXT,
  p_city                  TEXT,
  p_email                 TEXT DEFAULT NULL,
  p_business_type         TEXT DEFAULT 'restaurant',
  p_video_type            TEXT DEFAULT 'dish_ad',
  p_video_description     TEXT DEFAULT NULL,
  p_has_script_or_idea    BOOLEAN DEFAULT FALSE,
  p_notes                 TEXT DEFAULT NULL,
  p_marketing_session_id  UUID DEFAULT NULL
)
RETURNS TABLE (id UUID, request_number TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_name        TEXT;
  v_business_name        TEXT;
  v_whatsapp             TEXT;
  v_city                 TEXT;
  v_email                TEXT;
  v_business_type        TEXT;
  v_video_type           TEXT;
  v_video_type_label     TEXT;
  v_video_description    TEXT;
  v_notes                TEXT;
  v_has_script           BOOLEAN;
  v_submission_id        UUID;
  v_request_number       TEXT;
  v_request_id           UUID;
  v_marketing_session_id UUID;
BEGIN
  v_customer_name     := NULLIF(TRIM(p_customer_name), '');
  v_business_name     := NULLIF(TRIM(p_business_name), '');
  v_city              := NULLIF(TRIM(p_city), '');
  v_email             := NULLIF(LOWER(TRIM(p_email)), '');
  v_business_type     := COALESCE(NULLIF(TRIM(p_business_type), ''), 'restaurant');
  v_video_type        := COALESCE(NULLIF(TRIM(p_video_type), ''), 'dish_ad');
  v_video_description := NULLIF(TRIM(p_video_description), '');
  v_notes             := NULLIF(TRIM(p_notes), '');
  v_has_script        := COALESCE(p_has_script_or_idea, FALSE);

  v_whatsapp := regexp_replace(COALESCE(p_whatsapp, ''), '[^0-9]', '', 'g');
  IF v_whatsapp LIKE '00%' THEN
    v_whatsapp := substring(v_whatsapp FROM 3);
  END IF;
  IF v_whatsapp ~ '^01[0125][0-9]{8}$' THEN
    v_whatsapp := '20' || substring(v_whatsapp FROM 2);
  END IF;

  IF v_customer_name IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:customer_name:Customer name is required';
  END IF;

  IF char_length(v_customer_name) > 120 THEN
    RAISE EXCEPTION 'VALIDATION:customer_name:Customer name is too long';
  END IF;

  IF v_business_name IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:business_name:Business name is required';
  END IF;

  IF char_length(v_business_name) > 160 THEN
    RAISE EXCEPTION 'VALIDATION:business_name:Business name is too long';
  END IF;

  IF v_whatsapp !~ '^20(10|11|12|15)[0-9]{8}$' THEN
    RAISE EXCEPTION 'VALIDATION:whatsapp:Invalid WhatsApp number';
  END IF;

  IF v_city IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:city:City is required';
  END IF;

  IF char_length(v_city) > 80 THEN
    RAISE EXCEPTION 'VALIDATION:city:City is too long';
  END IF;

  IF v_email IS NOT NULL AND v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'VALIDATION:email:Invalid email';
  END IF;

  IF v_business_type <> 'restaurant' THEN
    RAISE EXCEPTION 'VALIDATION:business_type:This offer is for restaurants';
  END IF;

  IF v_video_type NOT IN ('dish_ad', 'offer', 'restaurant_ad', 'other') THEN
    RAISE EXCEPTION 'VALIDATION:video_type:Invalid video type';
  END IF;

  IF v_video_description IS NOT NULL AND char_length(v_video_description) > 2000 THEN
    RAISE EXCEPTION 'VALIDATION:video_description:Video description is too long';
  END IF;

  IF v_notes IS NOT NULL AND char_length(v_notes) > 2000 THEN
    RAISE EXCEPTION 'VALIDATION:notes:Notes are too long';
  END IF;

  v_video_type_label := CASE v_video_type
    WHEN 'dish_ad'       THEN 'إعلان منتج / طبق'
    WHEN 'offer'         THEN 'عرض أو خصم'
    WHEN 'restaurant_ad' THEN 'إعلان عام للمطعم'
    WHEN 'other'         THEN 'غير ذلك'
    ELSE v_video_type
  END;

  v_marketing_session_id := NULL;
  IF p_marketing_session_id IS NOT NULL THEN
    SELECT ms.id
    INTO v_marketing_session_id
    FROM public.marketing_sessions ms
    WHERE ms.id = p_marketing_session_id;
  END IF;

  v_submission_id  := gen_random_uuid();
  v_request_number := public.generate_request_number('TRL');

  INSERT INTO public.project_requests (
    request_number,
    submission_id,
    full_name,
    phone,
    whatsapp,
    business_name,
    city,
    email,
    business_type,
    business_type_label,
    business_description,
    video_goal,
    video_goal_label,
    video_type,
    video_type_label,
    video_description,
    has_script_or_idea,
    additional_notes,
    offer_type,
    price_egp,
    payment_status,
    payment_package,
    status,
    marketing_session_id
  ) VALUES (
    v_request_number,
    v_submission_id,
    v_customer_name,
    v_whatsapp,
    v_whatsapp,
    v_business_name,
    v_city,
    v_email,
    'restaurant',
    'مطعم',
    COALESCE(v_video_description, ''),
    v_video_type,
    v_video_type_label,
    v_video_type,
    v_video_type_label,
    v_video_description,
    v_has_script,
    v_notes,
    'trial_video',
    199,
    'pending',
    'trial_199',
    'pending',
    v_marketing_session_id
  )
  RETURNING project_requests.id INTO v_request_id;

  INSERT INTO public.status_history (request_id, status, note)
  VALUES (
    v_request_id,
    'pending',
    'Trial video order submitted. Payment not collected.'
  );

  RETURN QUERY SELECT v_request_id, v_request_number;
END;
$$;

REVOKE ALL ON FUNCTION public.create_trial_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, UUID
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_trial_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, UUID
) TO anon, authenticated;

-- Step 2: the 11-argument function already exists. Remove the old
-- 10-argument overload so a completed migration keeps only the new RPC.
DROP FUNCTION IF EXISTS public.create_trial_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
);

NOTIFY pgrst, 'reload schema';
