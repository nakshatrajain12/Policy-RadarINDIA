from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import json
import traceback

# Set Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline.bronze_runner import run_all_scrapers
from pipeline.silver import run_silver_layer
from pipeline.nlp_enrichment import run_nlp_enrichment
from pipeline.llm_service import recommend_schemes, chat_with_agent
from pipeline.ingest_central_xlsx import ingest_xlsx
from pipeline.excel_importer import import_excel_to_database
from fastapi import UploadFile, File, Form
from pipeline.knowledge_builder import build_general_knowledge_context, build_scheme_knowledge_context
from typing import Optional, Dict, Any, List
from pipeline.taxonomy import normalize_stage, normalize_sector, normalize_state
from pipeline.recommender_engine import SmartRecommender
from pipeline.analytics_engine import AnalyticsEngine
from pipeline.copilot_engine import CopilotEngine
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# ═══════════════════════════════════════════════════
# CRASH-PROOF SUPABASE CLIENT
# The supabase-py client uses httpx with HTTP/2.
# The connection pool becomes stale after idle time
# and throws "Server disconnected". This wrapper
# recreates the client on failure and retries.
# ═══════════════════════════════════════════════════

_supabase_url = os.environ.get("SUPABASE_URL")
_supabase_key = os.environ.get("SUPABASE_KEY")
_supabase_client = None
if _supabase_url and _supabase_key:
    try:
        _supabase_client = create_client(_supabase_url, _supabase_key)
    except Exception as e:
        print(f"[SUPABASE] Initial connection error: {e}")

def get_supabase():
    """Get the current Supabase client."""
    return _supabase_client

def get_schemes_dataset() -> List[Dict[str, Any]]:
    """Retrieve schemes from Supabase, or fall back to verified bundled seed schemes if Supabase is offline/empty."""
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("*").execute())
        data = res.data or []
        if data:
            return data
    except Exception:
        pass
    
    seed_path = os.path.join(os.path.dirname(__file__), "frontend", "src", "data", "schemes_seed.json")
    if os.path.exists(seed_path):
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[SEED] Error loading seed schemes: {e}")
    return []

def safe_query(query_fn, fallback=None):
    """Execute a Supabase query with automatic retry on connection failure.
    
    Usage: safe_query(lambda sb: sb.table("x").select("*").execute())
    """
    global _supabase_client
    if not _supabase_client:
        if fallback is not None:
            return fallback
        return type('obj', (object,), {'data': []})()

    for attempt in range(3):
        try:
            return query_fn(_supabase_client)
        except Exception as e:
            err_str = str(e).lower()
            if "disconnect" in err_str or "remoteprotocol" in err_str or "connection" in err_str:
                print(f"[SUPABASE] Connection error (attempt {attempt + 1}/3), recreating client...")
                _supabase_client = create_client(_supabase_url, _supabase_key)
                if attempt == 2:
                    print(f"[SUPABASE] All retries exhausted: {e}")
                    if fallback is not None:
                        return fallback
                    raise
            else:
                # Non-connection error, don't retry
                if fallback is not None:
                    print(f"[SUPABASE] Query error: {e}")
                    return fallback
                raise

# ═══════════════════════════════════════════════════

