# Automated Daily Scraping & Self-Updating Architecture (Vercel + GitHub Actions + Supabase)

This document provides the complete architecture and deployment guide for the **automated self-updating pipeline** in **GOV-DASH (Policy Radar India)**.

---

## 1. Executive Architecture Summary

Government portals (Startup India, DPIIT, MeitY, BIRAC, DST, state portals) require:
- Rendering JavaScript / SPAs (via Playwright / headless Chromium).
- Bypassing transient network timeouts across 15+ ministerial endpoints.
- Scraping, normalizing, computing diffs (`scheme_versions`), generating LLM summaries via Gemini 2.5 Flash, and upserting into Supabase Postgres (`schemes_clean`).

### Why Vercel Serverless Alone Cannot Run Playwright Scrapers:
1. **Serverless Execution Limits**: Vercel Serverless Functions have a strict 10s–60s execution timeout. Running 15 scrapers across 190+ schemes takes 3–5 minutes.
2. **Binary Bundle Size**: Headless Chromium binaries exceed Vercel's 50MB/250MB deployment size limit.

### The Production Solution (Industry Standard):
We implement a **Dual-Engine Automated Pipeline**:
1. **GitHub Actions Engine (`.github/workflows/daily_pipeline.yml`)**:
   - Runs automatically on an Ubuntu VM runner **every day at 2:00 AM IST** (20:30 UTC).
   - Installs Playwright, launches headless Chromium, runs all scrapers, normalizes sectors and stages, computes hash diffs, writes new versions to Supabase `scheme_versions`, and updates `schemes_clean`.
2. **Vercel Cron Engine (`frontend/vercel.json` & `/api/cron/sync-schemes`)**:
   - Fires automatically **daily at 02:00 UTC (07:30 AM IST)**.
   - Pings the backend pipeline, verifies active scheme count in Supabase, flushes in-memory cache, and logs execution status into `pipeline_runs`.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 DAILY SCHEDULE (CRON)                  │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
┌───────────────────────────────┐                           ┌───────────────────────────────┐
│     GITHUB ACTIONS RUNNER     │                           │          VERCEL CRON          │
│   (Ubuntu VM - Daily 2 AM IST)│                           │  (Serverless - Daily 7:30 IST)│
│ .github/workflows/            │                           │ frontend/vercel.json          │
│  daily_pipeline.yml           │                           │ /api/cron/sync-schemes        │
└───────────────┬───────────────┘                           └───────────────┬───────────────┘
                │ Runs Playwright & Scrapers                                │ Pings Backend
                ▼                                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SUPABASE POSTGRES DB                                      │
│  - schemes_raw (Bronze)   - schemes_clean (Silver: 193 schemes)  - scheme_versions (Gold) │
└───────────────────────────────────────────────────────────────────────────────────────────┘
                                              ▲
                                              │ Live Real-Time Queries
                                ┌─────────────┴─────────────┐
                                │    GOV-DASH FRONTEND      │
                                │   (Vercel Next.js 16)     │
                                └───────────────────────────┘
```

---

## 2. Vercel Cron Configuration (`frontend/vercel.json`)

The cron schedule is defined in `frontend/vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-schemes",
      "schedule": "0 2 * * *"
    }
  ]
}
```

The route handler is implemented at `frontend/src/app/api/cron/sync-schemes/route.ts`:
- Secured via `Authorization: Bearer <CRON_SECRET>` header (automatically injected by Vercel Cron).
- Checks Supabase connectivity and records daily verification in `pipeline_runs`.
- Returns an audit payload with timestamp, scheme count, and status.

---

## 3. GitHub Actions Daily Pipeline (`.github/workflows/daily_pipeline.yml`)

The deep scraper workflow runs automatically without needing any server:
```yaml
name: Daily Pipeline & Scheme Update

on:
  schedule:
    # 20:30 UTC is 02:00 AM IST (Indian Standard Time)
    - cron: '30 20 * * *'
  workflow_dispatch: # Allows manual one-click trigger from GitHub UI

jobs:
  scrape-and-update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          playwright install --with-deps chromium

      - name: Execute Daily Scrapers & Medallion Pipeline
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          python -m pipeline.orchestrator --mode incremental
```

---

## 4. Environment Variables Required for Vercel Deployment

In your Vercel Project Dashboard (`Settings` -> `Environment Variables`), configure:

| Variable Name | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase Project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase admin secret key for backend tasks |
| `NEXT_PUBLIC_API_URL` | Optional | URL of deployed FastAPI backend (e.g. on Render / Railway) |
| `CRON_SECRET` | Optional | Shared bearer secret string to secure Vercel Cron calls |

---

## 5. Verification & Testing

### Test 1: Manual Trigger of Vercel Cron Endpoint
You can test the endpoint locally or on your deployed site:
```bash
curl -X GET "http://localhost:3000/api/cron/sync-schemes"
```
Response:
```json
{
  "success": true,
  "message": "GOV-DASH Daily Automated Pipeline Sync Completed Successfully",
  "timestamp": "2026-11-17T04:00:00.000Z",
  "schedule": "Daily at 02:00 UTC (07:30 AM IST)",
  "total_active_schemes": 193,
  "backend_pipeline": "Supabase Registry Verified",
  "automation_engine": "Vercel Cron + GitHub Actions Workflow"
}
```

### Test 2: Manual Trigger of GitHub Actions Pipeline
1. Go to your GitHub repository -> **Actions** tab.
2. Select **Daily Pipeline & Scheme Update**.
3. Click **Run workflow** -> Select `main` branch -> Click **Run**.
4. The workflow will spin up an Ubuntu runner, execute all scrapers, and update Supabase.

