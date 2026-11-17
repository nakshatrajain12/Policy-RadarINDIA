"""
Unit tests for SmartRecommender
Tests ranking, domain matching, unlock simulation, and women-led bonuses.
"""

import pytest
from pipeline.recommender_engine import SmartRecommender

MOCK_SCHEMES = [
    {
        "id": "1",
        "scheme_name": "Startup India Seed Fund Scheme",
        "ministry": "DPIIT",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "startup_stage": ["Idea", "Prototype/MVP"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Pan India",
        "dpiit_required": True,
        "nlp_summary": "SISFS early stage grant"
    },
    {
        "id": "2",
        "scheme_name": "Idea2PoC ELEVATE Karnataka",
        "ministry": "Govt of Karnataka",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "startup_stage": ["Idea", "Prototype/MVP"],
        "sector_eligibility": ["AI", "DeepTech", "AgriTech"],
        "geographic_restriction": "Karnataka",
        "dpiit_required": False,
        "nlp_summary": "Karnataka prototype grant"
    },
    {
        "id": "3",
        "scheme_name": "ELEVATE WomEN Karnataka",
        "ministry": "Govt of Karnataka",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "startup_stage": ["Idea"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Karnataka",
        "category": "Women Special",
        "dpiit_required": False,
        "nlp_summary": "Karnataka women grant"
    },
    {
        "id": "4",
        "scheme_name": "KSUM Idea Grant",
        "ministry": "Kerala Startup Mission",
        "funding_type": "Grant",
        "max_funding_amount": 1500000,
        "startup_stage": ["Idea"],
        "sector_eligibility": ["DeepTech", "Hardware"],
        "geographic_restriction": "Kerala",
        "dpiit_required": False,
        "nlp_summary": "Kerala idea grant"
    }
]

def test_karnataka_founder_recommends_karnataka_first():
    profile = {
        "sector": "AgriTech",
        "stage": "Idea",
        "state": "Karnataka",
        "dpiit_registered": True
    }
    res = SmartRecommender.recommend(profile, MOCK_SCHEMES)
    matches = res["matches"]
    assert len(matches) > 0
    # Top match should be Karnataka's ELEVATE or SISFS
    top_scheme_names = [m["name"] for m in matches[:2]]
    assert "Idea2PoC ELEVATE Karnataka" in top_scheme_names

def test_dpiit_unregistered_unlock_simulator():
    profile = {
        "sector": "AgriTech",
        "stage": "Idea",
        "state": "Pan-India",
        "dpiit_registered": False
    }
    res = SmartRecommender.recommend(profile, MOCK_SCHEMES)
    # SISFS requires DPIIT, so with dpiit_registered=False, it should appear in unlockable!
    unlockable_names = [u["name"] for u in res["unlockable"]]
    assert "Startup India Seed Fund Scheme" in unlockable_names
    assert res["unlock_insights"]["dpiit_unlock_count"] >= 1

def test_women_founder_bonus():
    profile_women = {
        "sector": "All Sectors",
        "stage": "Idea",
        "state": "Karnataka",
        "women_led": True
    }
    res_women = SmartRecommender.recommend(profile_women, MOCK_SCHEMES)
    women_scheme = next((m for m in res_women["matches"] if m["name"] == "ELEVATE WomEN Karnataka"), None)
    assert women_scheme is not None
    assert women_scheme["match_score"] >= 80