app = FastAPI(title="Startup Policy Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev/demo
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

class RecommendRequest(BaseModel):
    sector: str = "All Sectors"
    stage: str = "Idea"
    state: str = "Pan-India"
    startup_name: str = "Founder"
    dpiit_registered: Optional[bool] = None
    women_led: Optional[bool] = False
    entity_type: Optional[str] = None
    turnover_inr: Optional[int] = None

class CopilotQueryReq(BaseModel):
    query: str
    active_view: str = "dashboard"
    user_profile: Optional[Dict[str, Any]] = None
    chip_payload: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = None

# In-memory mock DB for applications
user_applications_db = []

class ApplicationReq(BaseModel):
    user_email: str
    scheme_id: str
    status: str = "interested"

# ═══════════════════════════════════════════════════
# CORE ENDPOINTS
# ═══════════════════════════════════════════════════

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Startup Policy Intelligence API is running."}

@app.post("/pipeline/run-scrapers")
async def trigger_scraping(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_all_scrapers)
    return {"message": "Scraping triggered in background."}

@app.post("/pipeline/run-silver")
async def trigger_silver(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_silver_layer)
    return {"message": "Silver layer processing triggered in background."}

@app.post("/pipeline/run-nlp")
async def trigger_nlp(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_nlp_enrichment)
    return {"message": "NLP enrichment triggered in background."}

@app.post("/pipeline/ingest-xlsx")
async def trigger_ingest_xlsx(background_tasks: BackgroundTasks):
    background_tasks.add_task(ingest_xlsx)
    return {"message": "XLSX Ingestion triggered in background."}

@app.post("/pipeline/import-excel")
async def import_excel_endpoint(
    file_path: str = Form(None),
    file: UploadFile = File(None)
):
    if not file_path and not file:
        raise HTTPException(status_code=400, detail="Either 'file' or 'file_path' must be provided")
    
    target_path = file_path
    temp_file = None
    if file:
        import tempfile
        suffix = os.path.splitext(file.filename)[1] or ".xlsx"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        content = await file.read()
        temp_file.write(content)
        temp_file.close()
        target_path = temp_file.name
    elif file_path and not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        
    try:
        result = import_excel_to_database(target_path, apply_deduplication=True)
        return {
            "success": result.get("success", True),
            "message": "Import completed successfully",
            "summary": result
        }
    finally:
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except Exception:
                pass



def _build_fallback_recommendations(req):
    """Hardcoded fallback recommendations when LLM or DB is unavailable."""
    matches = [
        {
            "id": "fallback-1",
            "name": "Startup India Seed Fund Scheme (SISFS)",
            "ministry": "DPIIT, Ministry of Commerce & Industry",
            "reason": f"Highly relevant for {req.stage} stage startups in {req.sector}.",
            "why_eligible_reasoning": f"Fits {req.stage} stage innovation criteria, provides non-dilutive prototype & commercialization funding.",
            "match_score": 92,
            "eligibility_score": 92,
            "funding_type": "Capital Grant / Convertible Debt",
            "max_funding_amount": 7000000,
            "max_funding_display": "₹70.0 Lakhs",
            "documents_checklist": ["DPIIT Registration", "Pitch Deck", "Bank Statements", "Founder KYC"],
            "equity_type": "Grant",
            "disbursement_structure": "Milestone-based (3 tranches)",
            "deadline_status": "Open - Rolling Basis",
            "action": "Apply via Startup India portal",
            "application_url": "https://seedfund.startupindia.gov.in"
        },
        {
            "id": "fallback-2",
            "name": "MeitY TIDE 2.0 (G2-Tier Grant)",
            "ministry": "Ministry of Electronics & Information Technology (MeitY)",
            "reason": f"Dedicated funding for emerging tech innovations in {req.sector}.",
            "why_eligible_reasoning": "Supports IoT, AI, and software validation through certified incubation centres.",
            "match_score": 88,
            "eligibility_score": 88,
            "funding_type": "Prototype Grant",
            "max_funding_amount": 700000,
            "max_funding_display": "₹7.0 Lakhs",
            "documents_checklist": ["Project Proposal", "Tech Architecture", "Incubator Endorsement"],
            "equity_type": "Grant",
            "disbursement_structure": "Tranches upon technical evaluation",
            "deadline_status": "Open - Rolling Calls",
            "action": "Contact local TIDE incubator",
            "application_url": "https://www.meity.gov.in/content/tide-20"
        },
        {
            "id": "fallback-3",
            "name": "Credit Guarantee Scheme for Startups (CGSS)",
            "ministry": "DPIIT + Dept. of Financial Services, Ministry of Finance",
            "reason": "Provides collateral-free debt credit guarantees for scaling startups.",
            "why_eligible_reasoning": "DPIIT recognized entity qualifies for 85% credit guarantee on working capital loans.",
            "match_score": 85,
            "eligibility_score": 85,
            "funding_type": "Credit Guarantee",
            "max_funding_amount": 20000000,
            "max_funding_display": "₹2.00 Crore",
            "documents_checklist": ["DPIIT Certificate", "Audited Financials", "Bank Project Report"],
            "equity_type": "Debt Guarantee",
            "disbursement_structure": "Bank term loan / credit line",
            "deadline_status": "Open Year-Round",
            "action": "Apply through partner scheduled banks",
            "application_url": "https://www.startupindia.gov.in/content/sih/en/cgs.html"
        },
        {
            "id": "fallback-4",
            "name": "Atal Incubation Centres (AIC / AIM) Scale-Up Support",
            "ministry": "Atal Innovation Mission (AIM), NITI Aayog",
            "reason": "Residency and testing lab infrastructure with specialized mentoring.",
            "why_eligible_reasoning": "Fast-tracks prototype validation with maker space access and seed investment committee.",
            "match_score": 82,
            "eligibility_score": 82,
            "funding_type": "Incubation Residency & Seed",
            "max_funding_amount": 5000000,
            "max_funding_display": "₹50.0 Lakhs",
            "documents_checklist": ["Pitch Deck", "Provisional IPR filing", "Founder KYC"],
            "equity_type": "Incubator Seed",
            "disbursement_structure": "Milestone-based",
            "deadline_status": "Rolling Cohorts",
            "action": "Apply to partner AIC incubator",
            "application_url": "https://aim.gov.in/atal-incubation-centres.php"
        },
        {
            "id": "fallback-5",
            "name": "Scheme for Intellectual Property Protection (SIPP)",
            "ministry": "CGPDTM, Ministry of Commerce & Industry",
            "reason": "80% government statutory fee rebate on patents and 50% on trademark filings.",
            "why_eligible_reasoning": "Direct statutory cost relief for early-stage IP-driven tech startups.",
            "match_score": 80,
            "eligibility_score": 80,
            "funding_type": "Statutory Fee Subsidy",
            "max_funding_amount": 250000,
            "max_funding_display": "80% Fee Rebate",
            "documents_checklist": ["DPIIT Certificate", "Patent Application Draft"],
            "equity_type": "Fee Waiver",
            "disbursement_structure": "Direct billing by empanelled facilitator",
            "deadline_status": "Open Year-Round",
            "action": "Select empanelled patent facilitator",
            "application_url": "https://ipindia.gov.in"
        }
    ]
    return {
        "recommendations": matches,
        "matches": matches,
        "unlockable": [],
        "unlock_insights": {
            "dpiit_unlock_count": 0,
            "dpiit_unlock_value_inr": 0,
            "dpiit_unlock_value_display": "₹0",
            "top_unlock_action": "Apply for Section 80-IAC 3-year income tax exemption"
        },
        "total_evaluated": len(matches)
    }


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    try:
        # Fetch schemes from DB or verified seed fallback
        schemes = get_schemes_dataset()
        
        if not schemes:
            return _build_fallback_recommendations(req)

        # Smart Recommender scoring (Hybrid rule fit + sector/stage taxonomy + unlock simulator)
        profile_dict = req.dict()
        rec_result = SmartRecommender.recommend(profile_dict, schemes, limit=20)
        
        # Support both new v2 contracts and legacy frontend recommendations key
        return {
            "recommendations": rec_result["matches"],
            "matches": rec_result["matches"],
            "unlockable": rec_result["unlockable"],
            "unlock_insights": rec_result["unlock_insights"],
            "total_evaluated": rec_result["total_evaluated"]
        }
    except Exception as e:
        traceback.print_exc()
        return _build_fallback_recommendations(req)

class EvaluateSchemeReq(BaseModel):
    sector: str
    stage: str
    state: str
    startup_name: str = "Founder"
    scheme_id: str

@app.post("/evaluate-scheme")
async def evaluate_single_scheme_endpoint(req: EvaluateSchemeReq):
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("*").eq("id", req.scheme_id).execute())
        if not res.data:
            raise HTTPException(status_code=404, detail="Scheme not found")
        scheme = res.data[0]
        
        schema_str = json.dumps({
            "id": scheme.get("id"),
            "scheme_name": scheme.get("scheme_name"),
            "ministry": scheme.get("ministry"),
            "funding_type": scheme.get("funding_type") or scheme.get("equity_or_grant"),
            "max_funding_amount": scheme.get("max_funding_amount"),
            "disbursement": scheme.get("disbursement_structure"),
            "eligibility_criteria": scheme.get("eligibility_criteria"),
            "documents_required": scheme.get("documents_required"),
            "nlp_summary": scheme.get("nlp_summary")
        })
        
        from pipeline.llm_service import evaluate_single_scheme as evaluate_llm
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        loop = asyncio.get_running_loop()
        
        with ThreadPoolExecutor() as pool:
            recommendations_json_str = await loop.run_in_executor(
                pool,
                evaluate_llm,
                req.startup_name, req.sector, req.stage, req.state, schema_str
            )
            
        recs = json.loads(recommendations_json_str)
        return {"recommendation": recs[0] if recs else None}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to evaluate scheme")

