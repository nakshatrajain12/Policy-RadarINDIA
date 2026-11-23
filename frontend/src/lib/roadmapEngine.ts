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
      matchScore: 99
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
      matchScore: 97
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

    // Base scoring logic
    let score = 50;
    const whyReasons: string[] = [];

    // Sector Fit
    const isAllSectors = sSecs.some(x => x.includes("all") || x.includes("general") || x.includes("cross"));
    const isDirectSector = sSecs.some(x => x.includes(userSector) || userSector.includes(x));
    if (isDirectSector) {
      score += 30;
      whyReasons.push(`Specifically tailored for ${answers.sector} domain`);
    } else if (isAllSectors) {
      score += 15;
      whyReasons.push("Broad national program open to all innovation sectors");
    } else {
      continue; // Sector mismatch
    }

    // Stage Fit
    const isStageDirect = sStages.some(x => x.includes(userStage) || userStage.includes(x) || x.includes("all"));
    if (isStageDirect) {
      score += 20;
      whyReasons.push(`Matches your active stage (${answers.stage})`);
    } else {
      score -= 10;
    }

    // Primary Goal Alignment
    const sFundType = (s.funding_type || "").toLowerCase();
    const sMaxFund = s.max_funding_amount || 0;

    if (answers.primaryGoal === "Idea Validation / Prototype") {
      if (sFundType.includes("grant") || sLower.includes("prayas") || sLower.includes("eir") || sLower.includes("idea")) {
        score += 25;
        whyReasons.push("Provides 100% non-dilutive grant capital for early prototype fabrication");
      }
    } else if (answers.primaryGoal === "R&D Grant / Product MVP") {
      if (sFundType.includes("grant") || sLower.includes("seed") || sLower.includes("big") || sLower.includes("samridh")) {
        score += 25;
        whyReasons.push("Delivers non-dilutive POC and technical validation capital");
      }
    } else if (answers.primaryGoal === "Market Entry & Commercial Seed") {
      if (sLower.includes("sisfs") || sLower.includes("seed fund") || sFundType.includes("seed") || sFundType.includes("equity")) {
        score += 25;
        whyReasons.push("Targeted funding for market validation, trials, and commercial launch");
      }
    } else if (answers.primaryGoal === "Scale-up Debt / Credit Guarantee") {
      if (sFundType.includes("guarantee") || sFundType.includes("loan") || sLower.includes("cgss") || sLower.includes("stand-up")) {
        score += 30;
        whyReasons.push("Provides institutional credit access without requiring personal collateral");
      }
    } else if (answers.primaryGoal === "Tax Exemption & Patent Relief") {
      if (sLower.includes("80-iac") || sLower.includes("patent") || sLower.includes("ipr") || sFundType.includes("tax")) {
        score += 30;
        whyReasons.push("Saves cash runway through statutory tax relief and patent fee reimbursement");
      }
    }

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
    } else {
      // Default phase by max funding
      if (sMaxFund <= 1500000) targetPhase = "now";
      else if (sMaxFund <= 10000000) targetPhase = "next";
      else targetPhase = "later";
    }

    const whyFits = whyReasons.slice(0, 2).join(". ") + ".";

    scoredSchemes.push({
      scheme: s,
      score: Math.min(score, 99),
      whyFits,
      targetPhase,
      actionTitle: `${actionVerb} ${sName}`,
      dependencies: deps
    });
  }

  // Sort by score descending
  scoredSchemes.sort((a, b) => b.score - a.score);

  // Group into phases ensuring healthy distribution
  for (const item of scoredSchemes) {
    const s = item.scheme;
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

  // Combine in strict temporal order
  const allSteps: RoadmapStep[] = [...nowSteps, ...nextSteps, ...laterSteps];

  // Calculate Progress Stats
  const completedSteps = allSteps.filter(s => s.status === "done").length;
  const inProgressSteps = allSteps.filter(s => s.status === "in_progress").length;
  const totalSteps = allSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round(((completedSteps + inProgressSteps * 0.5) / totalSteps) * 100) : 0;

  // Total Accessible Capital across Roadmap Steps
  const totalCapital = allSteps.reduce((sum, s) => sum + s.fundingAmount, 0);

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
      totalCapitalAvailable: totalCapital,
      totalCapitalDisplay: formatInrCapital(totalCapital),
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
