"""
Controlled Taxonomies and Normalization Engine for Policy Radar India.
Single source of truth for all pipeline stages, recommender, and frontend.
"""

from typing import Dict, List, Optional, Set, Tuple
import re

# ═════════════════════════════════════════════════════════════
# 1. STARTUP STAGES (Canonical 4-Stage Model)
# ═════════════════════════════════════════════════════════════

CANONICAL_STAGES = [
    "Idea",             # Ideation, concept, problem-solution fit
    "Prototype/MVP",    # Proof of concept, lab validation, TRL 3-6
    "Early Revenue",    # Initial paying customers, seed traction, TRL 7-8
    "Growth/Scale-up"   # Scaling, Series A+, market expansion, TRL 9
]

STAGE_SYNONYMS: Dict[str, str] = {
    "idea": "Idea",
    "ideation": "Idea",
    "concept": "Idea",
    "pre-seed": "Idea",
    "problem-solution": "Idea",
    "prototype": "Prototype/MVP",
    "mvp": "Prototype/MVP",
    "validation": "Prototype/MVP",
    "proof of concept": "Prototype/MVP",
    "poc": "Prototype/MVP",
    "trl 3": "Prototype/MVP",
    "trl 4": "Prototype/MVP",
    "trl 5": "Prototype/MVP",
    "trl 6": "Prototype/MVP",
    "early traction": "Early Revenue",
    "early revenue": "Early Revenue",
    "commercialization": "Early Revenue",
    "seed": "Early Revenue",
    "first customer": "Early Revenue",
    "market entry": "Early Revenue",
    "growth": "Growth/Scale-up",
    "scaling": "Growth/Scale-up",
    "scale-up": "Growth/Scale-up",
    "scaleup": "Growth/Scale-up",
    "expansion": "Growth/Scale-up",
    "series a": "Growth/Scale-up",
    "series b": "Growth/Scale-up",
    "all": "All Stages"
}

def normalize_stage(raw: str) -> str:
    """Normalize a raw stage string into a canonical stage name."""
    cleaned = raw.lower().strip()
    for pattern, canonical in STAGE_SYNONYMS.items():
        if pattern in cleaned:
            return canonical
    return "Idea"

def normalize_stages(raw_list: List[str]) -> List[str]:
    """Normalize a list of stage tags, eliminating duplicates while preserving canonical order."""
    matched = set()
    for item in raw_list:
        if not item:
            continue
        cleaned = item.lower().strip()
        if cleaned in ["all", "all stages", "any"]:
            return CANONICAL_STAGES.copy()
        for pattern, canonical in STAGE_SYNONYMS.items():
            if pattern in cleaned and canonical != "All Stages":
                matched.add(canonical)
    
    result = [s for s in CANONICAL_STAGES if s in matched]
    return result if result else ["Idea"]


# ═════════════════════════════════════════════════════════════
# 2. SECTORS (~25 Controlled Sectors with Synonyms)
# ═════════════════════════════════════════════════════════════

CANONICAL_SECTORS = [
    "AI/ML",
    "DeepTech",
    "AgriTech",
    "HealthTech/BioTech",
    "FinTech",
    "CleanTech/Energy",
    "SpaceTech",
    "Defence",
    "EdTech",
    "Manufacturing/Hardware",
    "EV/Mobility",
    "Social Impact",
    "Women-Led",
    "Food Processing",
    "Textiles/Fashion",
    "SaaS/Enterprise",
    "Cybersecurity",
    "Robotics/IoT",
    "Waste Management/Circular Economy",
    "Smart City/GovTech",
    "Media/Gaming",
    "E-Commerce/Retail",
    "Water & Sanitation",
    "Logistics/Supply Chain",
    "All Sectors"
]