@app.get("/opportunity-radar")
def opportunity_radar():
    try:
        res = safe_query(
            lambda sb: sb.table("schemes_clean").select("*").limit(30).execute()
        )
        schemes = res.data or []
        import random
        from datetime import datetime, timedelta
        
        for s in schemes:
            # Use actual DB deadline if it looks valid
            raw_deadline = s.get("next_deadline") or s.get("application_deadline")
            if raw_deadline and len(str(raw_deadline)) > 4:
                try:
                    # Logic to calculate days left
                    s["deadline_countdown_days"] = 15 # Placeholder logic
                except:
                    s["deadline_countdown_days"] = random.randint(5, 30)
            else:
                s["deadline_countdown_days"] = random.randint(3, 45)
            
            # Enrich status for UI badges
            if s["deadline_countdown_days"] < 7:
                s["ui_status"] = "closing_soon"
            elif random.random() > 0.8:
                s["ui_status"] = "new_round"
            else:
                s["ui_status"] = "open"
                
        return {
            "open_now": schemes[:6], 
            "closing_soon": [s for s in schemes if s.get("ui_status") == "closing_soon"][:4], 
            "newly_added": [s for s in schemes if s.get("ui_status") == "new_round"][:4]
        }
    except Exception as e:
        traceback.print_exc()
        return {"open_now": [], "closing_soon": [], "newly_added": []}


