"""
Fast Analytics Copilot Engine for Policy Radar India
Provides fast-path deterministic answers (<150ms) for data & scheme queries,
with intelligent LLM grounding fallback for strategic advice.
"""

import re
import os
import logging
from typing import Dict, Any, List, Optional, Tuple
from pipeline.formatting import format_inr, get_unstated_amount_schemes

logger = logging.getLogger(__name__)

# Valid sectors and states for intent routing
SECTORS_MAP = {
    "ai": "AI / Machine Learning",
    "artificial intelligence": "AI / Machine Learning",
    "machine learning": "AI / Machine Learning",
    "agritech": "AgriTech",
    "agriculture": "AgriTech",
    "biotech": "Biotech / Life Sciences",
    "healthtech": "HealthTech",
    "deeptech": "DeepTech",
    "cleantech": "CleanTech",
    "fintech": "FinTech",
    "defence": "Defence / Aerospace",
    "space": "Spacetech",
    "semiconductor": "Semiconductor"
}

STATES_LIST = [
    "karnataka", "kerala", "maharashtra", "telangana", "tamil nadu",
    "delhi", "gujarat", "rajasthan", "odisha", "uttar pradesh",
    "bihar", "punjab", "haryana", "andhra pradesh", "west bengal"
]


def classify_intent(query: str, chip_payload: Optional[Dict[str, Any]] = None) -> Tuple[str, Dict[str, Any]]:
    """
    Classifies user intent using explicit priority order and word-boundary regexes.
    Returns (intent_name, intent_params).
    """
    # Priority 1: Explicit Chip Payload
    if chip_payload and isinstance(chip_payload, dict):
        intent = chip_payload.get("intent")
        if intent:
            return intent, chip_payload

    q = (query or "").strip()
    q_lower = q.lower()

    # Priority 2: Direct UI Action Commands (e.g. 'Filter explorer by AI', 'Show grants only')
    filter_by_match = re.search(r"\bfilter\s+(?:the\s+)?explorer\s+by\s+(.+)$", q_lower)
    if filter_by_match:
        target = filter_by_match.group(1).strip()
        # Check if target is a sector
        for key, canonical in SECTORS_MAP.items():
            if re.search(rf"\b{re.escape(key)}\b", target):
                return "filter_sector", {"sector": canonical}
        # Check if target is a state
        for state in STATES_LIST:
            if re.search(rf"\b{re.escape(state)}\b", target):
                return "filter_state", {"state": state.title()}
        return "filter_general", {"query": target}

    if re.search(r"\b(show|filter)\s+grants\s+only\b", q_lower):
        return "filter_grants", {}

    # Priority 3: Specific Scheme Match (e.g. "Fund of Funds for Startups (FFS)...", "Atal Incubation Centres")
    if re.search(r"\b(fund of funds|sisfs|birac|tide 2\.0|atal incubation|nidhi prayas|aditi scheme|rkvy-raftaar)\b", q_lower):
        return "scheme_inquiry", {"query": q}

    # Priority 4: Total count & platform stats
    if re.search(r"\b(how many schemes|total schemes|count of schemes|how many policies)\b", q_lower):
        return "total_count", {}

    # Priority 5: Early-stage / Seed / Prototype queries
    if re.search(r"\b(early[- ]?stage|idea[- ]?stage|prototype|seed[- ]?grant|seed[- ]?fund|pre[- ]?seed)\b", q_lower):
        return "early_stage_grants", {}

    # Priority 6: DPIIT Recognition Queries (word boundary \bdpiit\b or \b80-?iac\b)
    if re.search(r"\b(dpiit|80-?iac|startup india recognition)\b", q_lower):
        return "dpiit_analysis", {}

    # Priority 7: Pan-India / Central Schemes
    if re.search(r"\b(pan[- ]?india|central scheme|central govt|national scheme)\b", q_lower):
        return "pan_india_schemes", {}

    # Priority 8: Specific State Queries (word boundary matching)
    for state in STATES_LIST:
        if re.search(rf"\b{re.escape(state)}\b", q_lower):
            return "state_schemes", {"state": state.title()}

    # Priority 9: Specific Sector Queries (word boundary matching)
    for key, canonical in SECTORS_MAP.items():
        if re.search(rf"\b{re.escape(key)}\b", q_lower):
            return "sector_schemes", {"sector": canonical, "keyword": key}

    # Priority 10: Highest / Maximum Funding Queries
    if re.search(r"\b(largest|maximum funding|highest funding|biggest grant|top funding)\b", q_lower):
        return "highest_funding", {}

    # Fallback to general LLM / retrieval
    return "general_query", {}