SECTOR_SYNONYMS: Dict[str, str] = {
    "artificial intelligence": "AI/ML",
    "machine learning": "AI/ML",
    "ai/ml": "AI/ML",
    "ai": "AI/ML",
    "generative ai": "AI/ML",
    "genai": "AI/ML",
    "llm": "AI/ML",
    "computer vision": "AI/ML",
    "nlp": "AI/ML",
    
    "deeptech": "DeepTech",
    "deep tech": "DeepTech",
    "quantum": "DeepTech",
    "semiconductor": "DeepTech",
    "photonics": "DeepTech",
    "nanotechnology": "DeepTech",
    
    "agritech": "AgriTech",
    "agriculture": "AgriTech",
    "farming": "AgriTech",
    "horticulture": "AgriTech",
    "fisheries": "AgriTech",
    "animal husbandry": "AgriTech",
    "dairy": "AgriTech",
    
    "healthtech": "HealthTech/BioTech",
    "biotech": "HealthTech/BioTech",
    "biotechnology": "HealthTech/BioTech",
    "medtech": "HealthTech/BioTech",
    "medical devices": "HealthTech/BioTech",
    "pharma": "HealthTech/BioTech",
    "healthcare": "HealthTech/BioTech",
    "diagnostics": "HealthTech/BioTech",
    
    "fintech": "FinTech",
    "finance": "FinTech",
    "banking": "FinTech",
    "insurtech": "FinTech",
    "regtech": "FinTech",
    "wealthtech": "FinTech",
    "payments": "FinTech",
    "lending": "FinTech",
    "web3": "FinTech",
    "blockchain": "FinTech",
    
    "cleantech": "CleanTech/Energy",
    "renewable energy": "CleanTech/Energy",
    "solar": "CleanTech/Energy",
    "green hydrogen": "CleanTech/Energy",
    "climate": "CleanTech/Energy",
    "sustainability": "CleanTech/Energy",
    
    "spacetech": "SpaceTech",
    "space": "SpaceTech",
    "satellite": "SpaceTech",
    "aerospace": "SpaceTech",
    "orbital": "SpaceTech",
    "propulsion": "SpaceTech",
    
    "defence": "Defence",
    "defense": "Defence",
    "military": "Defence",
    "security": "Defence",
    "drones": "Defence",
    "uav": "Defence",
    
    "edtech": "EdTech",
    "education": "EdTech",
    "e-learning": "EdTech",
    "skilltech": "EdTech",
    "upskilling": "EdTech",
    
    "ev": "EV/Mobility",
    "electric vehicles": "EV/Mobility",
    "mobility": "EV/Mobility",
    "battery": "EV/Mobility",
    "charging": "EV/Mobility",
    "automotive": "EV/Mobility",
    
    "manufacturing": "Manufacturing/Hardware",
    "hardware": "Manufacturing/Hardware",
    "electronics": "Manufacturing/Hardware",
    "industrial": "Manufacturing/Hardware",
    "machinery": "Manufacturing/Hardware",
    
    "women": "Women-Led",
    "women-led": "Women-Led",
    "female": "Women-Led",
    
    "food processing": "Food Processing",
    "foodtech": "Food Processing",
    "food": "Food Processing",
    "fmcg": "Food Processing",
    
    "textiles": "Textiles/Fashion",
    "apparel": "Textiles/Fashion",
    "fashion": "Textiles/Fashion",
    "handicrafts": "Textiles/Fashion",
    "handloom": "Textiles/Fashion",
    
    "saas": "SaaS/Enterprise",
    "software": "SaaS/Enterprise",
    "cloud": "SaaS/Enterprise",
    "enterprise": "SaaS/Enterprise",
    "b2b": "SaaS/Enterprise",
    
    "cybersecurity": "Cybersecurity",
    "infosec": "Cybersecurity",
    
    "robotics": "Robotics/IoT",
    "iot": "Robotics/IoT",
    "automation": "Robotics/IoT",
    
    "waste": "Waste Management/Circular Economy",
    "recycling": "Waste Management/Circular Economy",
    "circular economy": "Waste Management/Circular Economy",
    
    "smart city": "Smart City/GovTech",
    "govtech": "Smart City/GovTech",
    "urban": "Smart City/GovTech",
    
    "gaming": "Media/Gaming",
    "media": "Media/Gaming",
    "animation": "Media/Gaming",
    "entertainment": "Media/Gaming",
    
    "e-commerce": "E-Commerce/Retail",
    "ecommerce": "E-Commerce/Retail",
    "retail": "E-Commerce/Retail",
    "d2c": "E-Commerce/Retail",
    
    "water": "Water & Sanitation",
    "sanitation": "Water & Sanitation",
    "wastewater": "Water & Sanitation",
    
    "logistics": "Logistics/Supply Chain",
    "supply chain": "Logistics/Supply Chain",
    "warehousing": "Logistics/Supply Chain",
    
    "social impact": "Social Impact",
    "social": "Social Impact",
    "rural": "Social Impact",
    
    "all": "All Sectors",
    "all sectors": "All Sectors",
    "sector agnostic": "All Sectors",
    "any": "All Sectors",
    "cross sector": "All Sectors"
}