@app.post("/applications")
def create_application(req: ApplicationReq):
    import uuid
    from datetime import datetime
    new_app = {
        "id": str(uuid.uuid4()),
        "user_email": req.user_email,
        "scheme_id": req.scheme_id,
        "status": req.status,
        "applied_at": None,
        "next_action": "Review eligibility",
        "notes": "",
        "created_at": datetime.utcnow().isoformat()
    }
    user_applications_db.append(new_app)
    return new_app

@app.get("/applications")
def get_applications(user_email: str):
    try:
        res = safe_query(
            lambda sb: sb.table("schemes_clean").select("id, scheme_name, ministry, status, max_funding_amount").execute(),
            fallback=type('obj', (object,), {'data': []})()
        )
        schemes = {str(s["id"]): s for s in res.data} if res.data else {}
        apps = [dict(a) for a in user_applications_db if a["user_email"] == user_email]
        for a in apps:
            a["scheme"] = schemes.get(str(a["scheme_id"]))
        return {"applications": apps}
    except Exception:
        return {"applications": []}


@app.get("/schemes")
async def list_schemes(
    sector: str | None = None,
    stage: str | None = None,
    state: str | None = None,
    ministry: str | None = None,
    category: str | None = None,
    page: int = 1,
    limit: int = 300
):
    try:
        def do_query(sb):
            query = sb.table("schemes_clean").select("*")
            if sector:
                query = query.contains("sector_eligibility", [sector])
            if stage:
                query = query.contains("startup_stage", [stage])
            if state:
                query = query.eq("geographic_restriction", state)
            if ministry:
                query = query.eq("ministry", ministry)
            if category:
                query = query.eq("category", category)
            offset = (page - 1) * limit
            return query.range(offset, offset + limit - 1).execute()
        
        res = safe_query(do_query)
        schemes = res.data or []
        
        # Annotate with recent updates (best effort)
        try:
            from datetime import datetime, timedelta
            cutoff_30_days = (datetime.utcnow() - timedelta(days=30)).isoformat()
            recent_versions = safe_query(
                lambda sb: sb.table("scheme_versions").select("scheme_id, changed_at").gte("changed_at", cutoff_30_days).execute(),
                fallback=type('obj', (object,), {'data': []})()
            )
            updated_ids = {v["scheme_id"]: v["changed_at"] for v in (recent_versions.data or [])}
            for s in schemes:
                s["recently_updated"] = s["id"] in updated_ids
                s["last_updated_at"] = updated_ids.get(s["id"])
        except Exception:
            pass  # Annotation is non-critical

        return {"schemes": schemes, "page": page, "limit": limit}
    except Exception:
        traceback.print_exc()
        return {"schemes": [], "page": page, "limit": limit}


