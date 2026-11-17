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
