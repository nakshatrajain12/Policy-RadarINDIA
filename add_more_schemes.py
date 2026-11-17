import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

client = create_client(supabase_url, supabase_key)

ADDITIONAL_SCHEMES = [
    # --- KARNATAKA ---
    {
        "scheme_name": "Idea2PoC (Elevate 100) Grant",
        "ministry": "Government of Karnataka (Dept of Electronics, IT, Bt)",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "total_budget_allocated": 250000000,
        "startup_stage": ["Ideation", "Validation", "Early Traction"],
        "sector_eligibility": ["DeepTech", "Artificial Intelligence", "BioTech", "AgriTech", "CleanTech", "FinTech"],
        "category": "Grant",
        "geographic_restriction": "Karnataka",
        "status": "Active",
        "source_url": "https://startup.karnataka.gov.in/elevate",
        "application_portal": "https://startup.karnataka.gov.in",
        "nlp_summary": "Karnataka's flagship ELEVATE scheme offers up to ₹50 Lakhs equity-free grant to early-stage tech innovators registered in Karnataka to build and scale prototypes."
    },
    {
        "scheme_name": "Karnataka Women Entrepreneur Innovation Fund (ELEVATE WomEN)",
        "ministry": "Government of Karnataka",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "total_budget_allocated": 100000000,
        "startup_stage": ["Ideation", "Validation"],
        "sector_eligibility": ["All Sectors", "DeepTech", "HealthTech", "EdTech"],
        "category": "Women Special",
        "geographic_restriction": "Karnataka",
        "status": "Active",
        "source_url": "https://startup.karnataka.gov.in",
        "application_portal": "https://startup.karnataka.gov.in",
        "nlp_summary": "Dedicated funding of up to ₹50 Lakhs for women-led startups in Karnataka with at least 51% female ownership."
    },
    # --- KERALA ---
    {
        "scheme_name": "KSUM Idea Grant & Early Scaleup Fund",
        "ministry": "Kerala Startup Mission (KSUM)",
        "funding_type": "Grant",
        "max_funding_amount": 1500000,
        "total_budget_allocated": 150000000,
        "startup_stage": ["Ideation", "Validation"],
        "sector_eligibility": ["Hardware", "AI", "HealthTech", "CleanTech", "SaaS"],
        "category": "Grant",
        "geographic_restriction": "Kerala",
        "status": "Active",
        "source_url": "https://startupmission.kerala.gov.in/schemes",
        "application_portal": "https://startupmission.kerala.gov.in",
        "nlp_summary": "KSUM provides up to ₹15 Lakhs Idea Grants for R&D prototype development and commercial viability testing."
    },
    {
        "scheme_name": "KSUM Soft Loan for Working Capital",
        "ministry": "Kerala Startup Mission (KSUM)",
        "funding_type": "Soft Loan",
        "max_funding_amount": 3000000,
        "total_budget_allocated": 200000000,
        "startup_stage": ["Early Traction", "Scaling"],
        "sector_eligibility": ["All Sectors", "IT", "DeepTech"],
        "category": "Debt / Soft Loan",
        "geographic_restriction": "Kerala",
        "status": "Active",
        "source_url": "https://startupmission.kerala.gov.in",
        "application_portal": "https://startupmission.kerala.gov.in",
        "nlp_summary": "Low-interest soft loans up to ₹30 Lakhs to meet initial work order and government tender execution obligations."
    },
    # --- TELANGANA ---
    {
        "scheme_name": "T-Fund Seed Capital Scheme",
        "ministry": "Information Technology, E&C Dept, Government of Telangana",
        "funding_type": "Equity / Convertible Debt",
        "max_funding_amount": 10000000,
        "total_budget_allocated": 650000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["Artificial Intelligence", "FinTech", "HealthTech", "SaaS", "Mobility"],
        "category": "Seed Fund",
        "geographic_restriction": "Telangana",
        "status": "Active",
        "source_url": "https://t-hub.co/t-fund",
        "application_portal": "https://t-hub.co",
        "nlp_summary": "Telangana's T-Fund co-invests between ₹25 Lakhs to ₹1 Crore alongside recognized angel networks for Telangana registered startups."
    },
    # --- MAHARASHTRA ---
    {
        "scheme_name": "Maharashtra Startup Week Work Order Grant",
        "ministry": "Maharashtra State Innovation Society (MSInS)",
        "funding_type": "Work Order Grant",
        "max_funding_amount": 1500000,
        "total_budget_allocated": 100000000,
        "startup_stage": ["Early Traction", "Scaling"],
        "sector_eligibility": ["GovTech", "HealthTech", "AgriTech", "Smart City", "FinTech"],
        "category": "Grant",
        "geographic_restriction": "Maharashtra",
        "status": "Active",
        "source_url": "https://msins.in",
        "application_portal": "https://msins.in",
        "nlp_summary": "Top 24 startups receive pilot government work orders up to ₹15 Lakhs to implement solutions directly with Maharashtra Government departments."
    },
    # --- GUJARAT ---
    {
        "scheme_name": "Student Startup & Innovation Policy (SSIP 2.0)",
        "ministry": "Education Dept, Government of Gujarat",
        "funding_type": "Grant",
        "max_funding_amount": 2500000,
        "total_budget_allocated": 500000000,
        "startup_stage": ["Ideation", "Validation"],
        "sector_eligibility": ["All Sectors", "Robotics", "CleanTech", "AgriTech"],
        "category": "Grant",
        "geographic_restriction": "Gujarat",
        "status": "Active",
        "source_url": "https://ssipgujarat.in",
        "application_portal": "https://ssipgujarat.in",
        "nlp_summary": "Grants of ₹2.5 Lakhs for student POCs and up to ₹25 Lakhs via i-Hub for commercial prototyping and patent filing."
    },
    # --- RAJASTHAN ---
    {
        "scheme_name": "iStart Rajasthan Viability & Sustenance Grant",
        "ministry": "Dept of IT & Communication, Government of Rajasthan",
        "funding_type": "Grant",
        "max_funding_amount": 2500000,
        "total_budget_allocated": 300000000,
        "startup_stage": ["Ideation", "Validation", "Early Traction"],
        "sector_eligibility": ["All Sectors", "AgriTech", "TourismTech", "DeepTech"],
        "category": "Grant",
        "geographic_restriction": "Rajasthan",
        "status": "Active",
        "source_url": "https://istart.rajasthan.gov.in",
        "application_portal": "https://istart.rajasthan.gov.in",
        "nlp_summary": "Offers sustenance allowances of ₹20,000/month, prototype grants up to ₹5 Lakhs, and viability grants up to ₹25 Lakhs for rated iStart startups."
    },
    # --- ODISHA ---
    {
        "scheme_name": "Startup Odisha Monthly Allowance & Seed Capital Assistance",
        "ministry": "MSME Department, Government of Odisha",
        "funding_type": "Grant / Allowance",
        "max_funding_amount": 1600000,
        "total_budget_allocated": 200000000,
        "startup_stage": ["Ideation", "Validation"],
        "sector_eligibility": ["All Sectors", "BioTech", "IT", "CleanTech"],
        "category": "Grant",
        "geographic_restriction": "Odisha",
        "status": "Active",
        "source_url": "https://startupodisha.gov.in",
        "application_portal": "https://startupodisha.gov.in",
        "nlp_summary": "Monthly allowance of ₹20,000/month for 1 year plus a one-time product development and marketing grant up to ₹16 Lakhs."
    },
    # --- TAMIL NADU ---
    {
        "scheme_name": "TANSEED (Tamil Nadu Startup Seed Fund)",
        "ministry": "Tamil Nadu Startup and Innovation Mission (StartupTN)",
        "funding_type": "Grant",
        "max_funding_amount": 1500000,
        "total_budget_allocated": 300000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["Climate Action", "AgriTech", "DeepTech", "HealthTech", "Women-Led"],
        "category": "Seed Fund",
        "geographic_restriction": "Tamil Nadu",
        "status": "Active",
        "source_url": "https://startuptn.in/tanseed",
        "application_portal": "https://startuptn.in",
        "nlp_summary": "TANSEED provides ₹15 Lakhs equity-free seed grant in 3 tranches to green and deep-tech startups based in Tamil Nadu."
    },
    # --- FINTECH CENTRAL ---
    {
        "scheme_name": "IFSCA FinTech Incentive Scheme (GIFT City)",
        "ministry": "International Financial Services Centres Authority (IFSCA)",
        "funding_type": "Grant / Incentive",
        "max_funding_amount": 10000000,
        "total_budget_allocated": 450000000,
        "startup_stage": ["Validation", "Early Traction", "Scaling"],
        "sector_eligibility": ["FinTech", "InsurTech", "RegTech", "Web3", "Blockchain"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://ifsca.gov.in",
        "application_portal": "https://ifsca.gov.in",
        "nlp_summary": "Grants up to ₹1 Crore for regulatory sandbox testing, proof-of-concept, and global market expansion for FinTechs operating in GIFT City."
    },
    {
        "scheme_name": "RBI Regulatory Sandbox Cohort Financing & Support",
        "ministry": "Reserve Bank of India (RBI)",
        "funding_type": "Regulatory Sandbox & Mentorship",
        "max_funding_amount": 0,
        "total_budget_allocated": 50000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["FinTech", "Digital Payments", "Cross-Border Remittances", "Lending"],
        "category": "Incubation / Sandbox",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://rbi.org.in",
        "application_portal": "https://rbi.org.in",
        "nlp_summary": "Live testing of innovative financial products with relaxation in regulatory norms across designated thematic cohorts."
    },
    # --- HEALTHTECH & BIOTECH ---
    {
        "scheme_name": "BIRAC SPARSH (Social Innovation Immersion Programme)",
        "ministry": "Dept of Biotechnology (DBT), Ministry of Science & Technology",
        "funding_type": "Grant",
        "max_funding_amount": 5000000,
        "total_budget_allocated": 250000000,
        "startup_stage": ["Ideation", "Validation"],
        "sector_eligibility": ["HealthTech", "BioTech", "Medical Devices", "Sanitation"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://birac.nic.in",
        "application_portal": "https://birac.nic.in",
        "nlp_summary": "Grants up to ₹50 Lakhs for developing affordable biotech and healthcare innovations addressing pressing societal healthcare needs."
    },
    {
        "scheme_name": "ICMR Innovation & Medical Device Commercialization Fund",
        "ministry": "Indian Council of Medical Research (ICMR)",
        "funding_type": "Grant",
        "max_funding_amount": 10000000,
        "total_budget_allocated": 400000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["HealthTech", "MedTech", "Diagnostics", "AI Diagnostics"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://main.icmr.nic.in",
        "application_portal": "https://main.icmr.nic.in",
        "nlp_summary": "Comprehensive clinical validation and fast-track grants up to ₹1 Crore for indigenous biomedical devices and diagnostic kits."
    },
    # --- AGRITECH ---
    {
        "scheme_name": "NABARD Catalyst & Agri-SURE Fund",
        "ministry": "National Bank for Agriculture and Rural Development (NABARD)",
        "funding_type": "Blended Capital / Equity",
        "max_funding_amount": 25000000,
        "total_budget_allocated": 7500000000,
        "startup_stage": ["Early Traction", "Scaling"],
        "sector_eligibility": ["AgriTech", "Rural Innovation", "Supply Chain", "Climate Farming"],
        "category": "Venture Fund",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://nabard.org",
        "application_portal": "https://nabard.org",
        "nlp_summary": "A massive ₹750 Crore blended capital fund providing seed capital and scale-up equity up to ₹2.5 Crore for tech-driven agricultural ventures."
    },
    {
        "scheme_name": "RKVY-RAFTAAR Agri-Business Incubation (R-ABI) Seed Grant",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "funding_type": "Grant",
        "max_funding_amount": 2500000,
        "total_budget_allocated": 350000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["AgriTech", "Food Processing", "Organic Farming", "Agri IoT"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://rkvy.nic.in",
        "application_portal": "https://rkvy.nic.in",
        "nlp_summary": "Grants of ₹5 Lakhs (Pre-Seed/Idea) and up to ₹25 Lakhs (Seed Stage) for innovative startups in agriculture and allied domains."
    },
    # --- CLEANTECH & EV ---
    {
        "scheme_name": "PM E-DRIVE / FAME Advanced EV Startup Innovation Challenge",
        "ministry": "Ministry of Heavy Industries",
        "funding_type": "Subsidy / Grant",
        "max_funding_amount": 15000000,
        "total_budget_allocated": 10900000000,
        "startup_stage": ["Validation", "Early Traction", "Scaling"],
        "sector_eligibility": ["Electric Vehicles", "CleanTech", "Battery Tech", "Charging Infrastructure"],
        "category": "Grant / Incentive",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://heavyindustries.gov.in",
        "application_portal": "https://heavyindustries.gov.in",
        "nlp_summary": "Incentives and R&D grants up to ₹1.5 Crore for indigenous EV powertrain, fast charging, and cell manufacturing startups."
    },
    {
        "scheme_name": "Waste to Wealth Mission – Swachhata Startup Challenge",
        "ministry": "Office of the Principal Scientific Adviser to GoI",
        "funding_type": "Grant",
        "max_funding_amount": 2500000,
        "total_budget_allocated": 100000000,
        "startup_stage": ["Ideation", "Validation"],
        "sector_eligibility": ["CleanTech", "Circular Economy", "Waste Management", "Renewable Energy"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://psa.gov.in",
        "application_portal": "https://psa.gov.in",
        "nlp_summary": "Grants up to ₹25 Lakhs to support startups converting plastic, electronic, and municipal solid waste into commercially viable products."
    },
    # --- AI, EDTECH & SAAS ---
    {
        "scheme_name": "IndiaAI GPU Compute Subsidy & Innovation Challenge",
        "ministry": "Ministry of Electronics & Information Technology (MeitY)",
        "funding_type": "Compute Voucher & Grant",
        "max_funding_amount": 10000000,
        "total_budget_allocated": 103720000000,
        "startup_stage": ["Ideation", "Validation", "Early Traction", "Scaling"],
        "sector_eligibility": ["Artificial Intelligence", "Generative AI", "LLMs", "DeepTech"],
        "category": "Compute Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://indiaai.gov.in",
        "application_portal": "https://indiaai.gov.in",
        "nlp_summary": "Part of the ₹10,372 Crore IndiaAI Mission offering subsidized access to 10,000+ GPUs and direct financial grants up to ₹1 Crore for foundational AI models."
    },
    {
        "scheme_name": "AICTE-NEAT EdTech Acceleration Programme",
        "ministry": "Ministry of Education & AICTE",
        "funding_type": "Revenue Share & Distribution",
        "max_funding_amount": 5000000,
        "total_budget_allocated": 200000000,
        "startup_stage": ["Early Traction", "Scaling"],
        "sector_eligibility": ["EdTech", "SkillTech", "AR/VR Learning"],
        "category": "Gov Distribution",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://neat.aicte-india.org",
        "application_portal": "https://neat.aicte-india.org",
        "nlp_summary": "Direct distribution to 50 Lakh+ higher education students across India through a national portal, with seed grants up to ₹50 Lakhs for top learning tech."
    },
    # --- DEFENSE & SPACETECH ---
    {
        "scheme_name": "iDEX Prime (Defence Innovation Organisation)",
        "ministry": "Department of Defence Production, Ministry of Defence",
        "funding_type": "Grant",
        "max_funding_amount": 100000000,
        "total_budget_allocated": 5000000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["Defence", "Aerospace", "Cybersecurity", "Drones", "AI"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://idex.gov.in",
        "application_portal": "https://idex.gov.in",
        "nlp_summary": "Flagship defense grant offering up to ₹10 Crore for solving strategic challenges for the Indian Army, Navy, Air Force, and Coast Guard."
    },
    {
        "scheme_name": "IN-SPACe Seed Fund & Orbital Launch Incentive",
        "ministry": "Department of Space (ISRO / IN-SPACe)",
        "funding_type": "Grant & Facility Subsidy",
        "max_funding_amount": 20000000,
        "total_budget_allocated": 1000000000,
        "startup_stage": ["Validation", "Early Traction"],
        "sector_eligibility": ["SpaceTech", "Satellites", "Propulsion", "Remote Sensing"],
        "category": "Grant",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://inspace.gov.in",
        "application_portal": "https://inspace.gov.in",
        "nlp_summary": "Grants up to ₹2 Crore and free access to ISRO testing facilities, launch pads, and ground station data for private space startups."
    },
    # --- WOMEN & INCLUSION ---
    {
        "scheme_name": "NITI Aayog WEP (Women Entrepreneurship Platform) Seed Grants",
        "ministry": "NITI Aayog",
        "funding_type": "Grant & Mentorship",
        "max_funding_amount": 2500000,
        "total_budget_allocated": 300000000,
        "startup_stage": ["Ideation", "Validation", "Early Traction"],
        "sector_eligibility": ["All Sectors", "Women-Led", "Social Impact", "Handicrafts"],
        "category": "Women Special",
        "geographic_restriction": "Pan-India",
        "status": "Active",
        "source_url": "https://wep.gov.in",
        "application_portal": "https://wep.gov.in",
        "nlp_summary": "Comprehensive platform providing seed capital up to ₹25 Lakhs, financial literacy, and corporate mentorship specifically for women founders."
    }
]

def add_schemes():
    inserted = 0
    for s in ADDITIONAL_SCHEMES:
        try:
            client.table("schemes_clean").upsert(s, on_conflict="scheme_name, ministry").execute()
            inserted += 1
            print(f"Upserted: {s['scheme_name']}")
        except Exception as e:
            print(f"Error {s['scheme_name']}: {e}")
    print(f"\nCompleted! Total new schemes upserted: {inserted}")

if __name__ == "__main__":
    add_schemes()

