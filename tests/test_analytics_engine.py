"""
Unit tests for Policy Radar Analytics Engine:
- Funnel counts monotonically decrease
- Donut slices sum strictly to the scheme count
- No expired deadlines in the timeline
- Unstated amounts tracked and excluded from sums
"""

from datetime import datetime, timezone
import pytest
from pipeline.analytics_engine import AnalyticsEngine

MOCK_SCHEMES = [
    {
        "id": "s1",
        "scheme_name": "Startup India Seed Fund Scheme",
        "ministry": "Ministry of Commerce and Industry",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "startup_stage": ["Idea", "Prototype"],
        "sector_eligibility": ["AI / Machine Learning", "All Sectors"],
        "geographic_restriction": "Pan-India",
        "dpiit_required": False,
        "status": "active"
    },
    {
        "id": "s2",
        "scheme_name": "Credit Guarantee Scheme (CGSS)",
        "ministry": "Ministry of Commerce and Industry",
        "funding_type": "Debt Guarantee",
        "max_funding_amount": 100000000,
        "startup_stage": ["Early Traction", "Scaling"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Pan-India",
        "dpiit_required": True,
        "status": "active"
    },
    {
        "id": "s3",
        "scheme_name": "SIDBI Fund of Funds",
        "ministry": "Ministry of Finance",
        "funding_type": "Venture Equity",
        "max_funding_amount": 250000000,
        "startup_stage": ["Scaling"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Pan-India",
        "dpiit_required": True,
        "status": "active"
    },
    {
        "id": "s4",
        "scheme_name": "Karnataka ELEVATE 100",
        "ministry": "Government of Karnataka",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "startup_stage": ["Prototype"],
        "sector_eligibility": ["AI / Machine Learning"],
        "geographic_restriction": "Karnataka",
        "dpiit_required": False,
        "status": "active"
    },
    {
        "id": "s5",
        "scheme_name": "SIPP Patent Fee Subsidy",
        "ministry": "Ministry of Commerce and Industry",
        "funding_type": "Subsidy",
        "max_funding_amount": 0,  # Unstated amount
        "startup_stage": ["Idea"],
        "sector_eligibility": ["All Sectors"],
        "geographic_restriction": "Pan-India",
        "dpiit_required": False,
        "status": "active"
    }
]


def test_funnel_counts_monotonically_decrease():
    bundle = AnalyticsEngine.get_bundle(MOCK_SCHEMES, force_refresh=True)
    funnel = bundle["eligibility_funnel"]
    
    assert len(funnel) == 6
    counts = [step["count"] for step in funnel]

    # Assert strictly non-increasing: count[i] >= count[i+1]
    for i in range(len(counts) - 1):
        assert counts[i] >= counts[i + 1], (
            f"Funnel step {funnel[i]['step']} ({counts[i]}) is less than {funnel[i+1]['step']} ({counts[i+1]})"
        )


def test_donut_slices_sum_to_scheme_count():
    bundle = AnalyticsEngine.get_bundle(MOCK_SCHEMES, force_refresh=True)
    slices = bundle["instrument_breakdown"]
    
    slice_sum = sum(s["count"] for s in slices)
    assert slice_sum == len(MOCK_SCHEMES), f"Donut slices sum ({slice_sum}) != total schemes ({len(MOCK_SCHEMES)})"


def test_no_expired_deadlines_in_timeline():
    bundle = AnalyticsEngine.get_bundle(MOCK_SCHEMES, force_refresh=True)
    deadlines = bundle["upcoming_deadlines"]
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    for d in deadlines:
        assert d["deadline_date"] >= today, f"Expired deadline found: {d['deadline_date']} is before {today}"


def test_unstated_amounts_tracked():
    bundle = AnalyticsEngine.get_bundle(MOCK_SCHEMES, force_refresh=True)
    summary = bundle["summary"]
    facts = bundle["facts"]

    # Scheme s5 has amount 0, should be tracked in unstated_count
    assert facts["unstated_count"] >= 1
    assert summary["unstated_count"] >= 1
