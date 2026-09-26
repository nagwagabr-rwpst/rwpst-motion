-- RWPST Motion — 199 EGP restaurant trial order
-- Run after 010_storage_live_schema.sql
--
-- Extends project_requests. Does not create a second orders table.
-- Intake status stays "pending" so the existing workflow (008) can move the row.
-- Payment is not collected here: payment_status is "pending" (unpaid).

-- ---------------------------------------------------------------------------
-- Columns the trial form needs and the original request schema did not have
-- ---------------------------------------------------------------------------

ALTER TABLE public.project_requests
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS video_type TEXT,
  ADD COLUMN IF NOT EXISTS video_type_label TEXT,
  ADD COLUMN IF NOT EXISTS video_description TEXT,
  ADD COLUMN IF NOT EXISTS has_script_or_idea BOOLEAN,
  ADD COLUMN IF NOT EXISTS offer_type TEXT,
  ADD COLUMN IF NOT EXISTS price_egp INTEGER;

COMMENT ON COLUMN public.project_requests.whatsapp IS
  'WhatsApp number for trial orders. Also copied to phone for existing admin reads.';
COMMENT ON COLUMN public.project_requests.offer_type IS
  'trial_video for the 199 EGP first restaurant video.';
COMMENT ON COLUMN public.project_requests.price_egp IS
  'Quoted price in EGP. Trial orders store 199. Payment is a later step.';
COMMENT ON COLUMN public.project_requests.city IS
  'Governorate or city collected on the trial order form.';

CREATE INDEX IF NOT EXISTS idx_project_requests_offer_type
  ON public.project_requests (offer_type)
  WHERE offer_type IS NOT NULL;

-- ---------------------------------------------------------------------------
-- create_trial_order — restaurant trial intake
-- Price and offer are fixed. The browser cannot choose them.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_trial_order(
  p_customer_name       TEXT,
  p_business_name       TEXT,
  p_whatsapp            TEXT,
  p_city                TEXT,
  p_email               TEXT DEFAULT NULL,
  p_business_type       TEXT DEFAULT 'restaurant',
  p_video_type          TEXT DEFAULT 'dish_ad',
  p_video_description   TEXT DEFAULT NULL,
  p_has_script_or_idea  BOOLEAN DEFAULT FALSE,
  p_notes               TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, request_number TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_name      TEXT;
  v_business_name      TEXT;
  v_whatsapp           TEXT;
  v_city               TEXT;
  v_email              TEXT;
  v_business_type      TEXT;
  v_video_type         TEXT;
  v_video_type_label   TEXT;
  v_video_description  TEXT;
  v_notes              TEXT;
  v_has_script         BOOLEAN;
  v_submission_id      UUID;
  v_request_number     TEXT;
  v_request_id         UUID;
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
    status
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
    'pending'
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
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_trial_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
) TO anon, authenticated;
