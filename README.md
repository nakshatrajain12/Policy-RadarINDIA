<div align="center">

# 🏛️ Policy Radar India (Gov-Dash)

A high-performance startup scheme discovery and personalized roadmap platform for Indian innovators. Aggregates verified central and state funding programs, provides deterministic eligibility scoring, calculates milestone-based capital unlocking, and sequences step-by-step action roadmaps.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge)](https://recharts.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Python 3.10+](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)

</div>

---

## 💡 Key Platform Capabilities

- **Unified Scheme Registry**: Aggregates 190+ central and state schemes (Startup India, DPIIT, BIRAC, MeitY, DST, SIDBI, Karnataka ELEVATE, Maharashtra, Gujarat, etc.) into one searchable registry.
- **Deterministic Recommendation Engine**: Evaluates venture fit through multi-factor validation across sector taxonomy, startup maturity stage, geographic eligibility, and legal entity requirements.
- **Strategic Policy Unlock Simulator**: Calculates latent public capital locked behind 1 or 2 missing administrative milestones (such as DPIIT Recognition, Private Limited Incorporation, or Patent filing), providing financial ROI, estimated turnaround times, and direct single-window portal links.
- **3-Phase Execution Roadmap**: Synthesizes verified programs into actionable phases:
  - *Phase 1 (NOW)*: Essential accreditations (DPIIT, Udyam) and rapid prototype micro-grants.
  - *Phase 2 (NEXT)*: POC grants, seed incubator rounds, and commercial trial funding.
  - *Phase 3 (LATER)*: Scale-up debt guarantees (CGSS), consolidated incubation networks, and 80-IAC tax holiday filing.
- **Resilient Offline Architecture**: Parallel data loading via `useAppData` hook with AbortController, 8-second timeout, one automatic retry, and bundled zero-latency fallbacks when remote APIs are unreachable.
- **Power BI Product UI & Accessibility**:
  - One neutral ground with 1px borders, single blue accent, semantic status tokens (`ok`, `unlock`, `warn`, `danger`).
  - Dual themes (Light and Dark) defaulting to system preference with local storage persistence.
  - WCAG AA contrast compliance (minimum 4.5:1 for body text, 3:1 for large text).
  - 44px minimum touch targets on all interactive buttons and navigation controls.
  - Zero glass, glow, or decorative blur effects.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    classDef bronze fill:#cd7f32,stroke:#333,stroke-width:2px,color:#fff;
    classDef silver fill:#64748b,stroke:#333,stroke-width:2px,color:#fff;
    classDef gold fill:#0d9488,stroke:#333,stroke-width:2px,color:#fff;
    classDef client fill:#1d4ed8,stroke:#1e40af,stroke-width:2px,color:#fff;

    subgraph "Ingestion & Scraping (Bronze Layer)"
        S1(Startup India / NSWS)
        S2(BIRAC & MeitY)
        S3(State Innovation Portals)
        Runner[Bronze Scraper Runner]
        RawDB[(Supabase: schemes_raw)] ::: bronze
        S1 & S2 & S3 --> Runner --> RawDB
    end

    subgraph "Processing & Validation (Silver Layer)"
        CleanETL[Silver Cleansing Pipeline]
        Pydantic[Pydantic Schema Validation]
        CleanDB[(Supabase: schemes_clean)] ::: silver
        RawDB --> CleanETL --> Pydantic --> CleanDB
    end

    subgraph "Analytics & Serving (Gold Layer)"
        Engine[Recommender & Analytics Engine]
        API[FastAPI Backend - main.py] ::: gold
        CleanDB --> Engine --> API
    end

    subgraph "Frontend Client (Next.js 16 + Tailwind v4)"
        Hook[useAppData Hook - Parallel Fetch]
        UI[Power BI UI Primitives & Views] ::: client
        API -->|/recommend, /analytics/bundle| Hook --> UI
        SeedData[(Bundled Zero-Latency Fallback)] -.->|Offline Mode| Hook
    end
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17+ or v20+
- **Python**: v3.10+
- **npm**: Note that `--legacy-peer-deps` is required for npm operations due to React 19 dependencies.

### 1. Backend Setup (FastAPI)

```bash
# Clone the repository
git clone https://github.com/your-username/Policy-RadarINDIA.git
cd Policy-RadarINDIA

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main.py --reload --port 8000
```

The API will be available at `http://localhost:8000` (docs at `http://localhost:8000/docs`).

### 2. Frontend Setup (Next.js 16)

```bash
cd frontend

# Install frontend dependencies (legacy-peer-deps required)
npm install --legacy-peer-deps

# Configure environment variables
cp .env.example .env.local

# Run development server with Turbopack
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ⚙️ Environment Configuration

Create a `.env.local` file inside `frontend/` based on `.env.example`:

```env
# URL of the running FastAPI backend (leave empty for offline bundled mode)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Credentials (optional for guest mode, required for cloud step persistence & auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🧪 Testing & Verification

```bash
cd frontend

# Run ESLint validation
npm run lint

# Run Next.js production build
npm run build

# Run unit tests
npm test

# Run Playwright smoke & accessibility suite
npx playwright test
```

---

## 📄 Database Migrations

Database setup scripts are located in `migrations/`:
- `001_initial_schema.sql`: Base tables (`schemes_raw`, `schemes_clean`).
- `004_auth_schema.sql`: Startup founder profiles.
- `005_schema_v2.sql`: Observability, source audits, and analytics snapshots.
- `006_user_roadmap_steps.sql`: User milestone status persistence with Row Level Security.
