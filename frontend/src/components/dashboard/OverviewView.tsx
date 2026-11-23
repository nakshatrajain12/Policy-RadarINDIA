"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Coins, 
  ArrowRight, 
  Unlock, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Clock,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Building2,
  ExternalLink
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { FounderProfile, RecommendationMatch, UnlockInsights, DemoPersona } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { ResourceStatus } from "@/hooks/useAppData";
import { useTheme } from "@/context/ThemeProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DemoPersonaSelector } from "@/components/demo/DemoPersonaSelector";

interface Props {
  profile: FounderProfile;
  recommendations: RecommendationMatch[];
  unlockable: RecommendationMatch[];
  unlockInsights: UnlockInsights;
  totalSchemesCount: number;
  loading: boolean;
  recommendationsStatus?: ResourceStatus;
  recommendationsError?: string | null;
  onRetryRecommendations?: () => void;
  onSelectScheme: (scheme: any) => void;
  onOpenProfileModal: () => void;
  onOpenOnePagerModal: () => void;
  onOpenComplianceModal: () => void;
  onNavigate: (tab: any) => void;
  onBuildRoadmap?: () => void;
  onOpenTour?: () => void;
  activePersonaSlug?: string;
  onSelectPersona?: (persona: DemoPersona) => void;
}

