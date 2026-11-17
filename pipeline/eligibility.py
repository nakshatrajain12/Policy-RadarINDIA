"""
Structured Tri-State Eligibility Engine for Policy Radar India.
Evaluates every criterion strictly as: 'met' | 'not_met' | 'unknown'.
Distinguishes between hard exclusions and soft qualification points.
"""

from typing import Dict, Any, List, Tuple
from pipeline.taxonomy import normalize_stage, normalize_sector, normalize_state, normalize_entity_type

class EligibilityEvaluator:
    """Evaluates a startup profile against a scheme's structured eligibility criteria."""
    
    @staticmethod
    def evaluate(profile: Dict[str, Any], eligibility: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate startup profile vs scheme structured eligibility.
        
        Returns:
            {
                "is_eligible": bool,
                "hard_excluded": bool,
                "score": int (0-100),
                "criteria": {
                    "dpiit": {"status": "met"|"not_met"|"unknown", "detail": str, "hard": bool},
                    "entity_type": ...,
                    "age": ...,
                    "turnover": ...,
                    "stage": ...,
                    "sector": ...,
                    "state": ...,
                    "founder": ...
                },
                "unlock_actions": List[str],
                "summary": str
            }
        """
        criteria_results: Dict[str, Dict[str, Any]] = {}
        hard_excluded = False
        unlock_actions = []
        
        weights = {
            "dpiit": 20,
            "entity_type": 15,
            "stage": 20,
            "sector": 25,
            "state": 15,
            "age": 5
        }
        total_weight = sum(weights.values())
        earned_points = 0.0

        # 1. DPIIT Recognition
        dpiit_req = eligibility.get("dpiit_required", False)
        user_dpiit = profile.get("dpiit_registered")
        if dpiit_req:
            if user_dpiit is True:
                criteria_results["dpiit"] = {"status": "met", "detail": "DPIIT Recognition verified", "hard": True}
                earned_points += weights["dpiit"]
            elif user_dpiit is False:
                criteria_results["dpiit"] = {"status": "not_met", "detail": "Requires DPIIT Recognized Startup status", "hard": True}
                hard_excluded = True
                unlock_actions.append("Apply for DPIIT Recognition (free on Startup India portal)")
            else:
                criteria_results["dpiit"] = {"status": "unknown", "detail": "DPIIT Recognition status unspecified", "hard": True}
                earned_points += weights["dpiit"] * 0.4
                unlock_actions.append("Confirm whether your startup holds DPIIT Recognition")
        else:
            criteria_results["dpiit"] = {"status": "met", "detail": "DPIIT Recognition not mandatory", "hard": False}
            earned_points += weights["dpiit"]

        # 2. Entity Type
        allowed_entities = [e.lower() for e in eligibility.get("entity_types", ["any"])]
        user_entity = normalize_entity_type(profile.get("entity_type", ""))
        if "any" in allowed_entities or user_entity == "any":
            criteria_results["entity_type"] = {"status": "met", "detail": "All legal entity types eligible", "hard": False}
            earned_points += weights["entity_type"]
        elif not profile.get("entity_type"):
            criteria_results["entity_type"] = {"status": "unknown", "detail": f"Requires {', '.join(allowed_entities).upper()}", "hard": True}
            earned_points += weights["entity_type"] * 0.5
        elif user_entity in allowed_entities:
            criteria_results["entity_type"] = {"status": "met", "detail": f"Entity type ({user_entity.upper()}) matches criteria", "hard": True}
            earned_points += weights["entity_type"]
        else:
            criteria_results["entity_type"] = {"status": "not_met", "detail": f"Must be incorporated as {', '.join(allowed_entities).upper()}", "hard": True}
            hard_excluded = True
            unlock_actions.append(f"Incorporate or convert entity to {allowed_entities[0].upper()}")

        # 3. Stage Fit
        allowed_stages = [normalize_stage(s) for s in eligibility.get("stages", ["Idea", "Prototype/MVP", "Early Revenue", "Growth/Scale-up"])]
        user_stage = normalize_stage(profile.get("stage", "Idea"))
        if user_stage in allowed_stages:
            criteria_results["stage"] = {"status": "met", "detail": f"Stage '{user_stage}' is fully eligible", "hard": False}
            earned_points += weights["stage"]
        else:
            criteria_results["stage"] = {"status": "not_met", "detail": f"Targets {', '.join(allowed_stages)} (You: {user_stage})", "hard": False}
            earned_points += 0.0

        # 4. Sector Alignment
        allowed_sectors = eligibility.get("sectors", ["All Sectors"])
        user_sector = profile.get("sector", "All Sectors")
        norm_user_sector = normalize_sector(user_sector)
        
        if "All Sectors" in allowed_sectors or not allowed_sectors or norm_user_sector == "All Sectors":
            criteria_results["sector"] = {"status": "met", "detail": "Sector-agnostic scheme (open to all domains)", "hard": False}
            earned_points += weights["sector"]
        elif any(normalize_sector(s) == norm_user_sector for s in allowed_sectors):
            criteria_results["sector"] = {"status": "met", "detail": f"Direct sector match for {norm_user_sector}", "hard": False}
            earned_points += weights["sector"]
        else:
            criteria_results["sector"] = {"status": "not_met", "detail": f"Scheme specifically targets {', '.join(allowed_sectors[:3])}", "hard": False}
            earned_points += 0.0

        # 5. Geographic / State Match
        allowed_states = eligibility.get("states", ["pan_india"])
        user_state_code, user_state_name = normalize_state(profile.get("state") or profile.get("location") or "Pan-India")
        
        is_pan_india = any(s.lower() in ["pan_india", "pan-india", "all india", "pan"] for s in allowed_states)
        if is_pan_india or user_state_code == "PAN":
            criteria_results["state"] = {"status": "met", "detail": "Pan-India eligible", "hard": True}
            earned_points += weights["state"]
        elif any(user_state_code.lower() == s.lower() or user_state_name.lower() in s.lower() for s in allowed_states):
            criteria_results["state"] = {"status": "met", "detail": f"Eligible for {user_state_name} startups", "hard": True}
            earned_points += weights["state"]
        else:
            criteria_results["state"] = {"status": "not_met", "detail": f"Restricted to {', '.join(allowed_states)} (You: {user_state_name})", "hard": True}
            hard_excluded = True
            unlock_actions.append(f"Requires registered office in {allowed_states[0]}")

        # 6. Startup Age (Years)
        max_age = eligibility.get("startup_age_years", {}).get("max", 10)
        user_age = profile.get("startup_age_years")
        if user_age is not None:
            if user_age <= max_age:
                criteria_results["age"] = {"status": "met", "detail": f"Age {user_age} yrs within {max_age} yrs cap", "hard": True}
                earned_points += weights["age"]
            else:
                criteria_results["age"] = {"status": "not_met", "detail": f"Exceeds max age of {max_age} years", "hard": True}
                hard_excluded = True
        else:
            criteria_results["age"] = {"status": "unknown", "detail": f"Requires under {max_age} years since incorporation", "hard": False}
            earned_points += weights["age"] * 0.5

        # Compute Final Score
        final_score = int(round((earned_points / total_weight) * 100))
        if hard_excluded:
            # Hard excluded cannot score above 40
            final_score = min(final_score, 40)
            is_eligible = False
        else:
            is_eligible = final_score >= 60

        return {
            "is_eligible": is_eligible,
            "hard_excluded": hard_excluded,
            "score": final_score,
            "criteria": criteria_results,
            "unlock_actions": unlock_actions,
            "summary": f"{final_score}% match - {'Eligible to apply' if is_eligible else 'Requirements missing' if hard_excluded else 'Review criteria'}"
        }