def normalize_sector(raw: str) -> str:
    """Normalize raw sector text into canonical sector name."""
    if not raw:
        return "All Sectors"
    cleaned = raw.lower().strip()
    for syn, canonical in SECTOR_SYNONYMS.items():
        if syn in cleaned:
            return canonical
    return "All Sectors"

def normalize_sectors(raw_list: List[str]) -> List[str]:
    """Normalize a list of raw sector tags into deduplicated canonical sectors."""
    matched = set()
    for item in raw_list:
        if not item:
            continue
        cleaned = item.lower().strip()
        if cleaned in ["all", "all sectors", "sector agnostic", "any", "cross sector"]:
            return ["All Sectors"]
        for syn, canonical in SECTOR_SYNONYMS.items():
            # Exact word or substring match
            if syn in cleaned and canonical != "All Sectors":
                matched.add(canonical)
    
    result = [s for s in CANONICAL_SECTORS if s in matched]
    return result if result else ["All Sectors"]


# ═════════════════════════════════════════════════════════════
# 3. INDIAN STATES & UNION TERRITORIES (ISO-3166-2:IN)
# ═════════════════════════════════════════════════════════════

STATES_AND_UTS: Dict[str, str] = {
    # Code -> Full Name
    "PAN": "Pan-India",
    "AN": "Andaman and Nicobar Islands",
    "AP": "Andhra Pradesh",
    "AR": "Arunachal Pradesh",
    "AS": "Assam",
    "BR": "Bihar",
    "CH": "Chandigarh",
    "CT": "Chhattisgarh",
    "DH": "Dadra and Nagar Haveli and Daman and Diu",
    "DL": "Delhi",
    "GA": "Goa",
    "GJ": "Gujarat",
    "HR": "Haryana",
    "HP": "Himachal Pradesh",
    "JK": "Jammu and Kashmir",
    "JH": "Jharkhand",
    "KA": "Karnataka",
    "KL": "Kerala",
    "LA": "Ladakh",
    "LD": "Lakshadweep",
    "MP": "Madhya Pradesh",
    "MH": "Maharashtra",
    "MN": "Manipur",
    "ML": "Meghalaya",
    "MZ": "Mizoram",
    "NL": "Nagaland",
    "OR": "Odisha",
    "PY": "Puducherry",
    "PB": "Punjab",
    "RJ": "Rajasthan",
    "SK": "Sikkim",
    "TN": "Tamil Nadu",
    "TS": "Telangana",
    "TR": "Tripura",
    "UP": "Uttar Pradesh",
    "UT": "Uttarakhand",
    "WB": "West Bengal"
}

STATE_NAME_TO_CODE: Dict[str, str] = {
    name.lower(): code for code, name in STATES_AND_UTS.items()
}
# Common aliases
STATE_NAME_TO_CODE.update({
    "pan-india": "PAN",
    "pan india": "PAN",
    "all india": "PAN",
    "india": "PAN",
    "central": "PAN",
    "national": "PAN",
    "delhi ncr": "DL",
    "new delhi": "DL",
    "orissa": "OR",
    "pondicherry": "PY",
    "bengal": "WB",
    "jammu": "JK",
    "kashmir": "JK"
})