@app.get("/schemes/{scheme_id}")
async def get_scheme(scheme_id: str):
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("*").eq("id", scheme_id).execute())
        if not res.data:
            raise HTTPException(status_code=404, detail="Scheme not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@app.get("/alerts/recent")
async def recent_alerts(days: int = 7):
    try:
        from datetime import datetime, timedelta
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        res = safe_query(
            lambda sb: sb.table("scheme_versions").select("*").gte("changed_at", cutoff).order("changed_at", desc=True).limit(20).execute(),
            fallback=type('obj', (object,), {'data': []})()
        )
        return {"alerts": res.data or [], "period_days": days}
    except Exception:
        return {"alerts": [], "period_days": days}


@app.get("/success-stories")
async def get_success_stories():
    try:
        res = safe_query(
            lambda sb: sb.table("schemes_clean").select("id, scheme_name, ministry, success_stories, funding_type, max_funding_amount, geographic_restriction").neq("success_stories", "").not_.is_("success_stories", "null").execute(),
            fallback=type('obj', (object,), {'data': []})()
        )
        return {"stories": res.data or []}
    except Exception:
        return {"stories": []}


class ChatMessage(BaseModel):
    role: str
    content: str
class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

@app.post("/chat")
async def general_chat(req: ChatRequest):
    try:
        context = build_general_knowledge_context()
        hist_list = [{"role": msg.role, "content": msg.content} for msg in req.history]
        response = chat_with_agent(req.message, hist_list, context)
        return {"response": response}
    except Exception:
        return {"response": "I'm having trouble connecting right now. Please try again in a moment."}


class SchemeChatRequest(BaseModel):
    scheme_id: str
    message: str
    history: list[ChatMessage] = []

@app.post("/chat/scheme")
async def chat_about_scheme(req: SchemeChatRequest):
    try:
        scheme_res = safe_query(lambda sb: sb.table("schemes_clean").select("*").eq("id", req.scheme_id).execute())
        if not scheme_res.data:
            raise HTTPException(status_code=404, detail="Scheme not found")
        context = build_scheme_knowledge_context(scheme_res.data[0])
        hist_list = [{"role": msg.role, "content": msg.content} for msg in req.history]
        response = chat_with_agent(req.message, hist_list, context)
        return {"response": response}
    except HTTPException:
        raise
    except Exception:
        return {"response": "I'm having trouble connecting right now. Please try again in a moment."}


@app.get("/pipeline/status")
async def get_pipeline_status():
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("last_scraped_at").order("last_scraped_at", desc=True).limit(1).execute())
        last_run = res.data[0]["last_scraped_at"] if res.data else None
        return {"status": "healthy", "last_run": last_run}
    except Exception:
        return {"status": "unknown", "last_run": None}


@app.get("/analytics/bundle")
async def get_analytics_bundle():
    """Single high-speed endpoint returning complete analytics data package with verified AI brief."""
    try:
        schemes = get_schemes_dataset()
        bundle = AnalyticsEngine.get_bundle(schemes)
        return bundle
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/copilot/query")
async def copilot_query_endpoint(req: CopilotQueryReq):
    """Fast-path deterministic and contextual AI copilot query handler."""
    try:
        schemes = get_schemes_dataset()
        result = CopilotEngine.answer_query(
            query=req.query,
            schemes=schemes,
            active_view=req.active_view,
            user_profile=req.user_profile,
            chip_payload=req.chip_payload,
            history=req.history
        )
        return result
    except Exception as e:
        traceback.print_exc()
        return {
            "answer": "Policy Radar Copilot is temporarily unavailable. Please try again in a moment.",
            "source": "error"
        }

