import os
import time
import httpx
from google import genai
from dotenv import load_dotenv

load_dotenv()

def _call_groq(prompt: str, json_mode: bool = False) -> str:
    """Ultra-fast fallback LLM inference using Groq."""
    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("No GROQ_API_KEY configured.")
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "qwen/qwen3.8-27b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    res = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30.0
    )
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]

# ═══════════════════════════════════════════════════
# MULTI-KEY ROTATION WITH AUTO-FAILOVER
# Add GEMINI_API_KEY_2 (and optionally _3, _4...) to .env
# When one key hits 429 quota, we instantly switch to the next.
# ═══════════════════════════════════════════════════

def _load_api_keys():
    """Collect all GEMINI_API_KEY variants from env."""
    keys = []
    # Primary key
    primary = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if primary:
        keys.append(primary)
    # Additional keys: GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.
    for i in range(2, 10):
        k = os.environ.get(f"GEMINI_API_KEY_{i}")
        if k:
            keys.append(k)
    return keys

API_KEYS = _load_api_keys()
_current_key_index = 0

def _get_client():
    """Get a genai Client using the current key."""
    global _current_key_index
    if not API_KEYS:
        raise ValueError("No GEMINI_API_KEY found in environment! Please add it to your .env file.")
    key = API_KEYS[_current_key_index % len(API_KEYS)]
    return genai.Client(api_key=key)

def _rotate_key():
    """Switch to the next available API key."""
    global _current_key_index
    old_idx = _current_key_index % len(API_KEYS)
    _current_key_index += 1
    new_idx = _current_key_index % len(API_KEYS)
    print(f"[KEY ROTATION] Switching from key #{old_idx + 1} → key #{new_idx + 1} (of {len(API_KEYS)} total)")

def _is_quota_error(e: Exception) -> bool:
    """Check if the error is a rate limit / quota error."""
    err = str(e).lower()
    return "429" in err or "quota" in err or "rate" in err or "resource_exhausted" in err

def _call_gemini(prompt: str, json_mode: bool = False, max_retries: int = 3):
    """Core Gemini call with multi-key failover.
    
    Strategy:
    1. Try current key up to max_retries times
    2. On quota error → rotate key and retry immediately
    3. On other errors → simple backoff retry
    """
    keys_tried = 0
    total_keys = len(API_KEYS)
    
    for attempt in range(max_retries * total_keys):  # Extended attempts across all keys
        try:
            client = _get_client()
            config = {'response_mime_type': 'application/json'} if json_mode else {}
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=config if config else None,
            )
            return response.text
        except Exception as e:
            if _is_quota_error(e):
                print(f"[GEMINI] Quota hit on key #{(_current_key_index % total_keys) + 1}: {e}")
                keys_tried += 1
                if keys_tried < total_keys:
                    _rotate_key()
                    continue  # Retry immediately with new key
                else:
                    # All keys exhausted, wait and reset
                    print(f"[GEMINI] All {total_keys} keys exhausted. Waiting 30s...")
                    time.sleep(30)
                    keys_tried = 0
                    _rotate_key()
                    continue
            else:
                # Non-quota error: simple backoff
                if attempt < max_retries * total_keys - 1:
                    time.sleep(2 * (attempt + 1))
                else:
                    if os.environ.get("GROQ_API_KEY"):
                        print(f"[LLM] Gemini attempt failed, falling back to Groq: {e}")
                        return _call_groq(prompt, json_mode)
                    raise e


# ═══════════════════════════════════════════════════
# PUBLIC API — unchanged signatures
# ═══════════════════════════════════════════════════

def summarize_scheme(scheme_data: dict) -> str:
    prompt = f"Summarise this government startup scheme in 3 sentences in plain English. Focus on: who can apply, how much they can get, and what the main benefit is.\n\nScheme Data: {scheme_data}"
    try:
        return _call_gemini(prompt)
    except Exception as e:
        print(f"Failed summarize_scheme: {e}")
        return "Pending summary due to high AI load."

