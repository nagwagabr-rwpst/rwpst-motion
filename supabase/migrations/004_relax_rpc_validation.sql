-- RWPST Motion — Relax create_project_request validation for ads conversion flow
-- Run after 002_create_project_request_rpc.sql
--
-- Required: p_full_name, p_phone only
-- Optional with safe defaults: business_type, business_description, video_goal

CREATE OR REPLACE FUNCTION public.create_project_request(
  p_full_name            TEXT,
  p_phone                TEXT,
  p_business_name        TEXT DEFAULT NULL,
  p_business_type        TEXT DEFAULT NULL,
  p_business_type_other  TEXT DEFAULT NULL,
  p_business_description TEXT DEFAULT NULL,
  p_facebook             TEXT DEFAULT NULL,
  p_instagram            TEXT DEFAULT NULL,
  p_website              TEXT DEFAULT NULL,
  p_video_goal           TEXT DEFAULT NULL,
  p_additional_notes     TEXT DEFAULT NULL,
  p_payment_status       TEXT DEFAULT 'not_required',
  p_payment_reference    TEXT DEFAULT NULL,
  p_payment_package      TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, request_number TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name            TEXT;
  v_phone                TEXT;
  v_business_name        TEXT;
  v_business_type        TEXT;
  v_business_type_other  TEXT;
  v_business_description TEXT;
  v_business_type_label  TEXT;
  v_video_goal           TEXT;
  v_video_goal_label     TEXT;
  v_facebook             TEXT;
  v_instagram            TEXT;
  v_website              TEXT;
  v_additional_notes     TEXT;
  v_payment_status       TEXT;
  v_payment_reference    TEXT;
  v_payment_package      TEXT;
  v_submission_id        UUID;
  v_request_number       TEXT;
  v_request_id           UUID;
BEGIN
  -- Normalize text inputs (NULL when empty after trim)
  v_full_name            := NULLIF(TRIM(p_full_name), '');
  v_phone                := NULLIF(TRIM(p_phone), '');
  v_business_name        := NULLIF(TRIM(p_business_name), '');
  v_business_type        := NULLIF(TRIM(p_business_type), '');
  v_business_type_other  := NULLIF(TRIM(p_business_type_other), '');
  v_business_description := NULLIF(TRIM(p_business_description), '');
  v_facebook             := NULLIF(TRIM(p_facebook), '');
  v_instagram            := NULLIF(TRIM(p_instagram), '');
  v_website              := NULLIF(TRIM(p_website), '');
  v_video_goal           := NULLIF(TRIM(p_video_goal), '');
  v_additional_notes     := NULLIF(TRIM(p_additional_notes), '');
  v_payment_status       := COALESCE(NULLIF(TRIM(p_payment_status), ''), 'not_required');
  v_payment_reference    := NULLIF(TRIM(p_payment_reference), '');
  v_payment_package      := NULLIF(TRIM(p_payment_package), '');

  -- Required field validation (name + phone only)
  IF v_full_name IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:full_name:Full name is required';
  END IF;

  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:phone:Phone number is required';
  END IF;

  IF LENGTH(v_phone) < 8 THEN
    RAISE EXCEPTION 'VALIDATION:phone:Phone number must be at least 8 characters';
  END IF;

  IF p_business_name IS NOT NULL AND v_business_name IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:business_name:Business name cannot be blank';
  END IF;

  IF v_business_type = 'other' AND v_business_type_other IS NULL THEN
    RAISE EXCEPTION 'VALIDATION:business_type_other:Please specify the business type';
  END IF;

  -- Safe defaults for optional fields (satisfies NOT NULL columns)
  v_business_type        := COALESCE(v_business_type, 'not_provided');
  v_business_description := COALESCE(v_business_description, '');
  v_video_goal           := COALESCE(v_video_goal, 'not_provided');

  -- Resolve display labels (single source of truth)
  v_business_type_label := CASE v_business_type
    WHEN 'restaurant'   THEN 'مطعم'
    WHEN 'clinic'       THEN 'عيادة'
    WHEN 'real_estate'  THEN 'عقارات'
    WHEN 'store'        THEN 'متجر'
    WHEN 'other'        THEN COALESCE(v_business_type_other, 'أخرى')
    WHEN 'not_provided' THEN 'غير محدد'
    ELSE v_business_type
  END;

  v_video_goal_label := CASE v_video_goal
    WHEN 'more_customers'   THEN 'جذب عملاء أكثر'
    WHEN 'more_messages'    THEN 'زيادة الرسائل'
    WHEN 'more_sales'       THEN 'زيادة المبيعات'
    WHEN 'brand_awareness'  THEN 'الوعي بالعلامة التجارية'
    WHEN 'not_provided'     THEN 'غير محدد'
    ELSE v_video_goal
  END;

  v_submission_id  := gen_random_uuid();
  v_request_number := public.generate_request_number();

  INSERT INTO public.project_requests (
    request_number,
    submission_id,
    full_name,
    phone,
    business_name,
    business_type,
    business_type_label,
    business_type_other,
    business_description,
    facebook_url,
    instagram_url,
    website_url,
    video_goal,
    video_goal_label,
    additional_notes,
    payment_status,
    payment_reference,
    payment_package,
    status
  ) VALUES (
    v_request_number,
    v_submission_id,
    v_full_name,
    v_phone,
    v_business_name,
    v_business_type,
    v_business_type_label,
    v_business_type_other,
    v_business_description,
    v_facebook,
    v_instagram,
    v_website,
    v_video_goal,
    v_video_goal_label,
    v_additional_notes,
    v_payment_status,
    v_payment_reference,
    v_payment_package,
    'pending'
  )
  RETURNING project_requests.id INTO v_request_id;

  INSERT INTO public.status_history (request_id, status, note)
  VALUES (v_request_id, 'pending', 'Request submitted');

  RETURN QUERY SELECT v_request_id, v_request_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_project_request(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon, authenticated;
