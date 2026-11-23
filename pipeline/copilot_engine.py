"""
Fast Analytics Copilot Engine for Policy Radar India
Provides fast-path deterministic answers (<150ms) for data & scheme queries,
with intelligent LLM grounding fallback for strategic advice.
"""

import re
from typing import Dict, Any, List, Optional
from pipeline.taxonomy import normalize_stage, normalize_sector, normalize_state

class CopilotEngine:
    """Answers founder and analyst questions with fast-path data queries & LLM fallback."""

    @staticmethod
    def answer_query(
        query: str,
        schemes: List[Dict[str, Any]],
        active_view: str = "dashboard",
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Processes a copilot query. Returns { answer: str, source: 'fast_path' | 'llm', suggestions: List[str], ui_action: Optional[Dict] }
        """
        q = query.lower().strip()

        # ── 1. FAST-PATH: Total Count & Summary ───────────────────────────
        if any(term in q for term in ["how many schemes", "total schemes", "count of schemes", "how many policies"]):
            total = len(schemes)
            pan_india = sum(1 for s in schemes if "pan" in (s.get("geographic_restriction") or "").lower())
            state_schemes = total - pan_india
            return {
                "answer": (
                    f"Policy Radar India currently monitors **{total} verified schemes**.\n\n"
                    f"• **{pan_india} Pan-India Schemes** accessible across all states\n"
                    f"• **{state_schemes} State-Specific Schemes** spanning 28+ States & UTs"
                ),
                "source": "fast_path",
                "suggestions": ["Show Karnataka schemes", "Top 5 early stage grants", "What requires DPIIT?"]
            }

        # ── 1b. FAST-PATH: Pan-India / Central Schemes ────────────────────
        if any(term in q for term in ["pan-india", "pan india", "central scheme", "central govt", "all india", "national scheme"]):
            matched = [
                s for s in schemes
                if "pan" in (s.get("geographic_restriction") or "").lower() or not s.get("geographic_restriction")
            ]
            count = len(matched)
            sample_names = "\n".join(f"• **{s['scheme_name']}** ({s.get('ministry')}) — Max: ₹{(s.get('max_funding_amount') or 0)/100000:.1f}L" for s in matched[:5])
            return {
                "answer": (
                    f"Found **{count} Pan-India / Central schemes** accessible nationwide to founders across all states:\n\n"
                    f"{sample_names}\n\n"
                    f"💡 *Tip: Pan-India schemes (like SISFS, BIRAC BIG, and TIDE 2.0) can be stacked with state-specific innovation subsidies.*"
                ),
                "source": "fast_path",
                "suggestions": ["Top 5 early stage grants", "Which schemes do NOT require DPIIT?", "What is the highest funding grant?"]
            }

        # ── 1c. FAST-PATH: Early Stage & Idea Grants ─────────────────────
        if any(term in q for term in ["early stage", "early-stage", "idea stage", "seed stage", "seed grant", "seed fund", "prototype grant"]):
            matched = [
                s for s in schemes
                if ("grant" in (s.get("funding_type") or "").lower()) or
                   any(st in str(s.get("startup_stage") or []).lower() for st in ["idea", "prototype", "early"])
            ]
            matched_sorted = sorted(matched, key=lambda x: x.get("max_funding_amount") or 0, reverse=True)
            top5 = matched_sorted[:5]
            sample_names = "\n".join(f"• **{s['scheme_name']}** ({s.get('ministry')}) — ₹{(s.get('max_funding_amount') or 0)/100000:.1f} Lakhs" for s in top5)
            return {
                "answer": (
                    f"**Top Early-Stage Grants for Idea & Prototype Validation**:\n\n"
                    f"{sample_names}\n\n"
                    f"💡 *Recommendation: These non-dilutive grants provide initial prototype fabrication and validation capital without equity dilution.*"
                ),
                "source": "fast_path",
                "suggestions": ["Which schemes do NOT require DPIIT?", "What schemes are active in Pan-India?", "How do I apply?"]
            }

        # ── 2. FAST-PATH: Schemes in specific State ───────────────────────
        state_match = None
        for sname in ["karnataka", "kerala", "maharashtra", "telangana", "tamil nadu", "delhi", "gujarat", "rajasthan", "odisha", "uttar pradesh", "bihar", "punjab", "haryana"]:
            if sname in q:
                state_match = sname
                break

        if state_match:
            matched = [
                s for s in schemes 
                if state_match in (s.get("geographic_restriction") or "").lower()
            ]
            count = len(matched)
            sample_names = "\n".join(f"• **{s['scheme_name']}** ({s.get('ministry')}) — Max: ₹{(s.get('max_funding_amount') or 0)/100000:.1f}L" for s in matched[:4])
            return {
                "answer": (
                    f"Found **{count} localized schemes** specifically active in **{state_match.title()}**:\n\n"
                    f"{sample_names}\n\n"
                    f"*(Note: Founders in {state_match.title()} are additionally eligible for all Central/Pan-India programs!)*"
                ),
                "source": "fast_path",
                "ui_action": {"type": "filter_state", "state": state_match.title()},
                "suggestions": [f"View all {state_match.title()} schemes", "What are the eligibility criteria?", "Compare with Karnataka"]
            }

        # ── 3. FAST-PATH: Schemes in specific Sector ──────────────────────
        sector_match = None
        for sec in ["agritech", "agriculture", "biotech", "healthtech", "ai", "artificial intelligence", "deeptech", "cleantech", "fintech", "defence", "space", "semiconductor"]:
            if sec in q:
                sector_match = sec
                break

        if sector_match:
            matched = [
                s for s in schemes
                if any(sector_match in str(elig).lower() for elig in (s.get("sector_eligibility") or []))
                or "all" in str(s.get("sector_eligibility") or "").lower()
            ]
            specific_matched = [
                s for s in matched 
                if any(sector_match in str(elig).lower() for elig in (s.get("sector_eligibility") or []))
            ]
            sample = specific_matched[:4] if specific_matched else matched[:4]
            sample_txt = "\n".join(f"• **{s['scheme_name']}** — Max: ₹{(s.get('max_funding_amount') or 0)/100000:.1f}L" for s in sample)
            return {
                "answer": (
                    f"Found **{len(specific_matched)} targeted schemes** directly specialized for **{sector_match.upper()}** "
                    f"(plus {len(matched) - len(specific_matched)} sector-agnostic schemes):\n\n"
                    f"{sample_txt}"
                ),
                "source": "fast_path",
                "ui_action": {"type": "filter_sector", "sector": sector_match.title()},
                "suggestions": [f"Filter explorer by {sector_match.title()}", "Show grants only", "What is the largest funding amount?"]
            }

        # ── 4. FAST-PATH: DPIIT Recognition Queries ───────────────────────
        if "dpiit" in q:
            dpiit_schemes = [s for s in schemes if s.get("dpiit_required")]
            no_dpiit_schemes = [s for s in schemes if not s.get("dpiit_required")]
            return {
                "answer": (
                    f"**DPIIT Recognition Analysis**:\n\n"
                    f"• **{len(dpiit_schemes)} schemes require DPIIT Recognition** (e.g. SISFS, CGSS, Fund of Funds, iDEX, SIPP).\n"
                    f"• **{len(no_dpiit_schemes)} schemes do NOT mandate DPIIT** (most state idea grants like BIRAC BIG, Karnataka ELEVATE, KSUM Idea Grant, MSME Hackathon).\n\n"
                    f"💡 *Recommendation: Applying for DPIIT Recognition takes ~48 hours on startupindia.gov.in and immediately unlocks {len(dpiit_schemes)} additional central capital opportunities.*"
                ),
                "source": "fast_path",
                "suggestions": ["Show schemes not requiring DPIIT", "How to apply for DPIIT?", "Show central grants"]
            }

        # ── 5. FAST-PATH: Top Funding / Largest Grants ─────────────────────
        if any(term in q for term in ["largest", "maximum funding", "highest funding", "biggest grant", "top funding"]):
            schemes_sorted = sorted(
                [s for s in schemes if s.get("max_funding_amount")],
                key=lambda x: x["max_funding_amount"],
                reverse=True
            )
            top5 = schemes_sorted[:5]
            top_txt = "\n".join(f"{i+1}. **{s['scheme_name']}** — ₹{s['max_funding_amount']/10000000:.2f} Cr ({s.get('ministry')})" for i, s in enumerate(top5))
            return {
                "answer": (
                    f"**Top 5 Highest Funding Startup Schemes in India**:\n\n"
                    f"{top_txt}\n\n"
                    f"*(Note: High-ticket programs like ADITI and TTDF target strategic defense, quantum, and telecom hardware innovations.)*"
                ),
                "source": "fast_path",
                "suggestions": ["Show grants for early stage", "What is the average grant size?", "Show DeepTech schemes"]
            }

        # ── 6. LLM FALLBACK: Complex Strategic Reasoning ─────────────────
        try:
            from pipeline.llm_service import chat_with_agent
            
            # Grounding context from active schemes
            sample_context = f"Total verified schemes: {len(schemes)}. Sample top schemes: " + "; ".join(
                f"{s['scheme_name']} ({s.get('geographic_restriction')}, {s.get('funding_type')})" for s in schemes[:12]
            )
            llm_reply = chat_with_agent(
                prompt=query,
                history=[],
                context=sample_context
            )
            return {
                "answer": llm_reply,
                "source": "llm",
                "suggestions": ["How do I qualify?", "Show step-by-step application process", "What documents are required?"]
            }
        except Exception:
            terms = [t for t in re.findall(r'\w+', q) if len(t) > 2 and t not in ["what", "which", "are", "active", "for", "the", "and", "show", "how", "can", "with", "does"]]
            found = []
            for s in schemes:
                s_text = f"{s.get('scheme_name', '')} {s.get('ministry', '')} {s.get('nlp_summary', '')} {' '.join(s.get('sector_eligibility') or [])}".lower()
                matches_count = sum(1 for t in terms if t in s_text)
                if matches_count > 0:
                    found.append((matches_count, s))
            found.sort(key=lambda x: x[0], reverse=True)
            if found:
                top_schemes = [x[1] for x in found[:4]]
                sample_txt = "\n".join(f"• **{s['scheme_name']}** ({s.get('ministry')}) — Max: ₹{(s.get('max_funding_amount') or 0)/100000:.1f}L" for s in top_schemes)
                return {
                    "answer": (
                        f"Here are top verified schemes matching your query:\n\n"
                        f"{sample_txt}\n\n"
                        f"You can explore all {len(schemes)} schemes in the Schemes Explorer tab."
                    ),
                    "source": "fallback_search",
                    "suggestions": ["Top 5 early stage grants", "What schemes are active in Pan-India?", "Which schemes do NOT require DPIIT?"]
                }
            return {
                "answer": (
                    f"I found {len(schemes)} startup schemes in our verified registry. "
                    f"You can explore schemes filtered by your sector ({user_profile.get('sector') if user_profile else 'All Sectors'}) "
                    f"or stage ({user_profile.get('stage') if user_profile else 'Idea'}) using the Schemes Explorer tab."
                ),
                "source": "fallback",
                "suggestions": ["Show all schemes", "Top 5 early stage grants", "Filter by Karnataka"]
            }
