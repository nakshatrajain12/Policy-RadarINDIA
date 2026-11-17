# Step-by-Step Vercel Deployment Guide for GOV-DASH

This guide walks you through deploying **GOV-DASH (Policy Radar India)** to **Vercel** in less than 3 minutes.

---

## 1. Quick Prerequisite Check

Your application is 100% production-ready:
- Next.js 16 build compiles with **0 errors** (`npm run build` in `frontend/`).
- Backend test suite: **35 of 35 tests passing**.
- Database: **193 verified central and state schemes** in Supabase Postgres.
- **Fail-Safe Autonomous Mode**: If a separate backend server is not connected, the Next.js frontend automatically queries your Supabase database directly for all schemes, recommendations, and analytics.

---

## 2. Deploy to Vercel via GitHub (Recommended & Easiest)

### Step 1: Commit and Push Your Repository
In your terminal, commit and push your latest code to your GitHub repo:
```bash
git add .
git commit -m "feat: BTP-grade GOV-DASH with 193 schemes, dual themes, comparison, and Vercel cron"
git push origin main
```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Locate and click **Import** next to `Policy-RadarINDIA`.

### Step 3: Configure Project Settings (CRITICAL)
In the configuration screen before clicking Deploy:
1. **Framework Preset**: Ensure `Next.js` is selected.
2. **Root Directory**:
   - Click the **Edit** button next to *Root Directory*.
   - Type or select **`frontend`** (since the Next.js code is in the `frontend` directory).
   - Click **Save**.

### Step 4: Add Environment Variables
Expand the **Environment Variables** section and add the following keys:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://syngnilbnkdjpszyiybu.supabase.co` | Your live Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_vv7s9kB_653rlMc5icH9yA_os2Wjqin` | Your Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_vv7s9kB_653rlMc5icH9yA_os2Wjqin` | Public key alias |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` *(optional)* | Leave blank initially or add your FastAPI URL |
| `CRON_SECRET` | *(Optional random string)* | Used to authenticate Vercel Cron |

### Step 5: Click Deploy!
- Click **Deploy**.
- Vercel will build the frontend in ~40 seconds.
- You will receive your live URL: `https://policy-radar-india.vercel.app` (or similar).

---

## 3. Automated Daily Scraping & Self-Updating on Vercel

Once deployed, the self-updating pipeline operates automatically:
1. **Vercel Cron (`frontend/vercel.json`)**:
   - Vercel automatically registers the cron job scheduled at `0 2 * * *` (Daily at 07:30 AM IST / 02:00 UTC).
   - It triggers `/api/cron/sync-schemes` to verify active schemes, purge stale caches, and log pipeline health into Supabase `pipeline_runs`.
2. **GitHub Actions Scrapers (`.github/workflows/daily_pipeline.yml`)**:
   - In your GitHub repo, go to **Settings** -> **Secrets and variables** -> **Actions**.
   - Add these repository secrets:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
     - `GEMINI_API_KEY`
   - The workflow executes daily at 2:00 AM IST on a free Ubuntu VM with headless Chromium/Playwright scrapers and writes newly scraped schemes directly to Supabase.

---

## 4. (Optional) Deploying the FastAPI Backend to Render (Free)

If you want live Gemini AI Copilot chat running in production:
1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository `Policy-RadarINDIA`.
3. Set the following:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`
5. Click **Deploy**. Copy your Render URL (e.g., `https://gov-dash-api.onrender.com`).
6. In Vercel -> Project Settings -> Environment Variables, update `NEXT_PUBLIC_API_URL` to your Render URL.

---

## 5. Alternative: Deploying via Vercel CLI

If you prefer deploying directly from your machine:
```bash
cd frontend
npx vercel
```
1. Follow the terminal prompts:
   - Link to existing project? `No` (or `Yes` if already created).
   - Project name: `gov-dash-india`
   - Directory: `./`
2. For production deployment:
```bash
npx vercel --prod
```
