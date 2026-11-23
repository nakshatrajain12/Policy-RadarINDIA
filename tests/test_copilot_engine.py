"""
Unit tests for Policy Radar Copilot Engine:
- format_inr
- intent classification
- profile-aware DPIIT logic
- early stage query filtering
- reachable source == 'llm' when API key is set
"""

import os
import pytest
from unittest.mock import patch
from pipeline.formatting import format_inr
from pipeline.copilot_engine import CopilotEngine, classify_intent

# Mock minimal schemes dataset
MOCK_SCHEMES = [
    {
        "id": "s1",
        "scheme_name": "Startup India Seed Fund Scheme (SISFS)",
        "ministry": "Ministry of Commerce and Industry",
        "funding_type": "Grant & Debt",
        "max_funding_amount": 5000000,  # 50 Lakhs
        "startup_stage": ["Idea", "Prototype", "Early Traction"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Pan India",
        "dpiit_required": True,
        "nlp_summary": "Financial assistance to early stage startups for proof of concept and prototype development."
    },
    {
        "id": "s2",
        "scheme_name": "BIRAC Biotechnology Ignition Grant (BIG)",
        "ministry": "Ministry of Science and Technology (DBT)",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,  # 50 Lakhs
        "startup_stage": ["Idea", "Prototype"],
        "sector_eligibility": ["Biotech", "HealthTech", "AgriTech"],
        "geographic_restriction": "Pan India",
        "dpiit_required": False,
        "nlp_summary": "Fosters biotechnology and healthcare innovation from ideation to functional validation."
    },
    {
        "id": "s3",
        "scheme_name": "Fund of Funds for Startups (FFS) via SIDBI",
        "ministry": "Ministry of Commerce and Industry (DPIIT / SIDBI)",
        "funding_type": "Fund of Funds",
        "max_funding_amount": 250000000,  # 25 Cr
        "startup_stage": ["Growth", "Scaling"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Pan India",
        "dpiit_required": True,
        "nlp_summary": "Provides capital to SEBI-registered Alternative Investment Funds for downstream investment."
    },
    {
        "id": "s4",
        "scheme_name": "Karnataka ELEVATE 100",
        "ministry": "Government of Karnataka",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,  # 50 Lakhs
        "startup_stage": ["Idea", "Prototype"],
        "sector_eligibility": ["IT", "AI", "AgriTech", "CleanTech"],
        "geographic_restriction": "Karnataka",
        "dpiit_required": False,
        "nlp_summary": "Idea2PoC grant by Government of Karnataka for innovative startups."
    },
    {
        "id": "s5",
        "scheme_name": "Unstated Cap Pilot Scheme",
        "ministry": "Ministry of Electronics and IT",
        "funding_type": "Grant",
        "max_funding_amount": 0,  # Unstated
        "startup_stage": ["Idea"],
        "sector_eligibility": ["AI / Machine Learning"],
        "geographic_restriction": "Pan India",
        "dpiit_required": False,
        "nlp_summary": "Pilot sandbox with unstated funding amount."
    }
]


# ── 1. format_inr Tests ────────────────────────────────────────────────────────
def test_format_inr():
    assert format_inr(None) == "Amount not specified"
    assert format_inr(0) == "Amount not specified"
    assert format_inr(-100) == "Amount not specified"
    assert format_inr("invalid") == "Amount not specified"

    # Crores (>= 1 Cr)
    assert format_inr(10_000_000) == "₹1 Cr"
    assert format_inr(100_000_000) == "₹10 Cr"
    assert format_inr(25_000_000) == "₹2.5 Cr"
    assert format_inr(250_000_000) == "₹25 Cr"

    # Lakhs (>= 1 Lakh)
    assert format_inr(500_000) == "₹5 Lakhs"
    assert format_inr(1_500_000) == "₹15 Lakhs"
    assert format_inr(5_000_000) == "₹50 Lakhs"

    # Plain rupees
    assert format_inr(50_000) == "₹50,000"

    # Verify no broken formats
    for amt in [0, None, 500_000, 100_000_000]:
        res = format_inr(amt)
        assert "₹0.0L" not in res
        assert "₹1000.0L" not in res


# ── 2. Intent Routing Tests ────────────────────────────────────────────────────
def test_intent_routing_word_boundaries():
    # 'Filter explorer by Ai' should route to filter_sector, NOT general query or loop
    intent, params = classify_intent("Filter explorer by Ai")
    assert intent == "filter_sector"
    assert params["sector"] == "AI / Machine Learning"

    # 'maintain' must NOT match 'ai'
    intent, _ = classify_intent("How do we maintain compliance?")
    assert intent == "general_query"

    # 'against' must NOT match 'ai'
    intent, _ = classify_intent("Can we appeal against a rejection?")
    assert intent == "general_query"

    # 'Fund of Funds ... (DPIIT / ...)' must route to scheme inquiry, NOT generic DPIIT definition
    intent, params = classify_intent("Fund of Funds for Startups (FFS) via SIDBI** (DPIIT / Small Industries Bank)")
    assert intent == "scheme_inquiry"
    assert "Fund of Funds" in params["query"]

    # Chip payload takes direct priority
    chip = {"intent": "filter_grants"}
    intent, _ = classify_intent("Random text", chip_payload=chip)
    assert intent == "filter_grants"


# ── 3. Profile-Aware DPIIT Tests ───────────────────────────────────────────────
def test_profile_aware_dpiit_when_registered():
    profile = {
        "startupName": "Spotnxt",
        "sector": "AI / Machine Learning",
        "stage": "Early Revenue",
        "state": "Pan-India",
        "dpiitRegistered": True
    }
    result = CopilotEngine.answer_query(
        query="Which schemes require DPIIT?",
        schemes=MOCK_SCHEMES,
        user_profile=profile
    )
    ans = result["answer"]
    assert "Recognized (Verified) ✓" in ans
    assert "Applying for DPIIT Startup Recognition takes" not in ans
    assert "Section 80-IAC" in ans
    assert result["source"] == "fast_path"


def test_profile_aware_dpiit_when_pending():
    profile = {
        "startupName": "KisanAI Soil Health",
        "sector": "AgriTech",
        "stage": "Idea",
        "state": "Karnataka",
        "dpiitRegistered": False
    }
    result = CopilotEngine.answer_query(
        query="Which schemes require DPIIT?",
        schemes=MOCK_SCHEMES,
        user_profile=profile
    )
    ans = result["answer"]
    assert "Pending Registration" in ans
    assert "Applying for DPIIT Startup Recognition takes" in ans
    assert result["source"] == "fast_path"


# ── 4. Early-Stage Query Tests ─────────────────────────────────────────────────
def test_early_stage_query():
    profile = {
        "startupName": "KisanAI",
        "sector": "AgriTech",
        "stage": "Idea",
        "state": "Karnataka",
        "dpiitRegistered": False
    }
    result = CopilotEngine.answer_query(
        query="Top 5 early stage grants",
        schemes=MOCK_SCHEMES,
        user_profile=profile
    )
    ans = result["answer"]
    assert "Fund of Funds for Startups (FFS) via SIDBI" not in ans  # Growth fund should not be top early stage
    assert "₹50 Lakhs" in ans
    assert "₹0.0L" not in ans
    assert "₹1000.0L" not in ans


# ── 5. Reachable source == 'llm' when API key is set ───────────────────────────
def test_source_llm_reachable_when_api_key_set():
    profile = {
        "startupName": "Spotnxt",
        "sector": "AI / Machine Learning",
        "stage": "Early Revenue",
        "state": "Pan-India",
        "dpiitRegistered": True
    }

    # Patch environment and chat_with_agent
    with patch.dict(os.environ, {"GEMINI_API_KEY": "dummy_test_key_12345"}), \
         patch("pipeline.llm_service.chat_with_agent", return_value="Here is grounded strategic advice for your venture."):
        result = CopilotEngine.answer_query(
            query="Can you explain our strategic cross-subsidy path?",
            schemes=MOCK_SCHEMES,
            user_profile=profile,
            history=[{"role": "user", "content": "Hello"}]
        )
        assert result["source"] == "llm"
        assert result["answer"] == "Here is grounded strategic advice for your venture."
        assert len(result.get("sources", [])) > 0