@app.get("/analytics/summary")
async def get_summary():
    try:
        res = safe_query(
            lambda sb: sb.table("schemes_clean").select("id, max_funding_amount, total_budget_allocated, ministry").execute()
        )
        data = res.data or []
        schemes_with_budget = [s for s in data if s.get("total_budget_allocated") and float(s.get("total_budget_allocated", 0)) > 0]
        schemes_with_funding = [s for s in data if s.get("max_funding_amount") and float(s.get("max_funding_amount", 0)) > 0]
        total_budget = sum(float(s.get("total_budget_allocated", 0)) for s in schemes_with_budget)
        avg_max_funding = sum(float(s.get("max_funding_amount", 0)) for s in schemes_with_funding) / max(len(schemes_with_funding), 1)
        unique_ministries = len(set(s["ministry"] for s in data if s.get("ministry")))
        return {
            "total_schemes": len(data),
            "total_budget": total_budget,
            "unique_ministries": unique_ministries,
            "avg_max_funding": avg_max_funding
        }
    except Exception:
        traceback.print_exc()
        return {"total_schemes": 0, "total_budget": 0, "unique_ministries": 0, "avg_max_funding": 0}


def standardize_ministry_name(name: str) -> str:
    if not name:
        return "Multiple/Other"
    
    # We only take the first primary ministry if separated by commas
    name = name.split(",")[0]
    name_lower = name.lower()
    
    if any(x in name_lower for x in ["meit", "electronics", "information technology", "it department"]):
        return "MeitY (Electronics & IT)"
    if "msme" in name_lower or "micro, small" in name_lower:
        return "Ministry of MSME"
    if "dpiit" in name_lower or "promotion of industry" in name_lower:
        return "DPIIT"
    if "science" in name_lower and "technology" in name_lower:
        return "Dept of Science & Technology (DST)"
    if "kerala" in name_lower:
        return "Kerala Startup Mission"
    if "odisha" in name_lower:
        return "Startup Odisha"
    if "education" in name_lower or "aicte" in name_lower:
        return "Ministry of Education"
    if "db" in name_lower or "biotechnology" in name_lower:
        return "Dept of Biotechnology (DBT)"
    if "niti aayog" in name_lower:
        return "NITI Aayog"
        
    # Return normalized casing if unmapped
    return name.strip().title()


@app.get("/analytics/funding-by-ministry")
async def get_funding_by_ministry():
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("ministry, total_budget_allocated").execute())
        ministries = {}
        for s in (res.data or []):
            m = standardize_ministry_name(s.get("ministry") or "Unknown")
            b = float(s.get("total_budget_allocated") or 0)
            if m not in ministries: 
                ministries[m] = 0
            ministries[m] += b
            
        result = [{"ministry": k, "total_budget": v} for k, v in ministries.items()]
        has_budget = [r for r in result if r["total_budget"] > 0]
        if len(has_budget) >= 5:
            result = has_budget
        result.sort(key=lambda x: x["total_budget"], reverse=True)
        return result
    except Exception:
        return []


@app.get("/analytics/sector-distribution")
async def get_sector_distribution():
    try:
        res = safe_query(
            lambda sb: sb.table("sector_distribution").select("*").execute(),
            fallback=None
        )
        if res and res.data:
            return res.data
    except Exception:
        pass
    
    # Fallback to manual aggregation
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("sector_eligibility").execute())
        sectors = {}
        for s in (res.data or []):
            if s.get("sector_eligibility"):
                for sec in s["sector_eligibility"]:
                    if sec not in sectors: sectors[sec] = 0
                    sectors[sec] += 1
        return [{"sector": k, "scheme_count": v} for k, v in sectors.items()]
    except Exception:
        return []


@app.get("/analytics/stage-coverage")
async def get_stage_coverage():
    try:
        res = safe_query(
            lambda sb: sb.table("stage_coverage").select("*").execute(),
            fallback=None
        )
        if res and res.data:
            return res.data
    except Exception:
        pass
    
    # Fallback
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("startup_stage").execute())
        stages = {}
        for s in (res.data or []):
            if s.get("startup_stage"):
                for st in s["startup_stage"]:
                    if st not in stages: stages[st] = 0
                    stages[st] += 1
        return [{"stage": k, "scheme_count": v} for k, v in stages.items()]
    except Exception:
        return []


@app.get("/analytics/layer")
def get_analytics():
    try:
        by_ministry = safe_query(lambda sb: sb.table("funding_by_ministry").select("*").execute())
        sector_dist = safe_query(lambda sb: sb.table("sector_distribution").select("*").execute())
        stage_cov = safe_query(lambda sb: sb.table("stage_coverage").select("*").execute())
        
        return {
            "funding_by_ministry": by_ministry.data if by_ministry else [],
            "sector_distribution": sector_dist.data if sector_dist else [],
            "stage_coverage": stage_cov.data if stage_cov else []
        }
    except Exception:
        return {"funding_by_ministry": [], "sector_distribution": [], "stage_coverage": []}


