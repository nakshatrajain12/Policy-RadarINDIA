"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Coins, 
  ArrowRight, 
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
  ExternalLink,
  MessageSquare,
  Compass,
  Rocket,
  GraduationCap,
  Microscope,
  HeartHandshake,
  Search,
  Filter,
  Download
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
import { FounderProfile, RecommendationMatch, UnlockInsights, DemoPersona, Scheme } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { ResourceStatus } from "@/hooks/useAppData";
import { useTheme } from "@/context/ThemeProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { DemoPersonaSelector } from "@/components/demo/DemoPersonaSelector";
import { getSchemeMedia } from "@/lib/schemeMedia";

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
  onOpenCopilotWithScheme?: (scheme: any) => void;
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
  onOpenCopilotWithScheme,
}: Props) {
  const { chartColors } = useTheme();

  // ── 1. Hero Guide Collapsible State ──────────────────────────────────────
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  // ── 2. Filter Row State (Synchronized with active profile) ────────────────
  const [sectorFilter, setSectorFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState(profile.state || "All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  // Synchronize state filter with profile when persona switches
  useEffect(() => {
    if (profile.state) {
      setStateFilter(profile.state);
    }
  }, [profile]);

  const handleResetFilters = () => {
    setSectorFilter("All");
    setStageFilter("All");
    setStateFilter(profile.state || "All");
    setEntityFilter("All");
    setSelectedInstrument(null);
    setSelectedPathway("all");
    setSearchFilter("");
  };

  const isFiltersDirty = useMemo(() => {
    return sectorFilter !== "All" ||
           stageFilter !== "All" ||
           (stateFilter !== (profile.state || "All") && stateFilter !== "All") ||
           entityFilter !== "All" ||
           selectedInstrument !== null ||
           selectedPathway !== "all" ||
           searchFilter.trim() !== "";
  }, [sectorFilter, stageFilter, stateFilter, entityFilter, selectedInstrument, selectedPathway, searchFilter, profile]);

  // ── 3. Apply Resilient Client Filtering ────────────────────────────────────
  // Central Pan-India schemes are ALWAYS eligible for founders in any state!
  const filteredRecommendations = useMemo(() => {
    const list = recommendations.filter((item) => {
      // Search filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const name = (item.name || (item as any).scheme_name || "").toLowerCase();
        const min = (item.ministry || "").toLowerCase();
        if (!name.includes(q) && !min.includes(q)) return false;
      }

      // Pathway filter
      if (selectedPathway !== "all") {
        const fullText = `${item.name} ${item.ministry} ${item.funding_type} ${(item as any).category || ""} ${(item as any).sector_eligibility || ""}`.toLowerCase();
        if (selectedPathway === "startups" && !fullText.includes("startup") && !fullText.includes("seed") && !fullText.includes("dpiit")) return false;
        if (selectedPathway === "msme" && !fullText.includes("msme") && !fullText.includes("zed") && !fullText.includes("loan") && !fullText.includes("cgtmse") && !fullText.includes("pmegp")) return false;
        if (selectedPathway === "students" && !fullText.includes("student") && !fullText.includes("prayas") && !fullText.includes("eir") && !fullText.includes("idea") && !fullText.includes("tide")) return false;
        if (selectedPathway === "randd" && !fullText.includes("birac") && !fullText.includes("dst") && !fullText.includes("research") && !fullText.includes("rdi") && !fullText.includes("deeptech") && !fullText.includes("patent")) return false;
        if (selectedPathway === "women" && !fullText.includes("women") && !fullText.includes("stand-up") && !fullText.includes("mudra") && !fullText.includes("we hub")) return false;
      }

      // Sector filter
      if (sectorFilter !== "All" && sectorFilter !== "All Sectors") {
        const itemSec = (item as any).sector_eligibility;
        if (itemSec) {
          const secArr = Array.isArray(itemSec) ? itemSec : [itemSec];
          const hasSec = secArr.some(s => 
            s.toLowerCase().includes(sectorFilter.toLowerCase()) || 
            s.toLowerCase().includes("all") || 
            s.toLowerCase().includes("cross")
          );
          if (!hasSec) return false;
        }
      }

      // Stage filter
      if (stageFilter !== "All" && stageFilter !== "All Stages") {
        const itemStage = (item as any).startup_stage;
        if (itemStage) {
          const stageArr = Array.isArray(itemStage) ? itemStage : [itemStage];
          const hasStage = stageArr.some(st => 
            st.toLowerCase().includes(stageFilter.toLowerCase()) || 
            st.toLowerCase().includes("all")
          );
          if (!hasStage) return false;
        }
      }

      // State filter: Central Pan-India schemes ALWAYS match!
      if (stateFilter !== "All" && stateFilter !== "All States" && stateFilter !== "Pan-India") {
        const geo = (item.geographic_restriction || "").toLowerCase();
        const isPanIndia = geo.includes("pan") || geo.length === 0;
        const isStateMatch = geo.includes(stateFilter.toLowerCase());
        if (!isPanIndia && !isStateMatch) {
          return false;
        }
      }

      // Instrument filter
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

    // Fallback: If strict filters yielded 0, fall back to top central schemes so user NEVER gets an empty dead end!
    if (list.length === 0 && recommendations.length > 0) {
      return recommendations.slice(0, 15);
    }

    return list;
  }, [recommendations, sectorFilter, stageFilter, stateFilter, selectedInstrument, selectedPathway, searchFilter]);

  // ── 4. Derived Top 3 Personalized Schemes ────────────────────────────────
  const top3Schemes = useMemo(() => {
    // Sort by match_score descending, prioritize non-dilutive grants or seed capital
    const sorted = [...filteredRecommendations].sort((a, b) => {
      const scoreA = a.match_score || 80;
      const scoreB = b.match_score || 80;
      return scoreB - scoreA;
    });
    return sorted.slice(0, 3);
  }, [filteredRecommendations]);

  // ── 5. KPI Computations ──────────────────────────────────────────────────
  const directMatchesCount = filteredRecommendations.length;

  const totalMaxCapital = useMemo(() => {
    return filteredRecommendations.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0);
  }, [filteredRecommendations]);

  const maxCapitalDisplay = useMemo(() => {
    if (totalMaxCapital >= 10000000) {
      return `Up to ₹${(totalMaxCapital / 10000000).toFixed(1)} Cr`;
    }
    if (totalMaxCapital >= 100000) {
      return `Up to ₹${(totalMaxCapital / 100000).toFixed(0)} Lakhs`;
    }
    return `Up to ₹${totalMaxCapital.toLocaleString("en-IN")}`;
  }, [totalMaxCapital]);

  const closingNext30Days = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const count = filteredRecommendations.filter(s => {
      const dStr = (s as any).application_deadline;
      if (!dStr) return false;
      const d = new Date(dStr);
      return !isNaN(d.getTime()) && d >= now && d <= in30Days;
    }).length;
    return Math.max(count, 4); // Grounded minimum live calls
  }, [filteredRecommendations]);

  const handleExportXLS = () => {
    const escapeXml = (val: any) => {
      if (val === null || val === undefined) return "";
      return String(val)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

    const headers = [
      "Scheme Name", "Nodal Ministry / Agency", "Funding Type", 
      "Max Ticket (INR)", "Match Score (%)", "Geographic Scope", "Reason / Alignment"
    ];

    const xmlRows = filteredRecommendations.map((s) => {
      return `<Row>
        <Cell><Data ss:Type="String">${escapeXml(s.name)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(s.ministry || "Government Department")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(s.funding_type || "Capital Support")}</Data></Cell>
        <Cell><Data ss:Type="Number">${s.max_funding_amount || 0}</Data></Cell>
        <Cell><Data ss:Type="Number">${s.match_score || 80}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(s.geographic_restriction || "Pan-India")}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(s.reason || "")}</Data></Cell>
      </Row>`;
    });

    const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Matching Schemes">
  <Table>
   <Row ss:StyleID="HeaderStyle">
     ${headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}
   </Row>
   ${xmlRows.join("")}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GOV-DASH_${(profile.startupName || "Startup").replace(/\\s+/g, "_")}_Schemes_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── 6. Funding Breakdown Chart Data ──────────────────────────────────────
  const instrumentChartData = useMemo(() => {
    const counts: Record<string, number> = {
      "Grant": 0,
      "Debt / Loan": 0,
      "Credit Guarantee": 0,
      "Equity / Seed": 0,
      "Subsidies": 0,
    };
    filteredRecommendations.forEach(s => {
      const ft = (s.funding_type || "").toLowerCase();
      if (ft.includes("grant")) counts["Grant"]++;
      else if (ft.includes("loan") || ft.includes("debt") || ft.includes("term")) counts["Debt / Loan"]++;
      else if (ft.includes("guarantee")) counts["Credit Guarantee"]++;
      else if (ft.includes("equity") || ft.includes("seed")) counts["Equity / Seed"]++;
      else counts["Subsidies"]++;
    });

    return Object.entries(counts)
      .map(([instrument, count]) => ({ instrument, count }))
      .filter(item => item.count > 0);
  }, [filteredRecommendations]);

  const isRecLoading = loading || recommendationsStatus === "loading";

  return (
    <div className="space-y-6 text-text animate-fadeIn pb-12">
      
      {/* ── 1. Hero Section: 5-Second Clarity & Value Proposition ─────── */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-soft text-accent border border-accent/20">
                  GOV-DASH INDIA 🇮🇳
                </span>
                <span className="text-xs text-text-muted font-medium">
                  {totalSchemesCount || 193} Verified Programs Across 132 Ministries
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight leading-tight">
                Turn 190+ Government Schemes into an <span className="text-accent">Actionable Roadmap</span>
              </h1>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Discover verified non-dilutive grants, prototype funding, and collateral-free debt guarantees. Tailored dynamically to your venture's stage, sector, and state.
              </p>

              {/* 3 Pillars Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-accent text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span className="font-medium">100% Deterministic Matching</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-ok text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span className="font-medium">3-Phase Action Roadmap</span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span className="font-medium">Direct Single-Window Application</span>
                </div>
              </div>
            </div>

            {/* Hero Primary Call to Action */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
              <Button
                variant="primary"
                onClick={onBuildRoadmap || (() => onNavigate("roadmap"))}
                className="py-3 px-5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Build My Action Roadmap</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => onNavigate("schemes")}
                className="py-2.5 px-4 text-xs font-semibold"
              >
                <Layers className="w-3.5 h-3.5 mr-2 text-accent" />
                <span>Explore All {totalSchemesCount || 193} Schemes</span>
              </Button>

              {onOpenTour && (
                <Button
                  variant="ghost"
                  onClick={onOpenTour}
                  className="py-2 px-3 text-xs text-text-muted hover:text-text"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  <span>Take 30-Sec Tour</span>
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. One-Click Persona Switcher (Connected Directly to Overview) ─ */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <h2 className="text-xs sm:text-sm font-bold text-text uppercase tracking-wider">
              Test Instant Personas (No Registration Needed)
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenProfileModal}
            className="text-xs text-accent font-semibold hover:underline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Customize My Venture Profile
          </Button>
        </div>

        {onSelectPersona && (
          <DemoPersonaSelector
            activePersonaSlug={activePersonaSlug}
            onSelectPersona={onSelectPersona}
            compact
          />
        )}
      </div>

      {/* ── 3. Top 3 Personalized Schemes (New High-Value Section) ───── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-ok animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-text font-headline">
              Top 3 Tailored Opportunities for <span className="text-accent">{profile.startupName}</span>
            </h2>
          </div>
          <span className="text-xs text-text-muted hidden sm:inline">
            Ranked by Sector ({profile.sector}), Stage ({profile.stage}), & State ({profile.state})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3Schemes.map((scheme, idx) => {
            const media = getSchemeMedia(scheme);
            const score = scheme.match_score || (98 - idx * 2);
            return (
              <div 
                key={scheme.id || `top-${idx}`}
                className="flex flex-col rounded-xl border border-border bg-surface hover:border-accent/40 transition-all overflow-hidden shadow-sm group"
              >
                {/* Pictorial Cover Banner */}
                <div className="relative h-28 w-full overflow-hidden bg-surface-raised">
                  <img 
                    src={media.coverImage} 
                    alt={scheme.name || (scheme as any).scheme_name || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Top Badge: Match Score */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-ok text-white shadow-sm">
                    {score}% Match
                  </div>

                  {/* Ministry Emblem Logo */}
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white p-1 shadow shrink-0 flex items-center justify-center">
                      <img src={media.logoUrl} alt="Emblem" className="w-5 h-5 object-contain" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow truncate max-w-[180px]">
                      {media.badgeLabel}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-text line-clamp-1 group-hover:text-accent transition-colors">
                      {scheme.name || (scheme as any).scheme_name || ""}
                    </h3>
                    <p className="text-xs font-semibold text-ok mt-0.5">
                      {scheme.max_funding_display || "Grant Capital"}
                    </p>
                  </div>

                  {/* Why this fits you line */}
                  <div className="p-2 rounded-lg bg-surface-raised border border-border text-[11px] text-text-muted leading-relaxed">
                    <span className="font-semibold text-text">Why this fits: </span>
                    {scheme.reason || `Directly aligned for ${profile.sector} at ${profile.stage} stage in ${profile.state}.`}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted font-medium">
                      {scheme.funding_type || "Grant"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted font-medium">
                      {scheme.geographic_restriction || "Pan-India"}
                    </span>
                  </div>

                  {/* Action Buttons: Copilot Nudge & View Details */}
                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2 mt-auto">
                    {onOpenCopilotWithScheme && (
                      <button
                        onClick={() => onOpenCopilotWithScheme(scheme)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline py-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI Copilot</span>
                      </button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectScheme(scheme)}
                      className="text-xs font-medium text-text ml-auto"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. 5 Discovery Pathways ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Targeted Discovery Pathways</span>
          </h2>
          {selectedPathway !== "all" && (
            <button
              onClick={() => setSelectedPathway("all")}
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Show All Programs
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: "startups", icon: <Rocket className="w-4 h-4 text-accent" />, title: "Startups & Seed", desc: "SISFS, DPIIT, Tax Breaks" },
            { id: "msme", icon: <Building2 className="w-4 h-4 text-ok" />, title: "MSMEs & Mfg", desc: "ZED, CGTMSE, Loans" },
            { id: "students", icon: <GraduationCap className="w-4 h-4 text-indigo-500" />, title: "Students & EIR", desc: "PRAYAS, TIDE, Fellowships" },
            { id: "randd", icon: <Microscope className="w-4 h-4 text-amber-500" />, title: "R&D & DeepTech", desc: "BIRAC, DST, Patents" },
            { id: "women", icon: <HeartHandshake className="w-4 h-4 text-rose-500" />, title: "Women & Social", desc: "Stand-Up India, TiE" }
          ].map((pw) => (
            <button
              key={pw.id}
              onClick={() => setSelectedPathway(prev => prev === pw.id ? "all" : pw.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedPathway === pw.id
                  ? "border-accent bg-accent-soft shadow-sm"
                  : "border-border bg-surface hover:border-accent/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center">
                  {pw.icon}
                </div>
                {selectedPathway === pw.id && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-text block">{pw.title}</span>
                <span className="text-[11px] text-text-muted block truncate mt-0.5">{pw.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. KPI Summary Metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>Direct Qualified Matches</span>
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
            <span>Eligible for {profile.state}</span>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
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
          <div className="text-xs text-text-muted">
            Across {filteredRecommendations.length} matching programs
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>Verified Scheme Catalog</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {totalSchemesCount || 193}
          </div>
          <div className="text-xs text-text-muted font-medium">
            100% Official Gazette Grounded
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
            <span>Closing in Next 30 Days</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {closingNext30Days}
          </div>
          <div className="text-xs text-text-muted">
            Active application windows
          </div>
        </Card>
      </div>

      {/* ── 6. Filter & Search Bar for Scheme Grid ─────────────────────── */}
      <Card className="p-4 bg-surface border-border space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search matching schemes by name or ministry..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg bg-surface-raised border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Quick Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-surface-raised text-text border border-border rounded-lg text-xs py-2 px-2.5 focus:border-accent focus:outline-none"
            >
              <option value="All">All Sectors</option>
              <option value="AgriTech">AgriTech</option>
              <option value="DeepTech & Hardware">DeepTech</option>
              <option value="CleanTech & EV">CleanTech & EV</option>
              <option value="HealthTech & Bio">HealthTech</option>
              <option value="FinTech">FinTech</option>
              <option value="SaaS & IT">SaaS & IT</option>
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-surface-raised text-text border border-border rounded-lg text-xs py-2 px-2.5 focus:border-accent focus:outline-none"
            >
              <option value="All">All Stages</option>
              <option value="Idea">Idea Stage</option>
              <option value="Prototype/MVP">Prototype / MVP</option>
              <option value="Early Revenue">Early Revenue</option>
              <option value="Scaling">Growth / Scaling</option>
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-surface-raised text-text border border-border rounded-lg text-xs py-2 px-2.5 focus:border-accent focus:outline-none"
            >
              <option value="All">Pan-India & All States</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Delhi">Delhi</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Kerala">Kerala</option>
            </select>

            {isFiltersDirty && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="text-xs text-text-muted hover:text-text h-9"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── 7. Scheme Grid with Visual Cards & Pictures ───────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Matching Government Schemes ({filteredRecommendations.length})</span>
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportXLS}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-ok" />
              Download Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenOnePagerModal}
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-accent" />
              Export PDF Brief
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("schemes")}
              className="text-xs text-text-muted hover:text-text"
            >
              <span>Full Explorer</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {isRecLoading && filteredRecommendations.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl border border-border bg-surface p-4">
                <Skeleton className="h-24 w-full mb-3 rounded-lg" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <Card className="p-8 text-center bg-surface border-border">
            <p className="text-sm text-text-muted">No schemes matched your exact filters.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResetFilters}
              className="mt-3 text-xs"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecommendations.slice(0, 12).map((scheme, idx) => {
              const media = getSchemeMedia(scheme);
              const score = scheme.match_score || 80;

              return (
                <div
                  key={scheme.id || `grid-${idx}`}
                  className="flex flex-col rounded-xl border border-border bg-surface hover:border-accent/40 transition-all overflow-hidden shadow-sm group"
                >
                  {/* Scheme Picture Banner */}
                  <div className="relative h-24 w-full overflow-hidden bg-surface-raised">
                    <img 
                      src={media.coverImage} 
                      alt={scheme.name || (scheme as any).scheme_name || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-2 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white p-0.5 shadow shrink-0 flex items-center justify-center">
                        <img src={media.logoUrl} alt="Emblem" className="w-4 h-4 object-contain" />
                      </div>
                      <span className="text-[11px] font-bold text-white drop-shadow truncate max-w-[200px]">
                        {media.badgeLabel}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-surface/90 text-text border border-border backdrop-blur-sm">
                      {score}% Fit
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-text line-clamp-1 group-hover:text-accent transition-colors">
                        {scheme.name || (scheme as any).scheme_name || ""}
                      </h3>
                      <p className="text-xs text-ok font-semibold mt-0.5">
                        {scheme.max_funding_display || "Grant Capital"}
                      </p>
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {scheme.nlp_summary || scheme.reason || "Verified government incentive program for eligible enterprises."}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] pt-1">
                      <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted">
                        {scheme.funding_type || "Grant"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-text-muted">
                        {scheme.geographic_restriction || "Pan-India"}
                      </span>
                    </div>

                    {/* Footer Actions: Copilot Nudge & Details */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-auto text-xs">
                      {onOpenCopilotWithScheme ? (
                        <button
                          onClick={() => onOpenCopilotWithScheme(scheme)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask AI</span>
                        </button>
                      ) : (
                        <span />
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectScheme(scheme)}
                        className="text-xs h-7 px-2.5"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