def matches_profile_criteria(s: Dict[str, Any], sector: str, stage: str, state: str) -> bool:
    """Checks whether a scheme matches the founder's profile criteria."""
    s_secs = [str(x).lower() for x in (s.get("sector_eligibility") or [])]
    s_stgs = [str(x).lower() for x in (s.get("startup_stage") or [])]
    s_geo = (s.get("geographic_restriction") or "pan").lower()

    sec_l = sector.lower()
    stg_l = stage.lower()
    st_l = state.lower()

    sec_ok = not s_secs or any("all" in x or sec_l in x or x in sec_l for x in s_secs)
    stg_ok = not s_stgs or any("all" in x or stg_l in x or x in stg_l for x in s_stgs)
    geo_ok = "pan" in s_geo or st_l in s_geo

    return sec_ok and stg_ok and geo_ok


def retrieve_relevant_schemes(query: str, schemes: List[Dict[str, Any]], top_k: int = 6) -> List[Dict[str, Any]]:
    """Retrieves top-k schemes matching query keywords for grounding."""
    stop_words = {"what", "which", "are", "active", "for", "the", "and", "show", "how", "can", "with", "does", "about", "schemes", "scheme"}
    terms = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2 and w.lower() not in stop_words]
    if not terms:
        return schemes[:top_k]

    scored = []
    for s in schemes:
        text = f"{s.get('scheme_name', '')} {s.get('ministry', '')} {s.get('nlp_summary', '')} {' '.join(s.get('sector_eligibility') or [])}".lower()
        score = sum(3 if t in s.get('scheme_name', '').lower() else 1 for t in terms if t in text)
        if score > 0:
            scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    if scored:
        return [item[1] for item in scored[:top_k]]
    return schemes[:top_k]