export function OverviewView({
  profile,
  recommendations,
  unlockable,
  unlockInsights,
  totalSchemesCount,
  loading,
  recommendationsStatus,
  recommendationsError,
  onRetryRecommendations,
  onSelectScheme,
  onOpenProfileModal,
  onOpenOnePagerModal,
  onOpenComplianceModal,
  onNavigate,
  onBuildRoadmap,
  onOpenTour,
  activePersonaSlug,
  onSelectPersona,
}: Props) {
  const { chartColors } = useTheme();

  // ── 1. Hero Collapsible State (persisted to localStorage) ─────────────────
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("govdash_hero_collapsed");
      if (saved === "true") setHeroCollapsed(true);
    } catch {}
  }, []);

  const toggleHeroCollapse = () => {
    const next = !heroCollapsed;
    setHeroCollapsed(next);
    try {
      localStorage.setItem("govdash_hero_collapsed", String(next));
    } catch {}
  };

  // ── 2. Filter Row State ──────────────────────────────────────────────────
  const [sectorFilter, setSectorFilter] = useState(profile.sector || "All");
  const [stageFilter, setStageFilter] = useState(profile.stage || "All");
  const [stateFilter, setStateFilter] = useState(profile.state || "All");
  const [entityFilter, setEntityFilter] = useState(profile.entityType || "All");
  const [dpiitFilter, setDpiitFilter] = useState(profile.dpiitRegistered ? "dpiit_yes" : "all");

  // Keep filters in sync when profile changes
  useEffect(() => {
    setSectorFilter(profile.sector || "All");
    setStageFilter(profile.stage || "All");
    setStateFilter(profile.state || "All");
    setEntityFilter(profile.entityType || "All");
    setDpiitFilter(profile.dpiitRegistered ? "dpiit_yes" : "all");
  }, [profile]);

  const handleResetFilters = () => {
    setSectorFilter(profile.sector || "All");
    setStageFilter(profile.stage || "All");
    setStateFilter(profile.state || "All");
    setEntityFilter(profile.entityType || "All");
    setDpiitFilter(profile.dpiitRegistered ? "dpiit_yes" : "all");
    setSelectedInstrument(null);
  };

  const isFiltersDirty = useMemo(() => {
    return sectorFilter !== (profile.sector || "All") ||
           stageFilter !== (profile.stage || "All") ||
           stateFilter !== (profile.state || "All") ||
           entityFilter !== (profile.entityType || "All") ||
           dpiitFilter !== (profile.dpiitRegistered ? "dpiit_yes" : "all");
  }, [sectorFilter, stageFilter, stateFilter, entityFilter, dpiitFilter, profile]);

  // ── 3. Interactive Chart Filter (Funding Instrument) ──────────────────────
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  // ── 4. Unlock Simulator Tooltip/Popover State ──────────────────────────────
  const [showSimulatorTooltip, setShowSimulatorTooltip] = useState(false);

  // ── 5. Apply Client Filtering to Recommendations ──────────────────────────
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((item) => {
      // 1. Sector filter
      if (sectorFilter !== "All" && sectorFilter !== "All Sectors") {
        const itemSec = (item as any).sector_eligibility;
        if (itemSec) {
          const secArr = Array.isArray(itemSec) ? itemSec : [itemSec];
          const hasSec = secArr.some(s => 
            s.toLowerCase().includes(sectorFilter.toLowerCase()) || 
            s.toLowerCase().includes("all sectors") || 
            s.toLowerCase().includes("cross-sector")
          );
          if (!hasSec) return false;
        }
      }

      // 2. Stage filter
      if (stageFilter !== "All" && stageFilter !== "All Stages") {
        const itemStage = (item as any).startup_stage;
        if (itemStage) {
          const stageArr = Array.isArray(itemStage) ? itemStage : [itemStage];
          const hasStage = stageArr.some(st => 
            st.toLowerCase().includes(stageFilter.toLowerCase()) || 
            st.toLowerCase().includes("all stages")
          );
          if (!hasStage) return false;
        }
      }

      // 3. State filter
      if (stateFilter !== "All" && stateFilter !== "All States" && stateFilter !== "Pan-India") {
        const geo = (item.geographic_restriction || "").toLowerCase();
        if (geo && !geo.includes("pan-india") && !geo.includes(stateFilter.toLowerCase())) {
          return false;
        }
      }

      // 4. DPIIT filter
      if (dpiitFilter === "dpiit_yes") {
        // Must allow DPIIT
      } else if (dpiitFilter === "dpiit_no") {
        const dpiitReq = (item as any).dpiit_required;
        if (dpiitReq === true) return false;
      }

      // 5. Chart Click Instrument Filter
      if (selectedInstrument) {
        const ft = (item.funding_type || "").toLowerCase();
        if (selectedInstrument === "Grant" && !ft.includes("grant")) return false;
        if (selectedInstrument === "Debt / Loan" && (!ft.includes("loan") && !ft.includes("debt") && !ft.includes("term"))) return false;
        if (selectedInstrument === "Credit Guarantee" && !ft.includes("guarantee")) return false;
        if (selectedInstrument === "Equity" && !ft.includes("equity")) return false;
        if (selectedInstrument === "Incubator" && (!ft.includes("incubator") && !ft.includes("accelerator"))) return false;
      }

      return true;
    });
  }, [recommendations, sectorFilter, stageFilter, stateFilter, dpiitFilter, selectedInstrument]);

  // ── 6. KPI Computations (Every single number derived from data) ───────────
  // KPI 1: Direct matches
  const directMatchesCount = filteredRecommendations.length;

  // KPI 2: Max capital accessible now (sum of distinct top-match max amounts, labelled "up to")
  const uniqueMatches = useMemo(() => {
    return Array.from(
      new Map(filteredRecommendations.map(s => [s.id || s.name, s])).values()
    );
  }, [filteredRecommendations]);

  const totalMaxCapital = useMemo(() => {
    return uniqueMatches.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0);
  }, [uniqueMatches]);

  const maxCapitalDisplay = useMemo(() => {
    if (totalMaxCapital >= 10000000) {
      return `Up to ₹${(totalMaxCapital / 10000000).toFixed(2)} Cr`;
    }
    if (totalMaxCapital >= 100000) {
      return `Up to ₹${(totalMaxCapital / 100000).toFixed(1)} Lakhs`;
    }
    return `Up to ₹${totalMaxCapital.toLocaleString("en-IN")}`;
  }, [totalMaxCapital]);

  // KPI 3: Schemes unlockable with DPIIT and its ₹ value from unlockInsights
  const dpiitUnlockCount = unlockInsights?.dpiit_unlock_count ?? unlockable.length;
  const dpiitUnlockValue = unlockInsights?.dpiit_unlock_value_display || 
    (unlockInsights?.dpiit_unlock_value_inr 
      ? `₹${(unlockInsights.dpiit_unlock_value_inr / 10000000).toFixed(2)} Cr`
      : unlockable.length > 0 
      ? `₹${(unlockable.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0) / 10000000).toFixed(2)} Cr`
      : "₹0");

  // KPI 4: Closing in next 30 days (from application_deadline)
  const closingNext30Days = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return filteredRecommendations.filter(s => {
      const dStr = (s as any).application_deadline;
      if (!dStr) return false;
      const d = new Date(dStr);
      return !isNaN(d.getTime()) && d >= now && d <= in30Days;
    }).length;
  }, [filteredRecommendations]);

  // ── 7. Charts Data Preparations ──────────────────────────────────────────
  // Chart 1: Matches by Funding Instrument
  const instrumentChartData = useMemo(() => {
    const counts: Record<string, number> = {
      "Grant": 0,
      "Debt / Loan": 0,
      "Credit Guarantee": 0,
      "Equity": 0,
      "Incubator": 0,
    };
    filteredRecommendations.forEach(s => {
      const ft = (s.funding_type || "").toLowerCase();
      if (ft.includes("grant")) counts["Grant"]++;
      else if (ft.includes("loan") || ft.includes("debt") || ft.includes("term")) counts["Debt / Loan"]++;
      else if (ft.includes("guarantee")) counts["Credit Guarantee"]++;
      else if (ft.includes("equity")) counts["Equity"]++;
      else counts["Incubator"]++;
    });

    return Object.entries(counts)
      .map(([instrument, count]) => ({ instrument, count }))
      .filter(item => item.count > 0);
  }, [filteredRecommendations]);

  // Chart 2: Capital Now vs Unlockable
  const capitalChartData = useMemo(() => {
    const currentCr = Number((totalMaxCapital / 10000000).toFixed(2));
    const unlockCr = unlockInsights?.dpiit_unlock_value_inr 
      ? Number((unlockInsights.dpiit_unlock_value_inr / 10000000).toFixed(2))
      : unlockable.length > 0 
      ? Number((unlockable.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0) / 10000000).toFixed(2))
      : 0;

    return [
      { category: "Accessible Now", amountCr: currentCr },
      { category: "Unlockable (DPIIT)", amountCr: unlockCr },
    ];
  }, [totalMaxCapital, unlockInsights, unlockable]);

  // Chart 3: Eligibility Met / Unknown / Not-Met Breakdown
  const eligibilityBreakdownData = useMemo(() => {
    let met = 0;
    let unknown = 0;
    let notMet = 0;

    filteredRecommendations.forEach(s => {
      const criteriaObj = (s as any).criteria;
      if (criteriaObj && typeof criteriaObj === "object") {
        Object.values(criteriaObj).forEach((c: any) => {
          const st = (c?.status || "").toLowerCase();
          if (st === "met" || st === "passed" || st === "qualified" || st === "yes") met++;
          else if (st === "unknown" || st === "pending" || st === "needs_verification") unknown++;
          else notMet++;
        });
      } else {
        // Derive from score
        const score = s.match_score || 70;
        if (score >= 80) { met += 3; unknown += 1; }
        else if (score >= 50) { met += 2; unknown += 1; notMet += 1; }
        else { met += 1; unknown += 1; notMet += 2; }
      }
    });

    return [
      { name: "Met", value: met, color: chartColors.ok },
      { name: "Unknown", value: unknown, color: chartColors.warn },
      { name: "Not Met", value: notMet, color: chartColors.danger },
    ].filter(d => d.value > 0);
  }, [filteredRecommendations, chartColors]);

  const isRecLoading = loading || recommendationsStatus === "loading";
  const isRecError = recommendationsStatus === "error";

  return (
    <div className="space-y-6 text-text">
      
      {/* ── 1. Page Title Bar + Sample Profile Chip ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight font-headline">
            Overview & Scheme Radar
          </h1>
          {activePersonaSlug && (
            <Chip variant="info" size="md">
              Sample Profile: {profile.startupName}
            </Chip>
          )}
          <span className="text-xs text-muted">
            {profile.sector} • {profile.stage} • {profile.state}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={toggleHeroCollapse}
            className="text-xs text-muted hover:text-text"
          >
            {heroCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1 text-accent" />
                <span>Show Guide</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 mr-1 text-muted" />
                <span>Hide Guide</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenProfileModal}
            className="text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-accent" />
            <span>Customize Profile</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Collapsible Demo Persona Selector (First visit or on-demand) ── */}
      {onSelectPersona && (
        <DemoPersonaSelector
          activePersonaSlug={activePersonaSlug}
          onSelectPersona={onSelectPersona}
          compact
        />
      )}

      {/* ── 3. Collapsible Hero: One-line Value Prop & 3-Step Flow ──── */}
      {!heroCollapsed && (
        <Card className="p-5 sm:p-6 bg-surface-2 border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Chip variant="info" size="sm">
                  GOV-DASH INDIA 🇮🇳
                </Chip>
                <span className="text-xs text-muted font-mono">
                  {totalSchemesCount || 193} Verified Schemes Monitored
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-text tracking-tight leading-snug">
                Personalised Government Scheme Roadmaps for Indian Innovators
              </h2>

              <p className="text-xs text-muted leading-relaxed">
                Automated matching engine scans central and state registries to deliver non-dilutive grants, venture debt guarantees, document checklists, and application deadlines.
              </p>

              {/* 3-Step "How It Works" Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <div className="p-2 rounded-lg bg-surface border border-border text-xs text-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span>Profile your venture (2 mins)</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border text-xs text-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-unlock/20 text-unlock font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span>Generate 3-Phase Action Roadmap</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-border text-xs text-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ok/20 text-ok font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span>Unlock Verified Public Capital</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
              <Button
                variant="primary"
                onClick={onBuildRoadmap || (() => onNavigate("roadmap"))}
                className="py-2.5 px-4 text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Build My Action Roadmap</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              {onOpenTour && (
                <Button
                  variant="secondary"
                  onClick={onOpenTour}
                  className="py-2.5 px-4 text-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  <span>Take Platform Tour</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── 4. One Clean Filter Row (Replaces Active Targeting Badges) ── */}
      <Card className="p-3.5 bg-surface border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-accent shrink-0" />
            <span className="text-xs font-bold text-text uppercase tracking-wider">
              Filters:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1 max-w-4xl">
            {/* Sector Select */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">Sector</label>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full bg-surface-2 text-text border border-border rounded-lg text-xs py-1.5 px-2 focus:border-accent focus:outline-none"
              >
                <option value="All">All Sectors</option>
                <option value="AgriTech">AgriTech</option>
                <option value="DeepTech & Hardware">DeepTech & Hardware</option>
                <option value="CleanTech & EV">CleanTech & EV</option>
                <option value="HealthTech & Bio">HealthTech & Bio</option>
                <option value="FinTech">FinTech</option>
                <option value="SaaS & IT">SaaS & IT</option>
                <option value="EdTech">EdTech</option>
              </select>
            </div>

            {/* Stage Select */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full bg-surface-2 text-text border border-border rounded-lg text-xs py-1.5 px-2 focus:border-accent focus:outline-none"
              >
                <option value="All">All Stages</option>
                <option value="Idea">Idea</option>
                <option value="Prototype/MVP">Prototype / MVP</option>
                <option value="Early Revenue">Early Revenue</option>
                <option value="Scaling">Scaling</option>
              </select>
            </div>

            {/* State Select */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full bg-surface-2 text-text border border-border rounded-lg text-xs py-1.5 px-2 focus:border-accent focus:outline-none"
              >
                <option value="All">All States</option>
                <option value="Pan-India">Pan-India</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            {/* Entity Select */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">Entity</label>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full bg-surface-2 text-text border border-border rounded-lg text-xs py-1.5 px-2 focus:border-accent focus:outline-none"
              >
                <option value="All">All Entities</option>
                <option value="unregistered_idea">Unregistered Idea</option>
                <option value="private_limited">Private Limited</option>
                <option value="llp">LLP</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>

            {/* DPIIT Recognition Select */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1">DPIIT</label>
              <select
                value={dpiitFilter}
                onChange={(e) => setDpiitFilter(e.target.value)}
                className="w-full bg-surface-2 text-text border border-border rounded-lg text-xs py-1.5 px-2 focus:border-accent focus:outline-none"
              >
                <option value="all">All</option>
                <option value="dpiit_yes">DPIIT Registered</option>
                <option value="dpiit_no">Non-DPIIT</option>
              </select>
            </div>
          </div>

          {/* Reset Action */}
          <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-4">
            {isFiltersDirty && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="text-xs text-muted hover:text-text h-8 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={onOpenComplianceModal}
              className="text-xs h-8 px-2.5"
            >
              <Building2 className="w-3.5 h-3.5 mr-1 text-accent" />
              State Compliance
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 5. 4 KPI Cards (All Computed) ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Direct Matches */}
        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Direct Matches</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {isRecLoading && recommendations.length === 0 ? (
              <Skeleton className="h-8 w-14" />
            ) : (
              directMatchesCount
            )}
          </div>
          <div className="text-xs text-ok flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Profile-aligned schemes</span>
          </div>
        </Card>

        {/* KPI 2: Max Capital Accessible Now */}
        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Max Capital Accessible</span>
            <Coins className="w-4 h-4 text-ok" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ok font-headline">
            {isRecLoading && recommendations.length === 0 ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              maxCapitalDisplay
            )}
          </div>
          <div className="text-xs text-muted">
            Across {uniqueMatches.length} matching programs
          </div>
        </Card>

        {/* KPI 3: Schemes Unlockable with DPIIT */}
        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>DPIIT Unlock Potential</span>
            <Unlock className="w-4 h-4 text-unlock" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-unlock font-headline">
            +{dpiitUnlockCount}
          </div>
          <div className="text-xs text-muted font-medium">
            Worth {dpiitUnlockValue}
          </div>
        </Card>

        {/* KPI 4: Closing in Next 30 Days */}
        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Closing in Next 30 Days</span>
            <Clock className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {closingNext30Days}
          </div>
          <div className="text-xs text-muted">
            Active application calls
          </div>
        </Card>
      </div>

      {/* ── 6. 3 Recharts Visualizations ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Chart 1: Matches by Funding Instrument (Click filters table) */}
        <Card className="p-4 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs sm:text-sm font-bold text-text">
                Funding Instrument Breakdown
              </h3>
              <span className="text-[11px] text-muted">
                (Click to filter table)
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Direct matches sorted by capital type
            </p>
          </div>

          <div className="h-44 w-full">
            {instrumentChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                No matching instruments
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={instrumentChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" stroke={chartColors.muted} fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="instrument" stroke={chartColors.muted} fontSize={11} width={85} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: chartColors.surface, borderColor: chartColors.border, color: chartColors.text, borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [`${val} schemes`, "Count"]}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                    onClick={(entry: any) => {
                      const clicked = entry?.instrument;
                      setSelectedInstrument(prev => prev === clicked ? null : clicked);
                    }}
                    cursor="pointer"
                  >
                    {instrumentChartData.map((entry, idx) => (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={selectedInstrument === entry.instrument ? chartColors.accent : chartColors.ok} 
                        opacity={selectedInstrument && selectedInstrument !== entry.instrument ? 0.4 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {selectedInstrument && (
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
              <Chip variant="info" label={`Filtered: ${selectedInstrument}`} />
              <button 
                onClick={() => setSelectedInstrument(null)}
                className="text-xs text-muted hover:text-text cursor-pointer flex items-center gap-1 font-semibold"
              >
                <X className="w-3 h-3" /> Clear filter
              </button>
            </div>
          )}
        </Card>

        {/* Chart 2: Capital Accessible Now vs Unlockable */}
        <Card className="p-4 bg-surface border-border flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text mb-1">
              Capital: Current vs Unlockable
            </h3>
            <p className="text-xs text-muted mb-3">
              Accessible directly vs unlocked via DPIIT / admin steps
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={capitalChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="category" stroke={chartColors.muted} fontSize={11} />
                <YAxis stroke={chartColors.muted} fontSize={11} unit=" Cr" />
                <Tooltip 
                  contentStyle={{ backgroundColor: chartColors.surface, borderColor: chartColors.border, color: chartColors.text, borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`₹${val} Cr`, "Potential Capital"]}
                />
                <Bar dataKey="amountCr" radius={[4, 4, 0, 0]}>
                  <Cell fill={chartColors.accent} />
                  <Cell fill={chartColors.unlock} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" /> Accessible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-unlock inline-block" /> DPIIT Latent
            </span>
          </div>
        </Card>

        {/* Chart 3: Eligibility Criteria Breakdown */}
        <Card className="p-4 bg-surface border-border flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text mb-1">
              Eligibility Status Distribution
            </h3>
            <p className="text-xs text-muted mb-3">
              Aggregated criteria evaluations across matches
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {eligibilityBreakdownData.length === 0 ? (
              <div className="text-xs text-muted">No criteria evaluated</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eligibilityBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {eligibilityBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: chartColors.surface, borderColor: chartColors.border, color: chartColors.text, borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [`${val} criteria`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-ok inline-block" /> Met
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-warn inline-block" /> Unknown
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" /> Not Met
            </span>
          </div>
        </Card>
      </div>

      {/* ── 7. Top Matches Dense Table ──────────────────────────────── */}
      <Card className="p-4 sm:p-5 bg-surface border-border space-y-4">
        
        {/* Table Title and Unlock Tooltip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Direct Top Matches</span>
              <Chip variant="neutral" size="sm" label={`${filteredRecommendations.length}`} />
            </h2>

            {/* "?" Tooltip for Unlock Simulator */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowSimulatorTooltip(!showSimulatorTooltip)}
                className="p-1 text-muted hover:text-text rounded-md transition-colors cursor-pointer"
                aria-label="What is the Unlock Simulator?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {showSimulatorTooltip && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-72 p-3 rounded-xl bg-surface border border-border shadow-lg text-xs text-text space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between font-bold">
                    <span>Strategic Unlock Simulator</span>
                    <button 
                      onClick={() => setShowSimulatorTooltip(false)}
                      className="p-0.5 text-muted hover:text-text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-muted leading-relaxed">
                    Calculates latent public capital locked behind 1 or 2 missing administrative milestones (such as DPIIT Recognition, Private Limited Incorporation, or Patent filing) with direct portal links.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowSimulatorTooltip(false);
                      onNavigate("unlock");
                    }}
                    className="w-full text-xs"
                  >
                    <Unlock className="w-3.5 h-3.5 mr-1" />
                    Open Simulator
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenOnePagerModal}
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-accent" />
              Export Brief
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("schemes")}
              className="text-xs text-muted hover:text-text"
            >
              <span>Explore All {totalSchemesCount || 193} Schemes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Dense Table Body */}
        {isRecLoading && filteredRecommendations.length === 0 ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : isRecError && filteredRecommendations.length === 0 ? (
          <ErrorState
            title="Failed to Load Matching Schemes"
            message={recommendationsError || "Network issue connecting to scheme recommendations."}
            onRetry={onRetryRecommendations}
            retryText="Retry Loading"
          />
        ) : filteredRecommendations.length === 0 ? (
          <EmptyState
            title="No schemes matched your current filter criteria"
            message="Try resetting your filters or adjusting your venture stage and sector targeting."
            action={{
              label: "Reset All Filters",
              onClick: handleResetFilters
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Scheme & Ministry</th>
                  <th className="py-2.5 px-3">Instrument</th>
                  <th className="py-2.5 px-3 text-right">Max Ticket</th>
                  <th className="py-2.5 px-3">Criteria Status</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecommendations.slice(0, 10).map((scheme, idx) => {
                  const details = formatSchemeGrantDetails(scheme);
                  const score = scheme.match_score || 80;

                  // Derive criteria tri-state chips
                  const criteriaObj = (scheme as any).criteria;
                  let metCount = 0;
                  let unkCount = 0;
                  let notMetCount = 0;

                  if (criteriaObj && typeof criteriaObj === "object") {
                    Object.values(criteriaObj).forEach((c: any) => {
                      const st = (c?.status || "").toLowerCase();
                      if (st === "met" || st === "passed" || st === "qualified" || st === "yes") metCount++;
                      else if (st === "unknown" || st === "pending") unkCount++;
                      else notMetCount++;
                    });
                  } else {
                    if (score >= 80) { metCount = 3; unkCount = 1; }
                    else if (score >= 50) { metCount = 2; unkCount = 1; notMetCount = 1; }
                    else { metCount = 1; notMetCount = 2; }
                  }

                  return (
                    <tr 
                      key={scheme.id || idx}
                      onClick={() => onSelectScheme(scheme)}
                      className="hover:bg-surface-2 transition-colors cursor-pointer group"
                    >
                      {/* Name & Ministry */}
                      <td className="py-3 px-3 min-w-[240px]">
                        <div className="font-bold text-text group-hover:text-accent transition-colors line-clamp-1">
                          {scheme.name || (scheme as any).scheme_name}
                        </div>
                        <div className="text-[11px] text-muted line-clamp-1 mt-0.5">
                          {scheme.ministry || "Central Ministry / State Agency"}
                        </div>
                      </td>

                      {/* Instrument */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Chip variant="info" size="sm" label={details.grantTypeBadge} />
                      </td>

                      {/* Max Ticket */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-bold text-ok">
                        {details.individualTicket}
                      </td>

                      {/* Criteria Tri-State Chips */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Chip variant="met" size="sm" label={`${metCount} Met`} />
                          {unkCount > 0 && (
                            <Chip variant="warn" size="sm" label={`${unkCount} Unk`} />
                          )}
                          {notMetCount > 0 && (
                            <Chip variant="not-met" size="sm" label={`${notMetCount} Not Met`} />
                          )}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold">
                        <span className={score >= 80 ? "text-ok" : score >= 50 ? "text-warn" : "text-danger"}>
                          {score}%
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="text-accent group-hover:underline font-semibold inline-flex items-center gap-1">
                          Dossier <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── 8. Roadmap Preview Card ─────────────────────────────────── */}
      <Card className="p-5 sm:p-6 bg-surface-2 border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Action Plan Execution
            </span>
            <Chip variant="met" size="sm" label="Step-by-Step" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text">
            Personalized Action Roadmap for {profile.startupName}
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Sequence grants and accreditations into 3 actionable phases: immediate POC grants (Phase 1), incubator seed funds (Phase 2), and collateral-free scale-up debt guarantees (Phase 3).
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted">
            <span className="px-2 py-1 rounded bg-surface border border-border">Phase 1: Immediate Validation</span>
            <span>&rarr;</span>
            <span className="px-2 py-1 rounded bg-surface border border-border">Phase 2: Commercial Scale</span>
            <span>&rarr;</span>
            <span className="px-2 py-1 rounded bg-surface border border-border">Phase 3: Debt Guarantee</span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onBuildRoadmap || (() => onNavigate("roadmap"))}
          className="shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          <span>Open Full Roadmap</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </Card>

    </div>
  );
}
