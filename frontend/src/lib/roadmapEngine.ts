import { Scheme, IntakeAnswers, RoadmapStep, PersonalizedRoadmap, RoadmapPhase, RoadmapStepStatus } from "@/types";
import seedSchemes from "@/data/schemes_seed.json";

// Standard Document Definitions
export const KNOWN_DOCUMENTS: Record<string, string> = {
  aadhaar_pan: "Founder Aadhaar & PAN Card",
  incorporation: "Certificate of Incorporation (CIN / MCA)",
  dpiit_cert: "DPIIT Startup Recognition Certificate",
  udyam_msme: "Udyam MSME Registration Certificate",
  gstin: "GST Registration Certificate (GSTIN)",
  pitch_deck: "5-10 Slide Pitch Deck / Executive Summary",
  patent_ipr: "Provisional Patent Application / Trademark Filing",
  financial_audit: "Audited Financial Statements (Last 1-2 Years)",
  bank_statement: "Bank Statement / Cancelled Cheque (Active Current Account)"
};

/**
 * Format currency amounts in Lakhs or Crores INR
 */
export function formatInrCapital(amount?: number): string {
  if (!amount || amount <= 0) return "Capital Subsidy / Guarantee";
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Crore`;
  }
  const lk = amount / 100000;
  return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} Lakhs`;
}

/**
 * Deterministically synthesizes an explainable, actionable roadmap
 * based on user's profile intake answers and verified scheme database.
 */
