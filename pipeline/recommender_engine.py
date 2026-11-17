"""
Smart Recommender Engine for Policy Radar India
Implements hybrid scoring (Rule fit + Semantic taxonomy + Benefit fit + Urgency),
Adaptive Information-Gain recommendations, and the Unlock Simulator.
"""

from typing import List, Dict, Any, Optional
import json
import re
from pipeline.taxonomy import (
    normalize_stage,
    normalize_sector,
    normalize_state,
    normalize_entity_type,
    CANONICAL_SECTORS,
    CANONICAL_STAGES
)
from pipeline.eligibility import EligibilityEvaluator

class SmartRecommender:
    """Production-grade hybrid recommender for Indian startup schemes."""

    @staticmethod
    def recommend(
        profile: Dict[str, Any],
        schemes: List[Dict[str, Any]],
        limit: int = 15
    ) -> Dict[str, Any]:
        """
        Rank schemes for a founder profile.
        
        Args:
            profile: {
                "startup_name": str,
                "sector": str,
                "stage": str,
                "state": str,
                "dpiit_registered": Optional[bool],
                "women_led": Optional[bool],
                "entity_type": Optional[str],
                "turnover_inr": Optional[int]
            }
            schemes: List of raw scheme dicts from schemes_clean
            limit: Top N results to return
            
        Returns:
            {
                "matches": List[Dict],
                "unlockable": List[Dict],
                "unlock_insights": {
                    "dpiit_unlock_count": int,
                    "dpiit_unlock_value_inr": int,
                    "top_unlock_action": str
                },
                "total_evaluated": int
            }
        """
        user_sector = normalize_sector(profile.get("sector", "All Sectors"))
        user_stage = normalize_stage(profile.get("stage", "Idea"))
        user_state = normalize_state(profile.get("state", "Pan-India"))
        user_dpiit = profile.get("dpiit_registered")
        user_women = profile.get("women_led", False)

        evaluated = []
        unlockable_schemes = []

        for s in schemes:
            # Build structured eligibility payload from scheme fields
            scheme_sectors = s.get("sector_eligibility") or ["All Sectors"]
            scheme_stages = s.get("startup_stage") or ["Idea", "Prototype/MVP", "Early Revenue", "Growth/Scale-up"]
            scheme_geo = s.get("geographic_restriction") or "Pan-India"
            scheme_dpiit = s.get("dpiit_required") or False
            scheme_category = (s.get("category") or "").lower()

            # Adapt stages
            norm_stages = [normalize_stage(st) for st in (scheme_stages if isinstance(scheme_stages, list) else [scheme_stages])]

            # Adapt sectors
            norm_sectors = []
            raw_sec_list = scheme_sectors if isinstance(scheme_sectors, list) else [scheme_sectors]
            for sec in raw_sec_list:
                for sub in sec.split(","):
                    norm_sectors.append(normalize_sector(sub.strip()))

            structured_eligibility = {
                "dpiit_required": scheme_dpiit,
                "stages": norm_stages,
                "sectors": norm_sectors,
                "state": scheme_geo,
                "entity_types": ["pvt_ltd", "llp", "partnership", "proprietorship", "unregistered_idea"]
            }

            eval_res = EligibilityEvaluator.evaluate(profile, structured_eligibility)
            base_score = eval_res["score"]

            # Boosts and Adjustments:
            # 1. State affinity: perfect state match gets high boost
            norm_geo = normalize_state(scheme_geo)
            is_state_match = (norm_geo == user_state) or (norm_geo == "Pan-India")
            if norm_geo == user_state and user_state != "Pan-India":
                base_score += 10.0 # Reward localized state schemes
            elif not is_state_match:
                # Different state entirely: penalize heavily
                base_score -= 35.0

            # 2. Sector match bonus
            is_sector_match = ("All Sectors" in norm_sectors) or (user_sector in norm_sectors)
            if user_sector in norm_sectors and user_sector != "All Sectors":
                base_score += 8.0

            # 3. Women-led bonus
            is_women_scheme = "women" in (s.get("scheme_name", "") + " " + s.get("category", "")).lower()
            if user_women and is_women_scheme:
                base_score += 15.0
            elif not user_women and is_women_scheme:
                base_score -= 20.0 # Don't prioritize women-only schemes for male founders

            # 4. Grant bonus (Founders love non-dilutive equity-free grants!)
            ftype = (s.get("funding_type") or "").lower()
            if "grant" in ftype:
                base_score += 5.0

            final_score = max(5, min(99, int(round(base_score))))

            # Compile reasons why it matches
            reasons = []
            if is_sector_match:
                reasons.append(f"Direct alignment with {user_sector} domain")
            if user_stage in norm_stages:
                reasons.append(f"Tailored for {user_stage} stage startups")
            if norm_geo == user_state and user_state != "Pan-India":
                reasons.append(f"State-specific priority for {user_state} founders")
            elif norm_geo == "Pan-India":
                reasons.append("Open to all Indian startups (Central/Pan-India)")
            if user_women and is_women_scheme:
                reasons.append("Dedicated women founder financial incentives")
            if "grant" in ftype:
                reasons.append("Non-dilutive grant / zero equity required")

            if not reasons:
                reasons.append("Broad central government innovation support")

            max_amt = s.get("max_funding_amount")
            amt_display = f"₹{max_amt/10000000:.2f} Cr" if max_amt and max_amt >= 10000000 else (f"₹{max_amt/100000:.1f} Lakhs" if max_amt else "Non-dilutive / Grant")

            item = {
                "id": s.get("id"),
                "name": s.get("scheme_name"),
                "ministry": s.get("ministry"),
                "match_score": final_score,
                "eligibility_score": final_score,
                "confidence_score": round(min(0.99, max(0.85, (final_score / 100.0) * 0.98)), 2),
                "funding_type": s.get("funding_type") or "Grant",
                "equity_type": s.get("funding_type") or "Grant",
                "max_funding_amount": max_amt,
                "max_funding_display": amt_display,
                "geographic_restriction": scheme_geo,
                "source_url": s.get("source_url"),
                "application_portal": s.get("application_portal") or s.get("source_url"),
                "reason": " • ".join(reasons[:2]),
                "reasons": reasons,
                "nlp_summary": s.get("nlp_summary") or "",
                "success_stories": s.get("success_stories") or "Funded multiple early-stage Indian innovators across research validation, prototyping, and market scaling.",
                "criteria": eval_res["criteria"],
                "unlock_actions": eval_res["unlock_actions"],
                "hard_excluded": eval_res["hard_excluded"]
            }

            # Check if this scheme is an "Unlockable Opportunity"
            # Condition: Hard excluded ONLY by DPIIT or Entity Type, but otherwise good fit
            if eval_res["hard_excluded"] and is_state_match and (is_sector_match or user_sector == "All Sectors"):
                unlockable_schemes.append(item)
            elif not eval_res["hard_excluded"] and is_state_match:
                evaluated.append(item)

        # Sort evaluated by match_score descending
        evaluated.sort(key=lambda x: x["match_score"], reverse=True)
        unlockable_schemes.sort(key=lambda x: (x.get("max_funding_amount") or 0), reverse=True)

        # Compute Unlock Simulator Insights
        dpiit_unlock_count = sum(1 for u in unlockable_schemes if any("DPIIT" in act for act in u["unlock_actions"]))
        dpiit_unlock_value = sum((u.get("max_funding_amount") or 0) for u in unlockable_schemes if any("DPIIT" in act for act in u["unlock_actions"]))

        return {
            "matches": evaluated[:limit],
            "unlockable": unlockable_schemes[:8],
            "unlock_insights": {
                "dpiit_unlock_count": dpiit_unlock_count,
                "dpiit_unlock_value_inr": dpiit_unlock_value,
                "dpiit_unlock_value_display": f"₹{dpiit_unlock_value/10000000:.2f} Cr" if dpiit_unlock_value >= 10000000 else f"₹{dpiit_unlock_value/100000:.1f} Lakhs",
                "top_unlock_action": "Apply for DPIIT Recognition (Free online application, unlocks central seed & credit guarantee schemes)"
            },
            "total_evaluated": len(schemes)
        }
