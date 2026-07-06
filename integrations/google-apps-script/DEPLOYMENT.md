# Project Request — Google Sheets + Telegram Deployment

Connect the RWPST MOTION project request form to Google Sheets with sequential request numbers and optional Telegram alerts.

## Architecture

```
Browser (project-request.js)
  → POST JSON → Google Apps Script Web App
      → Google Sheet row (sequential request number)
      → Telegram Bot API (optional)
  ← JSON { requestNumber, submittedAt }
  → sessionStorage + localStorage fallback
  → success page shows request number
```

## Step 1 — Create the spreadsheet

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet (e.g. **RWPST Project Requests**).
2. Open **Extensions → Apps Script**.
3. Delete any default code and paste the contents of `integrations/google-apps-script/Code.gs`.
4. Save the project (e.g. name it **RWPST Project Request Webhook**).

## Step 2 — Initialize column headers

1. In Apps Script, select the function **`setupSheet`** from the dropdown.
2. Click **Run** and authorize the script when prompted.
3. Return to the spreadsheet — you should see a **Project Requests** tab with headers.

## Step 3 — Script properties (Telegram + security)

In Apps Script: **Project Settings** (gear) → **Script properties** → **Add script property**:

| Property | Value | Required |
|----------|-------|----------|
| `WEBHOOK_SECRET` | A long random string (e.g. `openssl rand -hex 32`) | Recommended |
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) | Optional |
| `TELEGRAM_CHAT_ID` | Your chat or group ID | Optional |

**Telegram setup**

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. Start a chat with your bot (or add it to a group).
3. Get your chat ID via [@userinfobot](https://t.me/userinfobot) or by calling  
   `https://api.telegram.org/bot<TOKEN>/getUpdates` after sending the bot a message.

## Step 4 — Deploy the Web App

1. Apps Script → **Deploy → New deployment**.
2. Type: **Web app**.
3. **Execute as:** Me.
4. **Who has access:** Anyone.
5. Click **Deploy** and copy the **Web app URL** (ends with `/exec`).

## Step 5 — Configure the website

Edit `assets/js/project-request-config.js`:

```javascript
const GOOGLE_SHEETS = {
  enabled: true,
  webhookUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  sheetName: 'Project Requests',
  secret: 'YOUR_WEBHOOK_SECRET', // must match Script Property WEBHOOK_SECRET
};
```

Commit and deploy the site to GitHub Pages (or test locally with `npm start` from `deployment/`).

> **Note:** `fetch` to Google Apps Script requires an HTTP server (`localhost` or `https://`). Opening `file:///` may block cross-origin requests.

## Step 6 — Test

1. Open `http://localhost:8080/project-request/`.
2. Fill and submit the form.
3. Confirm:
   - A new row appears in the spreadsheet with **Request Number** `RWPST-YYYY-0001`, etc.
   - The success page shows **رقم الطلب: RWPST-YYYY-0001**.
   - Telegram receives a notification (if configured).
   - `localStorage` key `rwpst_project_requests` still contains the submission.

## Request number format

Sequential counter stored in Apps Script properties:

```
RWPST-2026-0001
RWPST-2026-0002
...
```

Counter resets only if you delete the `LAST_REQUEST_NUMBER` script property.

## Sheet columns

| Column | Source field |
|--------|----------------|
| Request Number | Generated server-side |
| Submission ID | Client UUID |
| Submitted At | ISO timestamp |
| Full Name | `fullName` |
| Phone | `phone` |
| Business Name | `businessName` |
| Business Type | Arabic label |
| Business Type Other | When type = other |
| Business Description | `businessDescription` |
| Facebook / Instagram / Website | Social URLs |
| Video Goal | Arabic label |
| Video Goal Key | Raw value (`more_customers`, etc.) |
| Additional Notes | `additionalNotes` |
| Payment Status / Reference / Package | Payment placeholders |
| Logo File | Filename |
| Image Files | Comma-separated filenames |
| Video Files | Comma-separated filenames |
| Image Count / Video Count | File counts |

Uploaded file **blobs** remain in the browser IndexedDB only. Only filenames are sent to Sheets.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Unauthorized` | Match `secret` in config with `WEBHOOK_SECRET` script property |
| CORS / network error | Serve over `http://localhost` or HTTPS, not `file://` |
| No Telegram message | Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`; send `/start` to the bot first |
| Duplicate rows on retry | Each submit increments the counter; avoid double-clicking submit |
| Sheet not updating | Redeploy Web App after code changes (**Deploy → Manage deployments → Edit → New version**) |

## Updating the script

After editing `Code.gs`:

1. Save in Apps Script.
2. **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**.
3. The Web App URL stays the same; no website config change needed.
