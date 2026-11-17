import { Scheme } from "@/types";

export interface GrantDetails {
  grantTypeBadge: string;
  grantTypeCategory: "grant" | "debt" | "equity" | "subsidy";
  individualTicket: string;
  macroCeilingDisplay?: string;
  dilutionTerms: string;
  whoShouldOpt: string;
  whenToChoose: string;
  whenToAvoid: string;
}

export function formatSchemeGrantDetails(scheme: any): GrantDetails {
  const name = (scheme?.scheme_name || scheme?.name || "").toLowerCase();
  const rawType = (scheme.funding_type || "").toLowerCase();
  const summary = (scheme.nlp_summary || "").toLowerCase();
  const maxAmt = scheme.max_funding_amount || 0;

  // 1. Specialized parsing for prominent national programs
  if (name.includes("agriculture infrastructure fund") || name.includes("aif")) {
    return {
      grantTypeBadge: "Interest Subvention & Credit Guarantee",
      grantTypeCategory: "debt",
      individualTicket: "3% Interest Subvention on Bank Loans up to ₹2 Crore",
      macroCeilingDisplay: "Max Project Loan: ₹20.00 Cr (₹1 Lakh Cr Scheme Corpus)",
      dilutionTerms: "0% Equity Dilution (Bank credit with 3% govt interest rebate + CGTMSE cover)",
      whoShouldOpt: "Agritech, post-harvest supply chain, cold storage, and bio-farming ventures needing commercial bank credit for capital expenditure.",
      whenToChoose: "Choose if you are setting up post-harvest physical assets, packaging units, or warehouses and already have bank loan approval.",
      whenToAvoid: "Avoid if you are a pre-revenue software startup seeking early R&D prototype grants."
    };
  }

  if (name.includes("design linked incentive") || name.includes("dli")) {
    return {
      grantTypeBadge: "Capital Expenditure Reimbursement (50%)",
      grantTypeCategory: "subsidy",
      individualTicket: "50% Reimbursement of Design Capex (up to ₹15 Crore per company)",
      macroCeilingDisplay: "Deployment Incentive: 4% to 6% of Net Turnover",
      dilutionTerms: "0% Equity Taken (Statutory fiscal reimbursement on auditable EDA/tape-out invoices)",
      whoShouldOpt: "Fabless semiconductor, IC design, ASIC, SoC, and embedded hardware IP startups.",
      whenToChoose: "Choose if you are incurring substantial tape-out, EDA tool, foundry, or IP core license expenses.",
      whenToAvoid: "Avoid if your product is purely consumer software or SaaS without silicon/semiconductor design."
    };
  }

  if (name.includes("startup india seed fund") || name.includes("sisfs")) {
    return {
      grantTypeBadge: "PoC Grant + Convertible Debenture",
      grantTypeCategory: "grant",
      individualTicket: "₹20 Lakhs Grant (PoC/Prototype) + ₹50 Lakhs Convertible Debt",
      macroCeilingDisplay: "Max Seed Ticket: ₹70.00 Lakhs per Startup",
      dilutionTerms: "Grant is 100% equity-free; debenture converts at subsequent institutional valuation",
      whoShouldOpt: "Early-stage DPIIT-recognized startups across any sector seeking their first institutional seed round.",
      whenToChoose: "Choose if you have an initial concept or prototype and are incubated at a recognized incubator.",
      whenToAvoid: "Avoid if your startup is unregistered or has already raised >₹10 Lakhs in institutional venture capital."
    };
  }

  if (name.includes("birac") || name.includes("biotechnology ignition grant") || name.includes("big")) {
    return {
      grantTypeBadge: "100% Non-Dilutive Grant-in-Aid",
      grantTypeCategory: "grant",
      individualTicket: "Up to ₹50 Lakhs (100% Equity-Free in 3 Tranches)",
      macroCeilingDisplay: "Full PoC Grant: ₹50.00 Lakhs",
      dilutionTerms: "0% Equity Taken, 0% Debt, Zero Collateral (Non-dilutive grant-in-aid)",
      whoShouldOpt: "Biotech, medtech, diagnostics, agricultural biotech, and life sciences innovators with lab-validated concepts.",
      whenToChoose: "Choose if you need lab validation, animal studies, or proof-of-concept synthesis for deep biotech IP.",
      whenToAvoid: "Avoid if your innovation does not have a biological, biomedical, or agricultural biotechnology foundation."
    };
  }

  if (name.includes("nidhi-prayas") || name.includes("prayas")) {
    return {
      grantTypeBadge: "Prototyping Grant + Fab Lab Access",
      grantTypeCategory: "grant",
      individualTicket: "Up to ₹10 Lakhs for Physical Prototype Fabrication",
      macroCeilingDisplay: "Individual Prototype Grant: ₹10.00 Lakhs",
      dilutionTerms: "0% Equity Dilution (100% non-dilutive government prototyping fellowship)",
      whoShouldOpt: "Hardware, electronics, physical devices, IoT, robotics, and clean energy inventors.",
      whenToChoose: "Choose if you are an individual inventor, student, or pre-incorporation founder needing fab lab machines to build MVP.",
      whenToAvoid: "Avoid if you are building pure mobile apps, software, or e-commerce platforms."
    };
  }

  if (name.includes("elevate") || name.includes("idea2poc")) {
    return {
      grantTypeBadge: "State Grant-in-Aid (Milestone Based)",
      grantTypeCategory: "grant",
      individualTicket: "Up to ₹50 Lakhs Non-Dilutive Grant (Tranches of ₹20L + ₹20L + ₹10L)",
      macroCeilingDisplay: "Individual State Grant: ₹50.00 Lakhs",
      dilutionTerms: "0% Equity Taken (Department of Electronics, IT/Bt, Govt of Karnataka)",
      whoShouldOpt: "Karnataka-registered tech startups with early traction or working proof-of-concept.",
      whenToChoose: "Choose if you have a registered entity with Karnataka GSTIN and need equity-free scaling capital.",
      whenToAvoid: "Avoid if your entity is registered outside Karnataka or lacks a Karnataka operational office."
    };
  }

  if (name.includes("credit guarantee scheme for startups") || name.includes("cgss")) {
    return {
      grantTypeBadge: "Collateral-Free Credit Guarantee",
      grantTypeCategory: "debt",
      individualTicket: "Up to ₹10 Cr / ₹20 Cr Collateral-Free Bank Debt Guarantee",
      macroCeilingDisplay: "Govt Guarantee Cover: 75% to 85% of Default Risk",
      dilutionTerms: "Bank term debt or venture debt without personal property collateral mortgage",
      whoShouldOpt: "DPIIT-recognized startups with demonstrable revenue or venture debt eligibility seeking working capital.",
      whenToChoose: "Choose if banks are demanding personal collateral or property mortgages for business loans.",
      whenToAvoid: "Avoid if your startup has no revenue or cash flow to service debt interest."
    };
  }

  if (name.includes("atal incubation") || name.includes("aic") || name.includes("tbi")) {
    return {
      grantTypeBadge: "Incubator Seed Capital & Lab Facilities",
      grantTypeCategory: "grant",
      individualTicket: "₹20 Lakhs to ₹50 Lakhs Seed Funding via Incubator + Co-working",
      macroCeilingDisplay: "Host Institution Corpus: ₹10.00 Cr (Deployable across cohort startups)",
      dilutionTerms: "Typically 2% to 5% equity or grant-in-aid depending on host incubator policy",
      whoShouldOpt: "Founders seeking structured university incubation, mentorship, pilot testing, and investor networks.",
      whenToChoose: "Choose if you need lab equipment, specialized research facilities, and seed round access.",
      whenToAvoid: "Avoid if you already have independent office premises and institutional VC backing."
    };
  }

  if (name.includes("idex") || name.includes("aditi") || name.includes("defence")) {
    const isAditi = name.includes("aditi");
    return {
      grantTypeBadge: isAditi ? "Strategic Deep-Tech Grant (ADITI)" : "Defence Prototyping Grant (DISC)",
      grantTypeCategory: "grant",
      individualTicket: isAditi ? "Up to ₹25 Crore Grant-in-aid" : "₹1.5 Crore to ₹10 Crore Milestone Grant",
      macroCeilingDisplay: `Project Ceiling: ${maxAmt >= 10000000 ? `₹${(maxAmt / 10000000).toFixed(2)} Cr` : `₹${(maxAmt / 100000).toFixed(1)} L`}`,
      dilutionTerms: "0% Equity Dilution (Ministry of Defence grant with field trial milestones)",
      whoShouldOpt: "Aerospace, drone, cybersecurity, radar, electronic warfare, and tactical hardware innovators.",
      whenToChoose: "Choose if you are solving problems published in official Defence India Startup Challenges (DISC).",
      whenToAvoid: "Avoid if your technology has zero dual-use or defence applications."
    };
  }

  // 2. Generic Classifier for remaining schemes
  let badgeLabel = "Government Incentive";
  let cat: "grant" | "debt" | "equity" | "subsidy" = "grant";
  let dilution = "Non-dilutive";

  if (rawType.includes("grant") || rawType.includes("fellowship")) {
    badgeLabel = "100% Non-Dilutive Grant";
    cat = "grant";
    dilution = "0% Equity Taken (Non-dilutive grant-in-aid)";
  } else if (rawType.includes("loan") || rawType.includes("debt") || rawType.includes("guarantee") || rawType.includes("subvention")) {
    badgeLabel = "Concessional Debt / Guarantee";
    cat = "debt";
    dilution = "Commercial / concessional loan terms apply; no company equity taken";
  } else if (rawType.includes("equity") || rawType.includes("venture") || rawType.includes("fund of fund")) {
    badgeLabel = "Venture Equity / Seed Fund";
    cat = "equity";
    dilution = "Equity investment or convertible note through empanelled fund managers";
  } else {
    badgeLabel = "Statutory Subsidy / Tax Rebate";
    cat = "subsidy";
    dilution = "Direct fiscal allowance / expenditure reimbursement";
  }

  let individualTicket = "Financial Support";
  let macroCeiling: string | undefined = undefined;

  if (maxAmt > 0) {
    if (maxAmt >= 50000000) {
      // Over 5 Crore: usually a project or fund ceiling
      macroCeiling = `Program Macro Ceiling: ₹${(maxAmt / 10000000).toFixed(2)} Cr`;
      if (cat === "grant") {
        individualTicket = `Milestone Project Grant: Up to ₹${(maxAmt / 10000000).toFixed(2)} Cr`;
      } else if (cat === "debt") {
        individualTicket = `Loan & Guarantee Coverage up to ₹${(maxAmt / 10000000).toFixed(2)} Cr`;
      } else {
        individualTicket = `Fund Investment Ticket up to ₹${(maxAmt / 10000000).toFixed(2)} Cr`;
      }
    } else if (maxAmt >= 10000000) {
      individualTicket = `Individual Grant / Allocation: ₹${(maxAmt / 10000000).toFixed(2)} Crore`;
    } else {
      individualTicket = `Individual Startup Grant: Up to ₹${(maxAmt / 100000).toFixed(1)} Lakhs`;
    }
  } else {
    individualTicket = "Non-dilutive Grant / Operational Allocation";
  }

  return {
    grantTypeBadge: badgeLabel,
    grantTypeCategory: cat,
    individualTicket,
    macroCeilingDisplay: macroCeiling,
    dilutionTerms: dilution,
    whoShouldOpt: summary.length > 20 
      ? summary.slice(0, 140) + "..."
      : "Startups in early prototype or validation stage meeting ministerial eligibility rules.",
    whenToChoose: `Choose if you match the target stage and sector criteria specified in the program guidelines.`,
    whenToAvoid: `Avoid if you cannot meet the statutory registration or incorporation requirements.`
  };
}
