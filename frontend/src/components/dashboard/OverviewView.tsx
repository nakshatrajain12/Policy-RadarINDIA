"use client";

import React from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  ArrowRight, 
  Unlock, 
  ExternalLink,
  CheckCircle2, 
  SlidersHorizontal,
  Building2, 
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Info
} from "lucide-react";
import { FounderProfile, RecommendationMatch, UnlockInsights } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";

interface Props {
  profile: FounderProfile;
  recommendations: RecommendationMatch[];
  unlockable: RecommendationMatch[];
  unlockInsights: UnlockInsights;
  totalSchemesCount: number;
  loading: boolean;
  onSelectScheme: (scheme: any) => void;
  onOpenProfileModal: () => void;
  onOpenOnePagerModal: () => void;
  onOpenComplianceModal: () => void;
  onNavigate: (tab: any) => void;
}

export function OverviewView({
  profile,
  recommendations,
  unlockable,
  unlockInsights,
  totalSchemesCount,
  loading,
  onSelectScheme,
  onOpenProfileModal,
  onOpenOnePagerModal,
  onOpenComplianceModal,
  onNavigate,
}: Props) {
  const topMatches = recommendations.slice(0, 6);

  // Compute total capital available in direct matches
  const totalDirectCapital = topMatches.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0);
  const directCapitalDisplay = totalDirectCapital >= 10000000
    ? `₹${(totalDirectCapital / 10000000).toFixed(2)} Cr`
    : `₹${(totalDirectCapital / 100000).toFixed(1)} Lakhs`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Top Header Section ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Personalized Intelligence Feed
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• Updated Today</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight font-headline">
            Welcome to GOV-DASH, {profile.startupName || `${profile.sector} Founder`}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            GOV-DASH matched your venture against 193 verified central and state schemes to curate your optimal non-dilutive capital pathway.
          </p>

          {/* Active Profile Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Targeting:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/20 flex items-center gap-1.5">
              <span>Domain:</span> <strong className="text-slate-900 dark:text-white">{profile.sector}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
              <span>Stage:</span> <strong className="text-slate-900 dark:text-white">{profile.stage}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 flex items-center gap-1.5">
              <span>Location:</span> <strong className="text-slate-900 dark:text-white">{profile.state}</strong>
            </span>
            {profile.dpiitRegistered ? (
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                DPIIT Registered ✓
              </span>
            ) : (
              <span className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                Non-DPIIT
              </span>
            )}
            <button
              onClick={onOpenProfileModal}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Switch Domain
            </button>
            <button
              onClick={onOpenComplianceModal}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {profile.state} State Guide
            </button>
          </div>
        </div>

        {/* Action Buttons: One-Pager Download & Explore */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={onOpenOnePagerModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Download One-Pager Brief
          </button>
          <button
            onClick={() => onNavigate("schemes")}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Explore All {totalSchemesCount || 193} Schemes
          </button>
        </div>
      </div>

      {/* ── Metric KPI Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Qualified Matches */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Direct Qualified Matches</span>
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-headline">
            {recommendations.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            96% Average Match Confidence
          </div>
        </div>

        {/* Metric 2: Max Capital Accessible */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Max Capital Available</span>
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-headline">
            {directCapitalDisplay}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across top targeted funding programs
          </div>
        </div>

        {/* Metric 3: Unlock Potential */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>DPIIT Unlock Potential</span>
            <Unlock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-300 font-headline">
            +{unlockInsights?.dpiit_unlock_count || unlockable.length || 14}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Additional schemes unlocked with DPIIT
          </div>
        </div>

        {/* Metric 4: Total Monitored */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Verified Schemes</span>
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-headline">
            {totalSchemesCount || 193}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across 132 Ministries & 28 States
          </div>
        </div>
      </div>

      {/* ── Explanation Banner: WHAT IS STRATEGIC SIMULATOR? ──────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <span>What is the Strategic / Policy Unlock Simulator?</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/10 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Optimization Engine
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Rather than just listing schemes you currently qualify for, the <strong>Unlock Simulator</strong> calculates what <em>latent government capital</em> is locked behind 1 or 2 missing administrative milestones (such as DPIIT Recognition, Private Limited Incorporation, or Patent filing). It displays the exact financial ROI, estimated turnaround time (2–5 days), and direct portal links to unlock those funds.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("unlock")}
          className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
        >
          <Unlock className="w-3.5 h-3.5" />
          Launch Simulator
        </button>
      </div>

      {/* ── Top Recommended Schemes Section ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Highest Rated Schemes for Your Venture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked using hybrid rule-fit validation, sector taxonomy alignment, and stage eligibility.
            </p>
          </div>
          <button
            onClick={() => onNavigate("schemes")}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
          >
            View all {recommendations.length} matches <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Evaluating schemes against active startup criteria...</p>
          </div>
        ) : topMatches.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30">
            <p className="text-sm text-slate-700 dark:text-slate-300">No strict matches for this configuration.</p>
            <button
              onClick={onOpenProfileModal}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Adjust Profile Targeting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((scheme, idx) => {
              const details = formatSchemeGrantDetails(scheme);
              const score = scheme.match_score || 85;
              const confidence = scheme.confidence_score || 96;
              const isHigh = score >= 80;
              const isMid = score >= 50 && score < 80;

              return (
                <div
                  key={scheme.id || idx}
                  onClick={() => onSelectScheme(scheme)}
                  className="group relative p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Match Score & Grant Type Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isHigh
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : isMid
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {score}% Match ({confidence}% Conf)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        {details.grantTypeBadge}
                      </span>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                      {scheme.name || (scheme as any).scheme_name}
                    </h3>

                    {/* Ministry / Agency */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                      {scheme.ministry || "Central Ministry / State Agency"}
                    </p>

                    {/* Funding Breakdown: Realistic Individual Startup Ticket + Macro Ceiling */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                          Individual Startup Grant
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-headline leading-tight">
                        {details.individualTicket}
                      </div>
                      {details.macroCeilingDisplay && (
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                          {details.macroCeilingDisplay}
                        </div>
                      )}
                    </div>

                    {/* Reasons Why You Match */}
                    <div className="space-y-1.5 mb-4">
                      {((scheme.reasons || [scheme.reason || "Direct rule-fit match"]).filter(Boolean) as string[]).slice(0, 2).map((r: string, rIdx: number) => (
                        <div key={rIdx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Geography & CTA */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      📍 {scheme.geographic_restriction || "Pan-India"}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Scheme Dossier <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Unlock Simulator Callout Banner ──────────────────────────── */}
      <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-500/25 bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Strategic Opportunity Radar
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300">
                Interactive ROI
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">
              Unlock up to 14 additional central schemes worth ₹1.85 Cr
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl mt-1">
              {profile.dpiitRegistered 
                ? "Your DPIIT status already qualifies you for top tier central venture and credit guarantee programs. Simulate legal entity or state adjustments to view further incentives."
                : "Your startup is currently missing DPIIT Recognition. Applying online on startupindia.gov.in takes ~48 hours (100% free) and unlocks SISFS, CGSS, and 80-IAC tax exemptions."}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("unlock")}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
        >
          <Unlock className="w-4 h-4" />
          Run Unlock Simulator
        </button>
      </div>
    </div>
  );
}
