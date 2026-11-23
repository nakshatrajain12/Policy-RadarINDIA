"""
Shared Currency & Metric Formatters for Policy Radar India
Provides standard format_inr function and data-quality helpers.
"""

from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

def format_inr(amount: Optional[Any]) -> str:
    """
    Standard INR currency formatter across Policy Radar India.
    Rules:
    - null / 0 / negative / invalid -> 'Amount not specified'
    - >= 1 Cr (10,000,000) -> '₹X Cr' (trim trailing .0 or .00)
    - >= 1 Lakh (100,000)  -> '₹X Lakhs' (trim trailing .0 or .00)
    - else -> plain formatted rupees with commas, e.g. '₹50,000'
    - Never outputs '₹0.0L' or '₹1000.0L'.
    """
    if amount is None:
        return "Amount not specified"

    try:
        val = float(amount)
    except (ValueError, TypeError):
        return "Amount not specified"

    if val <= 0:
        return "Amount not specified"

    if val >= 10_000_000:
        cr_val = val / 10_000_000
        # format with up to 2 decimal places and trim trailing zeros
        formatted = f"{cr_val:.2f}".rstrip("0").rstrip(".")
        return f"₹{formatted} Cr"
    elif val >= 100_000:
        lakh_val = val / 100_000
        formatted = f"{lakh_val:.2f}".rstrip("0").rstrip(".")
        return f"₹{formatted} Lakhs"
    else:
        return f"₹{int(val):,}"

def get_unstated_amount_schemes(schemes: List[Dict[str, Any]]) -> List[str]:
    """
    Identifies schemes with null or zero maximum funding amount.
    Logs them for data-quality audits.
    """
    unstated = []
    for s in schemes:
        amt = s.get("max_funding_amount")
        s_id = str(s.get("id") or s.get("scheme_id") or s.get("scheme_name") or "unknown")
        if amt is None:
            unstated.append(s_id)
        else:
            try:
                if float(amt) <= 0:
                    unstated.append(s_id)
            except (ValueError, TypeError):
                unstated.append(s_id)

    if unstated:
        logger.info("Data-Quality Audit: %d schemes have unstated/zero budget caps: %s", len(unstated), unstated[:10])
    return unstated
