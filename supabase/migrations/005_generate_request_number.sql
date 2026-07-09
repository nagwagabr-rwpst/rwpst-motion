-- RWPST Motion — Scalable per-service daily request numbering
-- Run after 004_relax_rpc_validation.sql
--
-- Format: RWPST-<SERVICE_CODE>-YYYYMMDD-XXXX
-- Example: RWPST-MOT-20260707-0001

-- ---------------------------------------------------------------------------
-- 1. Migrate request_counters (preserve legacy table for later cleanup)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'request_counters'
      AND column_name = 'year'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'request_counters_legacy'
  ) THEN
    ALTER TABLE public.request_counters RENAME TO request_counters_legacy;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.request_counters (
  service_code TEXT NOT NULL,
  counter_date   DATE NOT NULL,
  last_number    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (service_code, counter_date)
);

ALTER TABLE public.request_counters ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. generate_request_number(p_service_code) — daily counter per service
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.generate_request_number();

CREATE OR REPLACE FUNCTION public.generate_request_number(p_service_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service_code TEXT;
  v_counter_date DATE;
  v_next_num     INTEGER;
BEGIN
  v_service_code := UPPER(TRIM(p_service_code));

  IF v_service_code IS NULL OR v_service_code = '' THEN
    RAISE EXCEPTION 'service_code is required';
  END IF;

  IF v_service_code !~ '^[A-Z0-9]{2,10}$' THEN
    RAISE EXCEPTION 'invalid service_code: %', v_service_code;
  END IF;

  v_counter_date := (timezone('Africa/Cairo', now()))::date;

  INSERT INTO public.request_counters (service_code, counter_date, last_number)
  VALUES (v_service_code, v_counter_date, 1)
  ON CONFLICT (service_code, counter_date) DO UPDATE
    SET last_number = public.request_counters.last_number + 1
  RETURNING last_number INTO v_next_num;

  RETURN 'RWPST-'
    || v_service_code
    || '-'
    || TO_CHAR(v_counter_date, 'YYYYMMDD')
    || '-'
    || LPAD(v_next_num::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_request_number(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. create_project_request — surgical one-line call site update only
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  v_def TEXT;
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO v_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'create_project_request'
    AND pg_get_function_identity_arguments(p.oid) = 'p_full_name text, p_phone text, p_business_name text, p_business_type text, p_business_type_other text, p_business_description text, p_facebook text, p_instagram text, p_website text, p_video_goal text, p_additional_notes text, p_payment_status text, p_payment_reference text, p_payment_package text';

  IF v_def IS NULL THEN
    RAISE EXCEPTION 'create_project_request not found; run 002/004 migrations first';
  END IF;

  IF v_def LIKE '%generate_request_number(''MOT'')%' THEN
    RETURN;
  END IF;

  IF v_def NOT LIKE '%generate_request_number()%' THEN
    RAISE EXCEPTION 'create_project_request call site not recognized; manual review required';
  END IF;

  v_def := replace(v_def, 'public.generate_request_number()', 'public.generate_request_number(''MOT'')');

  EXECUTE v_def;
END;
$$;