class CopilotEngine:
    """Answers founder and analyst questions with fast-path data queries & LLM fallback."""

    @staticmethod
    def answer_query(
        query: str,
        schemes: List[Dict[str, Any]],
        active_view: str = "dashboard",
        user_profile: Optional[Dict[str, Any]] = None,
        chip_payload: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Processes a copilot query. Returns { answer: str, source: 'fast_path' | 'llm', suggestions: List[Dict | str], ui_action: Optional[Dict] }
        """
        profile = user_profile or {}
        user_sector = profile.get("sector") or "AI / Machine Learning"
        user_stage = profile.get("stage") or "Early Revenue"
        user_state = profile.get("state") or "Pan-India"
        dpiit_registered = bool(profile.get("dpiitRegistered"))

        # Log data quality for unstated amounts
        get_unstated_amount_schemes(schemes)

        intent, params = classify_intent(query, chip_payload)

        # ── 1. UI ACTION: Filter Sector ─────────────────────────────────────────
        if intent == "filter_sector":
            sector = params.get("sector", user_sector)
            return {
                "answer": f"Filtering Schemes Explorer for **{sector}** sector programs.",
                "source": "fast_path",
                "ui_action": {"type": "filter_sector", "sector": sector},
                "suggestions": [
                    {"label": "Show grants only", "intent": "filter_grants"},
                    {"label": f"Top grants for {sector}", "query": f"Top grants for {sector}"},
                    {"label": "What schemes are active in Pan-India?", "query": "What schemes are active in Pan-India?"}
                ]
            }

        # ── 2. UI ACTION: Filter State ──────────────────────────────────────────
        if intent == "filter_state":
            state = params.get("state", user_state)
            return {
                "answer": f"Filtering Schemes Explorer for **{state}** state programs.",
                "source": "fast_path",
                "ui_action": {"type": "filter_state", "state": state},
                "suggestions": [
                    {"label": "Show grants only", "intent": "filter_grants"},
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"}
                ]
            }

        # ── 3. UI ACTION: Filter Grants ─────────────────────────────────────────
        if intent == "filter_grants":
            return {
                "answer": "Filtering Schemes Explorer for non-dilutive grant schemes.",
                "source": "fast_path",
                "ui_action": {"type": "filter_grants"},
                "suggestions": [
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                    {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"}
                ]
            }

        # ── 4. SPECIFIC SCHEME INQUIRY ──────────────────────────────────────────
        if intent == "scheme_inquiry":
            # Find best matching scheme
            terms = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
            best_scheme = None
            best_score = -1
            for s in schemes:
                name_l = s.get("scheme_name", "").lower()
                score = sum(1 for t in terms if t in name_l)
                if score > best_score:
                    best_score = score
                    best_scheme = s

            if best_scheme and best_score >= 1:
                cap_str = format_inr(best_scheme.get("max_funding_amount"))
                ftype = best_scheme.get("funding_type") or "Grant / Financial Assistance"
                min_name = best_scheme.get("ministry") or "Government Department"
                summary = best_scheme.get("nlp_summary") or "Verified central/state startup assistance scheme."
                dpiit_status = "Mandatory" if best_scheme.get("dpiit_required") else "Not mandatory"

                answer = (
                    f"### {best_scheme['scheme_name']}\n\n"
                    f"• **Sponsoring Agency**: {min_name}\n"
                    f"• **Maximum Ticket**: {cap_str}\n"
                    f"• **Funding Instrument**: {ftype}\n"
                    f"• **DPIIT Recognition**: {dpiit_status}\n\n"
                    f"{summary}"
                )
                return {
                    "answer": answer,
                    "source": "fast_path",
                    "sources": [{"id": best_scheme.get("id", "1"), "name": best_scheme["scheme_name"]}],
                    "suggestions": [
                        {"label": "How do I apply?", "query": f"How do I apply for {best_scheme['scheme_name']}?"},
                        {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                        {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"}
                    ]
                }

        # ── 5. DPIIT RECOGNITION ANALYSIS (Profile-Aware) ───────────────────────
        if intent == "dpiit_analysis":
            # Profile-aware unlocked schemes computation
            matching_schemes = [
                s for s in schemes
                if matches_profile_criteria(s, user_sector, user_stage, user_state)
            ]
            dpiit_matching = [s for s in matching_schemes if s.get("dpiit_required")]
            unlocks_count = len(dpiit_matching)

            # Sort matching by funding amount
            dpiit_matching_sorted = sorted(
                dpiit_matching,
                key=lambda x: x.get("max_funding_amount") or 0,
                reverse=True
            )
            top_unlocked = dpiit_matching_sorted[:4]

            if dpiit_registered:
                sample_txt = "\n".join(
                    f"• **{s['scheme_name']}** ({s.get('ministry') or 'Govt of India'}) — {format_inr(s.get('max_funding_amount'))} ({s.get('funding_type') or 'Grant'})"
                    for s in top_unlocked
                ) if top_unlocked else "• All matched programs in your sector are active for your application."

                answer = (
                    f"**DPIIT Recognition Status: Recognized (Verified) ✓**\n\n"
                    f"Because your venture already holds verified DPIIT Recognition, you have immediate access to Section 80-IAC (3-year 100% tax holiday), "
                    f"public procurement exemptions under Rule 173(i) of GFR 2017, and direct qualification for **{unlocks_count} targeted schemes** matching your {user_sector} profile:\n\n"
                    f"{sample_txt}\n\n"
                    f"💡 *Next Action: Proceed directly to file for Section 80-IAC tax exemption or submit applications via designated incubator portals.*"
                )
            else:
                sample_txt = "\n".join(
                    f"• **{s['scheme_name']}** ({s.get('ministry') or 'Govt of India'}) — {format_inr(s.get('max_funding_amount'))} ({s.get('funding_type') or 'Grant'})"
                    for s in top_unlocked
                ) if top_unlocked else "• National flagship funds including SISFS, CGSS, and Fund of Funds."

                answer = (
                    f"**DPIIT Recognition Status: Pending Registration**\n\n"
                    f"Applying for DPIIT Startup Recognition takes ~48 hours on startupindia.gov.in (free, requires PAN and Certificate of Incorporation). "
                    f"Acquiring recognition will unlock **{unlocks_count} targeted schemes** matching your {user_sector} profile:\n\n"
                    f"{sample_txt}\n\n"
                    f"💡 *Tip: 144 other schemes in our registry (such as BIRAC BIG and MSME Hackathon) do NOT require DPIIT and are open to you right now.*"
                )

            return {
                "answer": answer,
                "source": "fast_path",
                "sources": [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(top_unlocked)],
                "suggestions": [
                    {"label": "Show schemes not requiring DPIIT", "query": "Which schemes do NOT require DPIIT?"},
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                    {"label": "What schemes are active in Pan-India?", "query": "What schemes are active in Pan-India?"}
                ]
            }

        # ── 6. EARLY STAGE & PROTOTYPE GRANTS ───────────────────────────────────
        if intent == "early_stage_grants":
            qualifying = []
            for s in schemes:
                stages = [str(st).lower() for st in (s.get("startup_stage") or [])]
                ftype = (s.get("funding_type") or "").lower()
                is_stage_match = any(tag in st for st in stages for tag in ["idea", "prototype", "early", "validation", "pre-seed"])
                is_grant = "grant" in ftype or "seed" in ftype or "subsidy" in ftype

                if is_stage_match or is_grant:
                    # Score by profile relevance
                    relevance = 0
                    if matches_profile_criteria(s, user_sector, user_stage, user_state):
                        relevance += 10
                    elif "pan" in (s.get("geographic_restriction") or "").lower():
                        relevance += 5
                    
                    amt = s.get("max_funding_amount") or 0
                    # For early stage prototype, realistic tickets are <= 5 Cr (exclude 25 Cr mega infra funds)
                    if 0 < amt <= 50_000_000:
                        relevance += 5
                    qualifying.append((relevance, amt, s))

            # Rank by profile relevance desc, then funding amount
            qualifying.sort(key=lambda x: (x[0], x[1]), reverse=True)
            top_schemes = [x[2] for x in qualifying[:5]]

            if not top_schemes:
                answer = "No early-stage grants found matching those strict criteria in our 193 verified public records."
            else:
                sample_txt = "\n".join(
                    f"• **{s['scheme_name']}** ({s.get('ministry') or 'Central / State Mission'}) — {format_inr(s.get('max_funding_amount'))} • {s.get('funding_type') or 'Capital Grant'}"
                    for s in top_schemes
                )
                if len(top_schemes) < 5:
                    count_msg = f"Found **{len(top_schemes)} early-stage schemes** qualifying for Idea & Prototype validation:"
                else:
                    count_msg = f"Found **{len(qualifying)} early-stage schemes** for Idea & Prototype validation. Here are the top 5 tailored to your profile:"

                answer = (
                    f"**{count_msg}**\n\n"
                    f"{sample_txt}\n\n"
                    f"💡 *Recommendation: These early-stage grants provide initial prototype fabrication and validation capital with 0% equity dilution.*"
                )

            return {
                "answer": answer,
                "source": "fast_path",
                "sources": [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(top_schemes)],
                "suggestions": [
                    {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"},
                    {"label": "What schemes are active in Pan-India?", "query": "What schemes are active in Pan-India?"},
                    {"label": f"Filter explorer by {user_sector}", "intent": "filter_sector", "sector": user_sector}
                ]
            }

        # ── 7. PAN-INDIA / CENTRAL SCHEMES ──────────────────────────────────────
        if intent == "pan_india_schemes":
            matched = [
                s for s in schemes
                if "pan" in (s.get("geographic_restriction") or "").lower() or not s.get("geographic_restriction")
            ]
            count = len(matched)
            sample_txt = "\n".join(
                f"• **{s['scheme_name']}** ({s.get('ministry') or 'Central Ministry'}) — Max: {format_inr(s.get('max_funding_amount'))}"
                for s in matched[:5]
            )
            return {
                "answer": (
                    f"Found **{count} Pan-India / Central schemes** accessible nationwide across all states:\n\n"
                    f"{sample_txt}\n\n"
                    f"💡 *Tip: Pan-India schemes (like SISFS, BIRAC BIG, and MeitY TIDE 2.0) can be stacked with state-specific innovation subsidies.*"
                ),
                "source": "fast_path",
                "sources": [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(matched[:5])],
                "suggestions": [
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                    {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"},
                    {"label": "What is the highest funding grant?", "query": "What is the highest funding grant?"}
                ]
            }

        # ── 8. STATE-SPECIFIC SCHEMES ───────────────────────────────────────────
        if intent == "state_schemes":
            state = params.get("state", user_state)
            matched = [
                s for s in schemes 
                if state.lower() in (s.get("geographic_restriction") or "").lower()
            ]
            count = len(matched)
            sample_txt = "\n".join(
                f"• **{s['scheme_name']}** ({s.get('ministry') or state}) — Max: {format_inr(s.get('max_funding_amount'))}"
                for s in matched[:4]
            )
            return {
                "answer": (
                    f"Found **{count} localized schemes** specifically active in **{state}**:\n\n"
                    f"{sample_txt}\n\n"
                    f"*(Note: Founders in {state} are additionally eligible for all Central/Pan-India programs!)*"
                ),
                "source": "fast_path",
                "ui_action": {"type": "filter_state", "state": state},
                "sources": [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(matched[:4])],
                "suggestions": [
                    {"label": f"Filter explorer by {state}", "intent": "filter_state", "state": state},
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                    {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"}
                ]
            }

        # ── 9. SECTOR-SPECIFIC SCHEMES ──────────────────────────────────────────
        if intent == "sector_schemes":
            sector = params.get("sector", user_sector)
            keyword = params.get("keyword", sector.lower())
            matched = [
                s for s in schemes
                if any(keyword in str(elig).lower() for elig in (s.get("sector_eligibility") or []))
                or "all" in str(s.get("sector_eligibility") or "").lower()
            ]
            specific_matched = [
                s for s in matched 
                if any(keyword in str(elig).lower() for elig in (s.get("sector_eligibility") or []))
            ]
            sample = specific_matched[:4] if specific_matched else matched[:4]
            sample_txt = "\n".join(
                f"• **{s['scheme_name']}** — Max: {format_inr(s.get('max_funding_amount'))}"
                for s in sample
            )
            return {
                "answer": (
                    f"Found **{len(specific_matched)} targeted schemes** directly specialized for **{sector}** "
                    f"(plus {len(matched) - len(specific_matched)} sector-agnostic schemes):\n\n"
                    f"{sample_txt}"
                ),
                "source": "fast_path",
                "ui_action": {"type": "filter_sector", "sector": sector},
                "sources": [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(sample)],
                "suggestions": [
                    {"label": f"Filter explorer by {sector}", "intent": "filter_sector", "sector": sector},
                    {"label": "Show grants only", "intent": "filter_grants"},
                    {"label": "What is the highest funding grant?", "query": "What is the highest funding grant?"}
                ]
            }

        # ── 10. TOTAL COUNT & HIGH-LEVEL STATS ──────────────────────────────────
        if intent == "total_count":
            total = len(schemes)
            pan_india = sum(1 for s in schemes if "pan" in (s.get("geographic_restriction") or "").lower())
            state_schemes = total - pan_india
            return {
                "answer": (
                    f"Policy Radar India currently monitors **{total} verified schemes**:\n\n"
                    f"• **{pan_india} Pan-India Schemes** accessible across all states\n"
                    f"• **{state_schemes} State-Specific Schemes** spanning 28+ States & UTs"
                ),
                "source": "fast_path",
                "suggestions": [
                    {"label": f"What schemes are active in {user_state}?", "query": f"What schemes are active in {user_state}?"},
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                    {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"}
                ]
            }

        # ── 11. HIGHEST FUNDING / LARGEST GRANTS ────────────────────────────────
        if intent == "highest_funding":
            schemes_sorted = sorted(
                [s for s in schemes if s.get("max_funding_amount")],
                key=lambda x: x["max_funding_amount"],
                reverse=True
            )
            top5 = schemes_sorted[:5]
            top_txt = "\n".join(
                f"{i+1}. **{s['scheme_name']}** — {format_inr(s.get('max_funding_amount'))} ({s.get('ministry') or 'Govt of India'})"
                for i, s in enumerate(top5)
            )
            return {
                "answer": (
                    f"**Top 5 Highest Funding Startup Schemes in India**:\n\n"
                    f"{top_txt}\n\n"
                    f"*(Note: High-ticket programs like ADITI and TTDF target strategic defense, quantum, and telecom hardware innovations.)*"
                ),
                "source": "fast_path",
                "sources": [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(top5)],
                "suggestions": [
                    {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                    {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"}
                ]
            }

        # ── 12. FALLBACK: Intelligent Retrieval Grounding + LLM ─────────────────
        retrieved = retrieve_relevant_schemes(query, schemes, top_k=6)
        sources = [{"id": s.get("id", str(i)), "name": s["scheme_name"]} for i, s in enumerate(retrieved)]

        # Check if an LLM API key is present
        gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        groq_key = os.environ.get("GROQ_API_KEY")
        has_llm_key = bool(gemini_key or groq_key)

        if has_llm_key:
            try:
                from pipeline.llm_service import chat_with_agent

                # Format grounded context from retrieved schemes
                context_lines = [
                    f"- {s['scheme_name']} | Ministry: {s.get('ministry') or 'Govt'} | Cap: {format_inr(s.get('max_funding_amount'))} | Type: {s.get('funding_type') or 'Grant'} | DPIIT: {'Required' if s.get('dpiit_required') else 'Not required'}"
                    for s in retrieved
                ]
                context_data = (
                    f"Founder Profile: Sector: {user_sector}, Stage: {user_stage}, State: {user_state}, DPIIT: {dpiit_registered}.\n"
                    f"Relevant Verified Gazette Schemes:\n" + "\n".join(context_lines)
                )

                # Send formatted history (last N turns)
                history_formatted = []
                if history:
                    for h in history[-6:]:
                        role = "user" if h.get("role") == "user" else "assistant"
                        history_formatted.append({"role": role, "content": h.get("content", "")})

                # Note: call chat_with_agent with exact signature: message, history, context_data
                llm_reply = chat_with_agent(
                    message=query,
                    history=history_formatted,
                    context_data=context_data
                )
                return {
                    "answer": llm_reply,
                    "source": "llm",
                    "sources": sources,
                    "suggestions": [
                        {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                        {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"},
                        {"label": f"Filter explorer by {user_sector}", "intent": "filter_sector", "sector": user_sector}
                    ]
                }
            except Exception as e:
                logger.warning("LLM inference call failed: %s; falling back to deterministic synthesis.", e)

        # Deterministic Grounded Synthesis Fallback
        sample_txt = "\n".join(
            f"• **{s['scheme_name']}** ({s.get('ministry') or 'Govt'}) — {format_inr(s.get('max_funding_amount'))} ({s.get('funding_type') or 'Grant'})"
            for s in retrieved[:4]
        )
        return {
            "answer": (
                f"Here are verified schemes from our registry matching your inquiry:\n\n"
                f"{sample_txt}\n\n"
                f"You can explore all {len(schemes)} schemes in the Schemes Explorer tab."
            ),
            "source": "fast_path",
            "sources": sources[:4],
            "suggestions": [
                {"label": "Top 5 early stage grants", "query": "Top 5 early stage grants"},
                {"label": "What schemes are active in Pan-India?", "query": "What schemes are active in Pan-India?"},
                {"label": "Which schemes do NOT require DPIIT?", "query": "Which schemes do NOT require DPIIT?"}
            ]
        }