export function generatePersonalizedRoadmap(
  answers: IntakeAnswers,
  customSchemes?: Scheme[],
  savedStatuses?: Record<string, RoadmapStepStatus>
): PersonalizedRoadmap {
  const schemesPool: Scheme[] = (customSchemes && customSchemes.length > 0)
    ? customSchemes
    : (seedSchemes as any as Scheme[]);

  const userSector = (answers.sector || "All Sectors").trim().toLowerCase();
  const userStage = (answers.stage || "Idea").trim().toLowerCase();
  const userState = (answers.state || "Pan-India").trim().toLowerCase();
  const userDocs = new Set(answers.documentsHeld || []);
  const hasDpiit = userDocs.has("dpiit_cert");
  const hasIncorp = userDocs.has("incorporation");
  const hasUdyam = userDocs.has("udyam_msme");

  // Step Accumulators by Phase
  const nowSteps: RoadmapStep[] = [];
  const nextSteps: RoadmapStep[] = [];
  const laterSteps: RoadmapStep[] = [];

  // 1. Foundational Enabler 1: DPIIT Startup Recognition (Phase: NOW)
  // Essential gateway for 85% of central subsidies, seed funds, and tax benefits
  if (!hasDpiit) {
    const dpiitStatus = savedStatuses?.["step-dpiit-foundation"] || "not_started";
    nowSteps.push({
      id: "step-dpiit-foundation",
      schemeId: "foundation-dpiit",
      phase: "now",
      phaseOrder: 1,
      title: "Apply for DPIIT Startup Recognition",
      schemeName: "Startup India DPIIT Recognition Gateway",
      ministry: "Ministry of Commerce & Industry (DPIIT)",
      category: "Foundational Accreditation",
      fundingDisplay: "Gateway to ₹10 Cr Guarantees & Tax Exemption",
      fundingAmount: 0,
      fundingType: "Regulatory Accreditation",
      whyItMatters: `Crucial first step for ${answers.startupName || "your startup"}: unlocks Startup India Seed Fund (SISFS), CGSS loan guarantees, 80-IAC tax holidays, and public procurement exemptions.`,
      documentsRequired: [
        "Certificate of Incorporation / Partnership Deed",
        "Short pitch deck explaining innovative nature of products/services",
        "Director / Partner identification (PAN & Aadhaar)",
        "Company website or working video link (optional but recommended)"
      ],
      actionUrl: "https://www.startupindia.gov.in/content/sih/en/recognition-page.html",
      portalName: "Startup India National Single Window System (NSWS)",
      estimatedTime: "24 - 48 Hours (100% Free Online)",
      deadline: "Rolling / Open All Year",
      dependencies: hasIncorp ? [] : ["Incorporate as Private Limited or Registered LLP/Partnership"],
      status: dpiitStatus,
      matchScore: 92
    });
  }

  // 2. Foundational Enabler 2: Udyam MSME Certificate (Phase: NOW)
  if (!hasUdyam) {
    const udyamStatus = savedStatuses?.["step-udyam-foundation"] || "not_started";
    nowSteps.push({
      id: "step-udyam-foundation",
      schemeId: "foundation-udyam",
      phase: "now",
      phaseOrder: 1,
      title: "Register on Udyam MSME Portal",
      schemeName: "Udyam Registration Scheme (MSME)",
      ministry: "Ministry of Micro, Small & Medium Enterprises",
      category: "MSME Accreditation",
      fundingDisplay: "Subsidized Credit & 50% Patent Discount",
      fundingAmount: 0,
      fundingType: "Regulatory Accreditation",
      whyItMatters: "Provides official MSME status, 50% government fee reduction on patent/trademark filings, priority lending, and collateral-free bank loans.",
      documentsRequired: [
        "Aadhaar Number of Entrepreneur/Managing Director",
        "PAN Card of the Enterprise",
        "GSTIN (if applicable)"
      ],
      actionUrl: "https://udyamregistration.gov.in",
      portalName: "Official Udyam Registration Portal",
      estimatedTime: "Instant Online Generation (Free)",
      deadline: "Rolling / Open All Year",
      dependencies: [],
      status: udyamStatus,
      matchScore: 89
    });
  }

  // 3. Scheme Scoring & Matching Engine
  interface ScoredScheme {
    scheme: Scheme;
    score: number;
    whyFits: string;
    targetPhase: RoadmapPhase;
    actionTitle: string;
    dependencies: string[];
    isIncubator: boolean;
  }

  const scoredSchemes: ScoredScheme[] = [];

  for (const s of schemesPool) {
    const sName = (s.scheme_name || (s as any).name || "").trim();
    if (!sName) continue;

    const sLower = sName.toLowerCase();
    const sSecs = Array.isArray(s.sector_eligibility)
      ? s.sector_eligibility.map(x => String(x).toLowerCase())
      : typeof s.sector_eligibility === "string" ? [s.sector_eligibility.toLowerCase()] : ["all sectors"];
    const sStages = Array.isArray(s.startup_stage)
      ? s.startup_stage.map(x => String(x).toLowerCase())
      : typeof s.startup_stage === "string" ? [s.startup_stage.toLowerCase()] : ["all stages"];
    const sGeo = (s.geographic_restriction || "Pan India").toLowerCase();

    // Check Geographic Filter
    const isStateMatch = sGeo.includes("pan india") || sGeo.includes("all india") || (userState && sGeo.includes(userState));
    if (!isStateMatch) continue;

    // Detect if this is an incubator scheme
    const isIncubator = sLower.includes("aic") || 
                        sLower.includes("nidhi-tbi") || 
                        sLower.includes("atal incubation") || 
                        sLower.includes("aic scaling") || 
                        (sLower.includes("incubator") && !sLower.includes("sisfs"));

    // Base scoring logic derived from criteria
    let score = s.match_score || 50;

    // Sector Fit
    const isAllSectors = sSecs.some(x => x.includes("all") || x.includes("general") || x.includes("cross"));
    const isDirectSector = sSecs.some(x => x.includes(userSector) || userSector.includes(x));
    if (isDirectSector) {
      score += 25;
    } else if (isAllSectors) {
      score += 10;
    } else {
      continue; // Sector mismatch
    }

    // Stage Fit
    const isStageDirect = sStages.some(x => x.includes(userStage) || userStage.includes(x) || x.includes("all"));
    if (isStageDirect) {
      score += 15;
    } else {
      score -= 5;
    }

    // Primary Goal Alignment
    const sFundType = (s.funding_type || "").toLowerCase();
    const sMaxFund = s.max_funding_amount || 0;

    if (answers.primaryGoal === "Idea Validation / Prototype") {
      if (sFundType.includes("grant") || sLower.includes("prayas") || sLower.includes("eir") || sLower.includes("idea")) {
        score += 15;
      }
    } else if (answers.primaryGoal === "R&D Grant / Product MVP") {
      if (sFundType.includes("grant") || sLower.includes("seed") || sLower.includes("big") || sLower.includes("samridh")) {
        score += 15;
      }
    } else if (answers.primaryGoal === "Market Entry & Commercial Seed") {
      if (sLower.includes("sisfs") || sLower.includes("seed fund") || sFundType.includes("seed") || sFundType.includes("equity")) {
        score += 15;
      }
    } else if (answers.primaryGoal === "Scale-up Debt / Credit Guarantee") {
      if (sFundType.includes("guarantee") || sFundType.includes("loan") || sLower.includes("cgss") || sLower.includes("stand-up")) {
        score += 20;
      }
    } else if (answers.primaryGoal === "Tax Exemption & Patent Relief") {
      if (sLower.includes("80-iac") || sLower.includes("patent") || sLower.includes("ipr") || sFundType.includes("tax")) {
        score += 20;
      }
    }

    // Normalized Score: no 99% on everything (realistic range between 68% and 94%)
    const finalScore = Math.min(94, Math.max(65, score));

    // Determine Roadmap Phase Allocation
    let targetPhase: RoadmapPhase = "next";
    let actionVerb = "Apply for";
    const deps: string[] = [];

    // Phase Decision Rules
    if (sLower.includes("prayas") || sLower.includes("eir") || (sFundType.includes("grant") && sMaxFund <= 1500000 && (userStage === "idea" || userStage.includes("student")))) {
      targetPhase = "now";
      actionVerb = "Submit Prototype Proposal for";
    } else if (sLower.includes("sisfs") || sLower.includes("startup india seed") || sLower.includes("big") || sLower.includes("tide") || sLower.includes("samridh") || sLower.includes("elevate")) {
      targetPhase = "next";
      actionVerb = "Pitch & Apply to";
      if (!hasDpiit) deps.push("DPIIT Recognition Number");
    } else if (sLower.includes("cgss") || sLower.includes("credit guarantee") || sLower.includes("stand-up") || sLower.includes("80-iac") || sFundType.includes("guarantee") || sMaxFund > 50000000) {
      targetPhase = "later";
      actionVerb = "Scale Operations with";
      if (!hasDpiit) deps.push("DPIIT Recognition Certificate");
      if (!hasIncorp) deps.push("Formal MCA Incorporation");
    } else if (isIncubator) {
      targetPhase = "later";
      actionVerb = "Enroll in";
    } else {
      if (sMaxFund <= 1500000) targetPhase = "now";
      else if (sMaxFund <= 10000000) targetPhase = "next";
      else targetPhase = "later";
    }

    // Scheme-specific description (never generic "Broad national program")
    const whyFits = s.nlp_summary
      ? s.nlp_summary
      : (Array.isArray(s.reasons) && s.reasons.length > 0)
      ? s.reasons.join(". ")
      : `${sName} provides ${formatInrCapital(sMaxFund)} in ${s.funding_type || "capital"} via ${s.ministry || "GoI"} for verified ${answers.sector} startups.`;

    scoredSchemes.push({
      scheme: s,
      score: finalScore,
      whyFits,
      targetPhase,
      actionTitle: `${actionVerb} ${sName}`,
      dependencies: deps,
      isIncubator
    });
  }

  // Sort by score descending; if scores tie, break by deadline then amount
  scoredSchemes.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie break 1: deadline (schemes with earlier deadlines come first)
    const dA = a.scheme.application_deadline ? new Date(a.scheme.application_deadline).getTime() : Infinity;
    const dB = b.scheme.application_deadline ? new Date(b.scheme.application_deadline).getTime() : Infinity;
    if (dA !== dB) return dA - dB;
    // Tie break 2: funding amount descending
    return (b.scheme.max_funding_amount || 0) - (a.scheme.max_funding_amount || 0);
  });

  // Track incubator schemes destined for Phase 3 to avoid duplicates (Item 4)
  const incubatorPool: Scheme[] = [];

  // Group into phases ensuring healthy distribution
  for (const item of scoredSchemes) {
    const s = item.scheme;

    // Check if this is near-duplicate incubator program in Phase 3
    if (item.targetPhase === "later" && item.isIncubator) {
      incubatorPool.push(s);
      continue; // group together below
    }

    const stepId = `step-${s.id || s.scheme_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const status = savedStatuses?.[stepId] || "not_started";

    const stepObj: RoadmapStep = {
      id: stepId,
      schemeId: s.id || stepId,
      phase: item.targetPhase,
      phaseOrder: item.targetPhase === "now" ? 1 : item.targetPhase === "next" ? 2 : 3,
      title: item.actionTitle,
      schemeName: s.scheme_name,
      ministry: s.ministry || "Government of India",
      category: s.category || "Capital Grant & Ecosystem Support",
      fundingDisplay: formatInrCapital(s.max_funding_amount),
      fundingAmount: s.max_funding_amount || 0,
      fundingType: s.funding_type || "Government Support Program",
      whyItMatters: item.whyFits,
      documentsRequired: Array.isArray(s.required_documents) && s.required_documents.length > 0
        ? s.required_documents
        : [
            "Company Pitch Deck & Executive Summary",
            "Proof of Business Registration / Pan Card",
            "Detailed Budget Utilization & Milestone Plan"
          ],
      actionUrl: s.application_portal || s.source_url || "https://www.startupindia.gov.in",
      portalName: s.application_portal ? "Official Scheme Application Portal" : "Startup India Unified Portal",
      estimatedTime: s.processing_timeline || (item.targetPhase === "now" ? "2 - 3 Weeks" : item.targetPhase === "next" ? "4 - 8 Weeks" : "8 - 12 Weeks"),
      deadline: s.application_deadline || "Rolling / Open All Year",
      dependencies: item.dependencies,
      status,
      matchScore: item.score
    };

    if (item.targetPhase === "now" && nowSteps.length < 3) {
      nowSteps.push(stepObj);
    } else if (item.targetPhase === "next" && nextSteps.length < 3) {
      nextSteps.push(stepObj);
    } else if (item.targetPhase === "later" && laterSteps.length < 3) {
      laterSteps.push(stepObj);
    }
  }

  // Handle incubator group in Phase 3 (Item 4: limit near-duplicates to one group item)
  if (incubatorPool.length > 0 && laterSteps.length < 3) {
    const incubatorCount = incubatorPool.length;
    const maxIncubatorAmt = incubatorPool.reduce((max, cur) => Math.max(max, cur.max_funding_amount || 0), 0);
    const groupStepId = "step-incubation-programmes-group";
    const groupStatus = savedStatuses?.[groupStepId] || "not_started";

    laterSteps.push({
      id: groupStepId,
      schemeId: "group-incubation-network",
      phase: "later",
      phaseOrder: 3,
      title: `Incubation programmes (${incubatorCount})`,
      schemeName: `Atal & NIDHI Incubation Programme Network (${incubatorCount} Centres)`,
      ministry: "AIM / NITI Aayog & DST",
      category: "Incubation & Infrastructure",
      fundingDisplay: `Up to ${formatInrCapital(maxIncubatorAmt)} grant + infrastructure`,
      fundingAmount: maxIncubatorAmt,
      fundingType: "Incubator Residency & Grant",
      whyItMatters: "Access dedicated deep-tech prototyping facilities, maker spaces, seed investment committees, and corporate trial networks across Atal Incubation Centres (AIC) and NIDHI-TBIs.",
      documentsRequired: [
        "Pitch Deck with Prototype Demo Link",
        "Faculty / Mentor Endorsement (if academic spinoff)",
        "Provisional IPR / Patent filing documentation"
      ],
      actionUrl: "https://aim.gov.in/atal-incubation-centres.php",
      portalName: "Atal Innovation Mission Unified Portal",
      estimatedTime: "4 - 8 Weeks Application Review",
      deadline: "Rolling Calls per Centre",
      dependencies: hasDpiit ? [] : ["DPIIT Recognition recommended for priority admission"],
      status: groupStatus,
      matchScore: 84,
      subSchemes: incubatorPool.slice(0, 5).map(inc => ({
        name: inc.scheme_name,
        ministry: inc.ministry || "AIM / DST",
        funding: formatInrCapital(inc.max_funding_amount),
        portal: inc.application_portal || inc.source_url || "https://aim.gov.in",
        summary: inc.nlp_summary || "Incubation residency with specialized testing infrastructure and seed support committee."
      }))
    });
  }

  // Combine in strict temporal order
  const allSteps: RoadmapStep[] = [...nowSteps, ...nextSteps, ...laterSteps];

  // Calculate Progress Stats
  const completedSteps = allSteps.filter(s => s.status === "done").length;
  const inProgressSteps = allSteps.filter(s => s.status === "in_progress").length;
  const totalSteps = allSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round(((completedSteps + inProgressSteps * 0.5) / totalSteps) * 100) : 0;

  // Deduplicate schemes by schemeId to count each scheme strictly once (Item 3)
  const distinctSchemes = Array.from(new Map(allSteps.map(s => [s.schemeId, s])).values());
  
  // Exclude credit guarantees and loans from grant totals (Item 3)
  const grantSchemes = distinctSchemes.filter(s => {
    const ft = (s.fundingType || "").toLowerCase();
    const cat = (s.category || "").toLowerCase();
    return !ft.includes("guarantee") && !ft.includes("loan") && !cat.includes("guarantee") && !cat.includes("debt");
  });

  const totalGrantCapital = grantSchemes.reduce((sum, s) => sum + s.fundingAmount, 0);
  const totalGrantDisplay = totalGrantCapital >= 10000000
    ? `₹${(totalGrantCapital / 10000000).toFixed(2)} Cr`
    : totalGrantCapital >= 100000
    ? `₹${(totalGrantCapital / 100000).toFixed(1)} Lakhs`
    : `₹${totalGrantCapital.toLocaleString("en-IN")}`;

  const totalCapitalDisplay = `Up to ${totalGrantDisplay} across ${grantSchemes.length} schemes (indicative, caps are per-scheme maximums)`;

  // Identify "Next Best Action": first incomplete step
  const nextBestAction = allSteps.find(s => s.status !== "done") || null;

  return {
    id: `roadmap-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    profileSummary: {
      startupName: answers.startupName || "Innovative Venture",
      sector: answers.sector,
      stage: answers.stage,
      state: answers.state,
      primaryGoal: answers.primaryGoal,
      turnoverBand: answers.turnoverBand,
      dpiitRegistered: hasDpiit
    },
    stats: {
      totalCapitalAvailable: totalGrantCapital,
      totalCapitalDisplay,
      totalGrantCapital,
      totalGrantDisplay,
      grantSchemesCount: grantSchemes.length,
      totalSteps,
      completedSteps,
      progressPercentage,
      nowCount: nowSteps.length,
      nextCount: nextSteps.length,
      laterCount: laterSteps.length
    },
    nextBestAction,
    steps: allSteps
  };
}