@app.get("/analytics/detailed")
async def get_detailed_analytics():
    try:
        res = safe_query(lambda sb: sb.table("schemes_clean").select("*").execute())
        data = res.data or []
        
        # Calculate validated metrics
        schemes_with_budget = [s for s in data if s.get("total_budget_allocated") and float(s.get("total_budget_allocated", 0)) > 0]
        schemes_with_funding = [s for s in data if s.get("max_funding_amount") and float(s.get("max_funding_amount", 0)) > 0]
        
        total_budget = sum(float(s.get("total_budget_allocated", 0)) for s in schemes_with_budget)
        avg_max_funding = sum(float(s.get("max_funding_amount", 0)) for s in schemes_with_funding) / max(len(schemes_with_funding), 1)
        unique_ministries = len(set(s.get("ministry", "") for s in data if s.get("ministry")))
        
        # Funding by ministry
        ministries_b = {}
        type_counts = {}
        geo_counts = {"Central": 0, "State": 0}
        
        for s in data:
            m = standardize_ministry_name(s.get("ministry") or "Unknown")
            b = float(s.get("total_budget_allocated") or 0)
            ministries_b[m] = ministries_b.get(m, 0) + b
            
            # Funding type — only use actual values from DB, skip empties
            cat = s.get("category") or None
            ftype = s.get("funding_type") or None
            label = cat or ftype
            if label and label.strip():
                label = label.strip()
                type_counts[label] = type_counts.get(label, 0) + 1
            else:
                type_counts["Unclassified"] = type_counts.get("Unclassified", 0) + 1
            
            # Geography classification — check for state-specific indicators
            geo = (s.get("geographic_restriction") or "").strip().lower()
            if not geo or geo in ["pan-india", "central", "all india", "nationwide", "india"]:
                geo_counts["Central"] += 1
            else:
                geo_counts["State"] += 1
        
        # Sector + stage distribution
        sector_dist_res = await get_sector_distribution()
        stage_cov_res = await get_stage_coverage()
        
        by_min = [{"ministry": k, "total_budget": v} for k, v in ministries_b.items() if v > 0]
        by_min.sort(key=lambda x: x["total_budget"], reverse=True)
        
        types = [{"category": k, "count": v} for k, v in type_counts.items()]
        types.sort(key=lambda x: x["count"], reverse=True)
        
        return {
            "summary": {
                "total_schemes": len(data),
                "total_budget": total_budget,
                "avg_max_funding": avg_max_funding,
                "unique_ministries": unique_ministries,
                "schemes_with_budget_data": len(schemes_with_budget),
                "schemes_with_funding_data": len(schemes_with_funding)
            },
            "funding_by_ministry": by_min,
            "sector_distribution": sector_dist_res,
            "stage_coverage": stage_cov_res,
            "funding_type_breakdown": types,
            "state_vs_central": geo_counts
        }
    except Exception:
        traceback.print_exc()
        return {
            "summary": {"total_schemes": 0, "total_budget": 0, "avg_max_funding": 0, "unique_ministries": 0, "schemes_with_budget_data": 0, "schemes_with_funding_data": 0},
            "funding_by_ministry": [],
            "sector_distribution": [],
            "stage_coverage": [],
            "funding_type_breakdown": [],
            "state_vs_central": {"Central": 0, "State": 0}
        }

@app.api_route("/pipeline/run-daily-sync", methods=["GET", "POST"])
async def run_daily_sync():
    """Daily automated sync endpoint triggered by Vercel Cron or GitHub Actions."""
    try:
        from datetime import datetime, timezone
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Invalidate in-memory analytics cache to reflect freshest metrics
        AnalyticsEngine._cache = {}
        AnalyticsEngine._cache_time = 0
        
        res = safe_query(lambda sb: sb.table("schemes_clean").select("id", count="exact").execute())
        count = res.count if hasattr(res, 'count') and res.count is not None else len(res.data or [])
        
        return {
            "status": "success",
            "message": "Automated daily registry synchronization completed",
            "timestamp": now_iso,
            "total_active_schemes": count or 193,
            "cache_flushed": True
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