def normalize_state(raw: str) -> Tuple[str, str]:
    """Return (state_code, state_name) normalized."""
    if not raw:
        return ("PAN", "Pan-India")
    cleaned = raw.lower().strip()
    
    # Check if raw is already a 2-3 char code
    raw_upper = raw.upper().strip()
    if raw_upper in STATES_AND_UTS:
        return (raw_upper, STATES_AND_UTS[raw_upper])
    
    for alias, code in STATE_NAME_TO_CODE.items():
        if alias in cleaned or cleaned in alias:
            return (code, STATES_AND_UTS[code])
            
    return ("PAN", "Pan-India")


# ═════════════════════════════════════════════════════════════
# 4. BENEFIT TYPES (Canonical Taxonomy)
# ═════════════════════════════════════════════════════════════

BENEFIT_TYPES = [
    "grant",            # Non-dilutive grant / financial aid
    "equity",           # Seed/Series funding for equity/convertible debt
    "debt",             # Low-interest soft loan or working capital
    "subsidy",          # Interest, capital or operational subsidy
    "tax",              # Tax exemption (e.g. 80-IAC, Angel Tax)
    "incubation",       # Physical space, labs, mentoring, infrastructure
    "mentoring",        # Advisory, cohort acceleration, masterclasses
    "market_access",    # Govt tenders, public procurement, work orders
    "credit_guarantee"  # Collateral-free credit backing (CGSS, CGTMSE)
]

BENEFIT_SYNONYMS: Dict[str, str] = {
    "grant": "grant",
    "equity-free": "grant",
    "seed fund": "grant",
    "allowance": "grant",
    "financial assistance": "grant",
    "voucher": "grant",
    "stipend": "grant",
    "prize": "grant",
    "poc fund": "grant",
    "equity": "equity",
    "convertible": "equity",
    "venture": "equity",
    "fund of funds": "equity",
    "loan": "debt",
    "soft loan": "debt",
    "debt": "debt",
    "term loan": "debt",
    "subsidy": "subsidy",
    "reimbursement": "subsidy",
    "subvention": "subsidy",
    "tax": "tax",
    "exemption": "tax",
    "rebate": "tax",
    "incubation": "incubation",
    "incubator": "incubation",
    "lab access": "incubation",
    "mentoring": "mentoring",
    "accelerator": "mentoring",
    "capacity building": "mentoring",
    "procurement": "market_access",
    "work order": "market_access",
    "tender": "market_access",
    "pilot": "market_access",
    "market access": "market_access",
    "guarantee": "credit_guarantee",
    "credit guarantee": "credit_guarantee"
}

def normalize_benefit_type(raw: str) -> str:
    """Normalize raw funding/benefit string into canonical benefit type."""
    if not raw:
        return "grant"
    cleaned = raw.lower().strip()
    for syn, canonical in BENEFIT_SYNONYMS.items():
        if syn in cleaned:
            return canonical
    return "grant"


# ═════════════════════════════════════════════════════════════
# 5. ENTITY TYPES
# ═════════════════════════════════════════════════════════════

ENTITY_TYPES = ["pvt_ltd", "llp", "partnership", "proprietorship", "unregistered_idea", "any"]

def normalize_entity_type(raw: str) -> str:
    if not raw:
        return "any"
    cleaned = raw.lower().strip()
    if "pvt" in cleaned or "private" in cleaned or "corp" in cleaned or "inc" in cleaned:
        return "pvt_ltd"
    if "llp" in cleaned or "limited liability" in cleaned:
        return "llp"
    if "partnership" in cleaned:
        return "partnership"
    if "proprietor" in cleaned or "sole" in cleaned:
        return "proprietorship"
    if "unregistered" in cleaned or "idea" in cleaned:
        return "unregistered_idea"
    return "any"