def recommend_schemes(user_name: str, user_sector: str, user_stage: str, user_location: str, schemes_list: list) -> str:
    prompt = f"""You are an expert Indian government policy analyst evaluating startup eligibility for government schemes.

## USER PROFILE:
- Startup Name: {user_name}
- Sector: {user_sector}
- Stage: {user_stage}
- Location/State: {user_location}

## AVAILABLE SCHEMES:
{schemes_list}

## YOUR TASK:
Select the TOP 3 most relevant schemes for this startup. For each scheme, perform a rigorous eligibility assessment using this EXACT scoring rubric:

### SCORING RUBRIC (0-100):
1. **Sector Match (0-25 pts)**: Does the scheme's sector_eligibility include the user's sector or "All"? 
   - 25 = Exact sector match or "All Sectors" eligible
   - 15 = Related sector (e.g., user=Fintech, scheme=Technology)
   - 5 = No sector alignment but scheme is sector-agnostic
   - 0 = Scheme explicitly excludes this sector

2. **Stage Match (0-25 pts)**: Does the scheme's startup_stage include the user's stage?
   - 25 = Exact stage match
   - 15 = Adjacent stage (e.g., user=prototype, scheme covers early_revenue)
   - 0 = Stage mismatch

3. **Geography Match (0-15 pts)**: Is the user eligible based on location?
   - 15 = Scheme is Pan-India OR user is in the specific state required
   - 7 = Scheme state is unspecified
   - 0 = Scheme is restricted to a different state

4. **Documentation Readiness (0-15 pts)**: How easy are the required documents to prepare?
   - 15 = Standard docs (PAN, Aadhaar, incorporation cert)
   - 10 = Needs DPIIT registration (common but extra step)
   - 5 = Needs specialized docs (patents, research papers, incubator admission)
   - 0 = Extremely complex requirements

5. **Scheme-Specific Criteria (0-20 pts)**: Additional factors like turnover limits, age of company, technology requirements.
   - 20 = No restrictive criteria or all likely met
   - 10 = Some criteria may not be met
   - 0 = Critical criteria likely unmet

### SCORE CALIBRATION:
- 85-100: Nearly all criteria met. Startup should definitely apply.
- 70-84: Most criteria met with minor gaps. Strong candidate.
- 50-69: Partial match. Some important criteria may not be met.
- 30-49: Weak match. Significant eligibility concerns.
- 0-29: Poor match. Unlikely eligible.

IMPORTANT: Do NOT inflate scores. A generic startup at idea stage should NOT score 90+ on most schemes. Be realistic and cite specific gaps.

Return a VALID JSON array of objects with these fields:
- scheme_id: (The actual 'id' field from the input scheme data)
- name: (Name of the scheme)
- reason: (1-sentence pitch why this scheme matters for them)
- why_eligible_reasoning: (2-3 sentences citing SPECIFIC criteria matches and gaps. Example: "Sector: Deeptech matches scheme's Technology focus (+25). Stage: Idea stage matches (+25). Geography: Pan-India (+15). However, scheme requires working prototype for final disbursement (-10 on scheme-specific). Total: 75%")
- eligibility_score: (Integer 0-100, calculated using the rubric above)
- documents_checklist: (Array of 3-5 specific required documents from scheme details)
- equity_type: (Grant, Equity, or Loan — from scheme data)
- disbursement_structure: (Lumpsum, Milestone-based, or Reimbursement — from scheme data)
- deadline_status: (Current status like 'Open - Rolling' or 'Open - Batch-based')
- action: (Specific next step the founder should take)
- application_url: (URL to apply, from scheme data)

Ensure the output is ONLY the JSON array, no markdown formatting."""
    
    return _call_gemini(prompt, json_mode=True)

def evaluate_single_scheme(user_name: str, user_sector: str, user_stage: str, user_location: str, scheme_data: str) -> str:
    prompt = f"""You are an expert Indian government policy analyst performing a detailed eligibility assessment.

## USER PROFILE:
- Startup Name: {user_name}
- Sector: {user_sector}
- Stage: {user_stage}
- Location/State: {user_location}

## SCHEME TO EVALUATE:
{scheme_data}

## YOUR TASK:
Perform a thorough eligibility assessment of this SINGLE scheme against the user's profile using this EXACT scoring rubric:

### SCORING RUBRIC (0-100):
1. **Sector Match (0-25 pts)**: Does the scheme's sector_eligibility include the user's sector?
   - 25 = Exact sector match or "All Sectors" eligible
   - 15 = Related/adjacent sector
   - 5 = Sector-agnostic scheme
   - 0 = Sector excluded

2. **Stage Match (0-25 pts)**: Does the scheme's startup_stage include the user's stage?
   - 25 = Exact stage match
   - 15 = Adjacent stage covered
   - 0 = Stage not covered

3. **Geography Match (0-15 pts)**: Location eligibility?
   - 15 = Pan-India or matching state
   - 7 = Unspecified geographic scope
   - 0 = Different state restriction

4. **Documentation Readiness (0-15 pts)**: How accessible are required documents?
   - 15 = Standard docs only
   - 10 = DPIIT registration needed
   - 5 = Specialized docs needed
   - 0 = Extremely complex requirements

5. **Scheme-Specific Criteria (0-20 pts)**: Turnover, company age, tech requirements, etc.
   - 20 = No restrictive criteria / all likely met
   - 10 = Some criteria may not be met
   - 0 = Critical criteria likely unmet

### SCORE CALIBRATION:
- 85-100: Nearly all criteria met. Should definitely apply.
- 70-84: Most criteria met with minor gaps.
- 50-69: Partial match. Some criteria may not be met.
- 30-49: Weak match.
- 0-29: Poor match.

Be rigorous and realistic. Cite each rubric dimension in your reasoning.

Return a VALID JSON array with exactly ONE object containing:
- scheme_id: (The actual 'id' field from the input)
- name: (Name of the scheme)
- reason: (1-sentence pitch)
- why_eligible_reasoning: (Detailed reasoning citing EACH rubric dimension with points awarded. Example: "Sector: +25 (Deeptech matches Technology). Stage: +15 (Idea is adjacent to Prototype). Geography: +15 (Pan-India). Docs: +10 (DPIIT required). Specific: +10 (turnover limit unclear). Total: 75/100.")
- eligibility_score: (Integer 0-100, calculated using rubric)
- documents_checklist: (Array of 3-5 specific required documents)
- equity_type: (Grant, Equity, or Loan)
- disbursement_structure: (Lumpsum, Milestone-based, or Reimbursement)
- deadline_status: (Current status)
- action: (Specific next step)
- application_url: (URL to apply)

Ensure the output is ONLY the JSON array."""
    return _call_gemini(prompt, json_mode=True)

def chat_with_agent(message: str, history: list, context_data: str) -> str:
    messages_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
    prompt = f"You are GOV-BOT, an AI expert on Indian government startup schemes and policies.\nYou have been loaded with knowledge about these schemes.\nHelp the user understand eligibility, application process, required documents, funding amounts, deadlines, and any other details.\nBe specific, accurate, and helpful. If you don't know something, say so.\nContext Data:\n{context_data}\n\nChat History:\n{messages_str}\n\nUser: {message}\nAI:"
    
    try:
        return _call_gemini(prompt)
    except Exception as e:
        return "Sorry, I am facing some issues connecting to my brain right now."
