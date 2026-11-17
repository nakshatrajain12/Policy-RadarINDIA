"""
Unit tests for Controlled Taxonomies and Tri-State Eligibility Engine.
"""

import pytest
from pipeline.taxonomy import (
    normalize_stage,
    normalize_stages,
    normalize_sector,
    normalize_sectors,
    normalize_state,
    normalize_benefit_type,
    normalize_entity_type,
    CANONICAL_STAGES,
    CANONICAL_SECTORS
)
from pipeline.eligibility import EligibilityEvaluator


def test_stage_normalization():
    assert normalize_stage("early traction") == "Early Revenue"
    assert normalize_stage("MVP & Prototyping") == "Prototype/MVP"
    assert normalize_stage("ideation phase") == "Idea"
    assert normalize_stage("series a scaling") == "Growth/Scale-up"
    assert normalize_stage("unknown text") == "Idea"


def test_stages_list_normalization():
    res = normalize_stages(["idea", "prototype", "early traction"])
    assert res == ["Idea", "Prototype/MVP", "Early Revenue"]
    
    # "All" returns all 4 canonical stages
    all_res = normalize_stages(["all"])
    assert all_res == CANONICAL_STAGES


def test_sector_normalization():
    assert normalize_sector("artificial intelligence & llms") == "AI/ML"
    assert normalize_sector("deep tech hardware") == "DeepTech"
    assert normalize_sector("agri fintech") in ["FinTech", "AgriTech"]
    assert normalize_sector("electric vehicle charging") == "EV/Mobility"
    assert normalize_sector("drones and aerospace") in ["SpaceTech", "Defence"]
    assert normalize_sector("cross sector") == "All Sectors"


def test_sectors_list_normalization():
    res = normalize_sectors(["FinTech", "Banking", "AI"])
    assert "FinTech" in res
    assert "AI/ML" in res
    
    # Universal returns All Sectors
    all_res = normalize_sectors(["Sector Agnostic"])
    assert all_res == ["All Sectors"]


def test_state_normalization():
    code, name = normalize_state("Karnataka")
    assert code == "KA"
    assert name == "Karnataka"

    code, name = normalize_state("delhi ncr")
    assert code == "DL"
    assert name == "Delhi"

    code, name = normalize_state("Pan-India")
    assert code == "PAN"
    assert name == "Pan-India"


def test_benefit_type_normalization():
    assert normalize_benefit_type("Seed Grant") == "grant"
    assert normalize_benefit_type("Soft Loan") == "debt"
    assert normalize_benefit_type("Convertible Debenture") == "equity"
    assert normalize_benefit_type("Credit Guarantee Fund") == "credit_guarantee"
    assert normalize_benefit_type("Capital Subsidy") == "subsidy"


def test_entity_type_normalization():
    assert normalize_entity_type("Private Limited") == "pvt_ltd"
    assert normalize_entity_type("Limited Liability Partnership (LLP)") == "llp"
    assert normalize_entity_type("Any legal entity") == "any"


def test_eligibility_evaluator_eligible_profile():
    profile = {
        "startup_name": "TestAI",
        "sector": "AI/ML",
        "stage": "Prototype/MVP",
        "state": "Karnataka",
        "entity_type": "pvt_ltd",
        "dpiit_registered": True,
        "startup_age_years": 2
    }
    
    eligibility = {
        "dpiit_required": True,
        "entity_types": ["pvt_ltd", "llp"],
        "stages": ["Idea", "Prototype/MVP"],
        "sectors": ["AI/ML", "DeepTech"],
        "states": ["pan_india", "karnataka"],
        "startup_age_years": {"max": 5}
    }
    
    result = EligibilityEvaluator.evaluate(profile, eligibility)
    assert result["is_eligible"] is True
    assert result["hard_excluded"] is False
    assert result["score"] >= 80
    assert result["criteria"]["dpiit"]["status"] == "met"
    assert result["criteria"]["stage"]["status"] == "met"
    assert len(result["unlock_actions"]) == 0


def test_eligibility_evaluator_hard_exclusion():
    profile = {
        "startup_name": "TestAgri",
        "sector": "AgriTech",
        "stage": "Early Revenue",
        "state": "Maharashtra",
        "entity_type": "proprietorship",
        "dpiit_registered": False,
        "startup_age_years": 4
    }
    
    # Scheme requires DPIIT and Pvt Ltd
    eligibility = {
        "dpiit_required": True,
        "entity_types": ["pvt_ltd"],
        "stages": ["Prototype/MVP", "Early Revenue"],
        "sectors": ["AgriTech"],
        "states": ["pan_india"],
        "startup_age_years": {"max": 5}
    }
    
    result = EligibilityEvaluator.evaluate(profile, eligibility)
    assert result["is_eligible"] is False
    assert result["hard_excluded"] is True
    assert result["score"] <= 40
    assert result["criteria"]["dpiit"]["status"] == "not_met"
    assert result["criteria"]["entity_type"]["status"] == "not_met"
    assert len(result["unlock_actions"]) >= 2
    assert any("DPIIT" in a for a in result["unlock_actions"])
