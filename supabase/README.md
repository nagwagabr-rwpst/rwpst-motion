# Supabase Setup — RWPST Motion Project Requests

## 1. Run the migration

In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**, paste and run:

1. `supabase/migrations/001_project_requests.sql`
2. `supabase/migrations/002_create_project_request_rpc.sql`
3. `supabase/migrations/003_storage_upload_policies.sql`
4. `supabase/migrations/004_relax_rpc_validation.sql`
5. `supabase/migrations/011_trial_order.sql` — required before the `/order` form can save a 199 EGP trial. It adds `create_trial_order` and the extra columns on `project_requests`. Run migrations 005–010 first if they are not already on the project.

This creates:

- `project_requests`, `request_files`, `status_history`, `request_counters`
- `generate_request_number()` → `RWPST-2026-000001`
- `create_project_request(...)` — validated RPC with full field mapping
- `rollback_project_request(uuid)` for failed uploads
- RLS policies (anon insert only)
- Storage bucket `project-assets` with `logos/`, `images/`, `videos/`

## 2. Configure the anon key

Edit **one file only**: `assets/js/supabase-env.js`

```javascript
anonKey: 'your-supabase-anon-key-here',
```

Replace `USE_ENV_PLACEHOLDER` with the anon key from **Project Settings → API**.

Never commit the real key to a public repo. For CI/CD, inject at deploy time.

## 3. Verify

1. `npm start` → open `http://localhost:8080/project-request/`
2. Submit the form
3. Check **Table Editor** → `project_requests`
4. Check **Storage** → `project-assets`
5. Success page shows `RWPST-YYYY-000001`

## Architecture

```
project-request/index.html
  → project-request.js (validation + UI)
  → services/projectRequestService.js (Supabase only)
  → Supabase PostgreSQL + Storage
```

To migrate to Django later: replace `projectRequestService.js` internals with `fetch('/api/project-requests')` while keeping the same `submitProjectRequest()` signature.
