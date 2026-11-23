export interface FounderProfile {
  startupName: string;
  sector: string;
  stage: string;
  state: string;
  dpiitRegistered: boolean;
  womenLed: boolean;
  entityType: string;
  turnoverInr?: number;
}

export interface Scheme {
  id: string;
  scheme_name: string;
  ministry?: string;
  funding_type?: string;
  max_funding_amount?: number;
  total_budget_allocated?: number;
  startup_stage?: string[] | string;
  sector_eligibility?: string[] | string;
  category?: string;
  geographic_restriction?: string;
  status?: string;
  source_url?: string;
  application_portal?: string;
  nlp_summary?: string;
  dpiit_required?: boolean;
  required_documents?: string[];
  processing_timeline?: string;
  application_deadline?: string;
  match_score?: number;
  confidence_score?: number;
  success_stories?: string;
  reasons?: string[];
}

export interface RecommendationMatch {
  id: string;
  name: string;
  ministry?: string;
  match_score: number;
  eligibility_score: number;
  confidence_score?: number;
  funding_type: string;
  equity_type: string;
  max_funding_amount?: number;
  max_funding_display: string;
  geographic_restriction: string;
  source_url?: string;
  application_portal?: string;
  reason?: string;
  reasons?: string[];
  nlp_summary?: string;
  success_stories?: string;
  criteria?: Record<string, { status: string; detail: string; hard: boolean }>;
  unlock_actions?: string[];
  hard_excluded?: boolean;
}

export interface UnlockInsights {
  dpiit_unlock_count: number;
  dpiit_unlock_value_inr: number;
  dpiit_unlock_value_display: string;
  top_unlock_action: string;
}

export type RoadmapPhase = "now" | "next" | "later";
export type RoadmapStepStatus = "not_started" | "in_progress" | "done";

export interface RoadmapStep {
  id: string;
  schemeId: string;
  phase: RoadmapPhase;
  phaseOrder: number; // 1 for now, 2 for next, 3 for later
  title: string;      // Action verb title e.g. "Apply for DPIIT Recognition"
  schemeName: string;
  ministry: string;
  category: string;
  fundingDisplay: string;
  fundingAmount: number;
  fundingType: string;
  whyItMatters: string;
  documentsRequired: string[];
  actionUrl: string;
  portalName: string;
  estimatedTime: string;
  deadline: string;
  dependencies: string[];
  status: RoadmapStepStatus;
  matchScore: number;
  subSchemes?: {
    name: string;
    ministry?: string;
    funding?: string;
    portal?: string;
    summary?: string;
  }[];
}

export interface PersonalizedRoadmap {
  id: string;
  generatedAt: string;
  profileSummary: {
    startupName: string;
    sector: string;
    stage: string;
    state: string;
    primaryGoal: string;
    turnoverBand: string;
    dpiitRegistered: boolean;
  };
  stats: {
    totalCapitalAvailable: number;
    totalCapitalDisplay: string;
    totalGrantCapital?: number;
    totalGrantDisplay?: string;
    grantSchemesCount?: number;
    totalSteps: number;
    completedSteps: number;
    progressPercentage: number;
    nowCount: number;
    nextCount: number;
    laterCount: number;
  };
  nextBestAction: RoadmapStep | null;
  steps: RoadmapStep[];
}

export interface IntakeAnswers {
  startupName: string;
  sector: string;
  stage: string;
  state: string;
  primaryGoal: "Idea Validation / Prototype" | "R&D Grant / Product MVP" | "Market Entry & Commercial Seed" | "Scale-up Debt / Credit Guarantee" | "Tax Exemption & Patent Relief";
  turnoverBand: "< ₹10 Lakhs (Pre-revenue)" | "₹10 Lakhs - ₹1 Crore" | "₹1 Crore - ₹5 Crore" | "> ₹5 Crore";
  documentsHeld: string[]; // ["aadhaar_pan", "incorporation", "dpiit_cert", "udyam_msme", "gstin", "pitch_deck", "patent_ipr"]
  womenLed?: boolean;
}

export interface DemoPersona {
  id: string;
  slug: string;
  name: string;
  founderName: string;
  avatar: string;
  tagline: string;
  description: string;
  answers: IntakeAnswers;
}

export interface AnalyticsBundle {
  summary: {
    total_schemes: number;
    total_budget: number;
    total_budget_display: string;
    avg_max_funding: number;
    avg_max_funding_display: string;
    unique_ministries: number;
    pan_india_schemes: number;
    state_schemes: number;
  };
  instrument_breakdown: Array<{
    instrument: string;
    scheme_count: number;
    total_value_inr: number;
    total_display: string;
    desc: string;
    color: string;
  }>;
  regional_corridors: Array<{
    region: string;
    count: number;
    coverage: string;
    badge: string;
  }>;
  top_ministries: Array<{
    ministry: string;
    scheme_count: number;
    total_max_funding: number;
    avg_funding: number;
  }>;
  sector_distribution: Array<{
    sector: string;
    scheme_count: number;
  }>;
  stage_coverage: Array<{
    stage: string;
    scheme_count: number;
  }>;
  state_distribution: Array<{
    state: string;
    scheme_count: number;
    is_pan_india: boolean;
  }>;
  gap_heatmap: Array<Record<string, any>>;
  ai_brief: string;
  facts: Record<string, any>;
  cached_at: number;
}
