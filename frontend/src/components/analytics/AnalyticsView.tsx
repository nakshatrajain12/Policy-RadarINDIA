"use client";

import React from "react";
import { 
  Building2, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Grid, 
  Compass,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { AnalyticsBundle } from "@/types";
import { ResourceStatus } from "@/hooks/useAppData";

interface Props {
  data: AnalyticsBundle | null;
  status: ResourceStatus;
  error?: string | null;
  isLocalFallback?: boolean;
  onRetry?: () => void;
}

export function AnalyticsView({ 
  data, 
  status, 
  error, 
  isLocalFallback, 
  onRetry 
}: Props) {
  // 1. Loading Skeleton State (Never a bare spinner)
  if (status === "loading" && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-96 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-120 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        {/* AI Brief Skeleton */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-72" />
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-72" />
        </div>
      </div>
    );
  }

  // 2. Error State with Retry Button
  if (status === "error" && !data) {
    return (
      <div className="p-12 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 max-w-xl mx-auto my-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Unable to Load Policy Analytics
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {error || "An error occurred while connecting to the analytics engine."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Analytics</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (!data || !data.summary || data.summary.total_schemes === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 max-w-xl mx-auto my-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Scheme Analytics Available
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No public policy records found matching current criteria.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Analytics</span>
          </button>
        )}
      </div>
    );
  }

  const { 
    summary, 
    instrument_breakdown, 
    regional_corridors, 
    top_ministries, 
    sector_distribution, 
    gap_heatmap, 
    ai_brief 
  } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              National Policy Landscape
            </span>
            {isLocalFallback ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Computed locally
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • Real-Time Aggregation
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight font-headline">
            Policy Intelligence & Capital Allocation Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Macro-level intelligence on government startup capital flows, funding instruments, stage allocations, and regional policy coverage.
          </p>
        </div>
      </div>

      {/* ── AI Executive Policy Brief ─────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-500/25 bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-blue-950/25 dark:via-slate-900 dark:to-indigo-950/25 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Executive Policy Intelligence Brief
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fact-Checked Against Database
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
          {ai_brief}
        </p>
      </div>

      {/* ── Total Money by Funding Instrument ─────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Total Capital Allocation by Funding Instrument
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Breakdown of public capital available across non-dilutive grants, debt guarantees, venture equity and statutory subsidies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(instrument_breakdown || []).map((item, idx) => (
            <div 
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.instrument}
                  </span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mt-1 font-headline">
                  {item.total_display}
                </div>
                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  {item.scheme_count} Active Frameworks
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Macro KPI Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Verified Schemes</span>
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white font-headline">
            {summary.total_schemes}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {summary.pan_india_schemes} Pan-India • {summary.state_schemes} State Missions
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Avg Max Funding Cap</span>
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-headline">
            {summary.avg_max_funding_display}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Average ceiling per targeted grant
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Ministries & Agencies</span>
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white font-headline">
            {summary.unique_ministries}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Central depts & state innovation cells
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>States & UTs Covered</span>
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white font-headline">
            28+
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Active state innovation policies
          </div>
        </div>
      </div>

      {/* ── Two-Column Charts: Top Ministries & Sector Distribution ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ministries by Scheme Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Leading Government Nodal Authorities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ministries and departments with highest scheme density.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(top_ministries || []).slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="ministry" type="category" width={110} stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "12px", color: "#fff" }}
                  formatter={(val: unknown) => [`${val} Schemes`, "Total Schemes"]}
                />
                <Bar dataKey="scheme_count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Scheme Volume by Technology Sector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of programs targeting specific verticals.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(sector_distribution || []).slice(0, 7)}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <XAxis 
                  dataKey="sector" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  angle={-20} 
                  textAnchor="end" 
                  interval={0} 
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "12px", color: "#fff" }}
                  formatter={(val: unknown) => [`${val} Schemes`, "Total Schemes"]}
                />
                <Bar dataKey="scheme_count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Sector x Stage Opportunity Gap Matrix ─────────────────────── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Grid className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Funding Density & Opportunity Gap Matrix (Sector vs. Stage)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Heatmap highlighting policy saturation versus capital white-spaces across maturity stages.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Industry Vertical</th>
                <th className="py-2.5 px-3 text-center">Idea / Concept</th>
                <th className="py-2.5 px-3 text-center">Prototype / MVP</th>
                <th className="py-2.5 px-3 text-center">Early Revenue</th>
                <th className="py-2.5 px-3 text-center">Growth / Scale-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {(gap_heatmap || []).map((row, rIdx) => {
                const getHeatBg = (val: number) => {
                  if (val >= 25) return "bg-blue-600/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30";
                  if (val >= 12) return "bg-blue-500/10 text-blue-600 dark:text-blue-300 font-semibold";
                  if (val >= 5) return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
                  return "bg-slate-50 dark:bg-slate-950/40 text-slate-400";
                };

                return (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {row.sector}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs ${getHeatBg(Number(row["Idea"]) || 0)}`}>
                        {Number(row["Idea"]) || 0} schemes
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs ${getHeatBg(Number(row["Prototype/MVP"]) || 0)}`}>
                        {Number(row["Prototype/MVP"]) || 0} schemes
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs ${getHeatBg(Number(row["Early Revenue"]) || 0)}`}>
                        {Number(row["Early Revenue"]) || 0} schemes
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs ${getHeatBg(Number(row["Growth/Scale-up"]) || 0)}`}>
                        {Number(row["Growth/Scale-up"]) || 0} schemes
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Regional Innovation Corridors ─────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Regional Innovation Corridors & Nationwide Policy Access
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authoritative geographic distribution grouping central frameworks and regional startup missions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(regional_corridors || []).map((corr, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {corr.region}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {corr.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {corr.coverage}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Cluster Capacity:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {corr.count}+ Frameworks
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
