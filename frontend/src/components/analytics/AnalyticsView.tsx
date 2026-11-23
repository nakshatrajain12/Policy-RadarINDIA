"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Building2, 
  Coins, 
  Layers, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  Grid
} from "lucide-react";
import { AnalyticsBundle } from "@/types";
import { ResourceStatus } from "@/hooks/useAppData";
import { useTheme } from "@/context/ThemeProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  data: AnalyticsBundle | null;
  status?: ResourceStatus;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isLocalFallback?: boolean;
}

export function AnalyticsView({
  data,
  status,
  loading,
  error,
  onRetry,
  isLocalFallback = false,
}: Props) {
  const { chartColors } = useTheme();
  const isLoading = loading ?? (status === "loading");

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="space-y-2 pb-4 border-b border-border">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>

        <Skeleton className="h-28 w-full rounded-xl" />

        <div className="space-y-3">
          <Skeleton className="h-6 w-72" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  // 2. Error State with Retry Button
  if (error && !data) {
    return (
      <ErrorState
        title="Unable to Load Policy Analytics"
        message={error || "An error occurred while connecting to the analytics engine."}
        onRetry={onRetry}
        retryText="Retry Analytics"
      />
    );
  }

  // 3. Empty State
  if (!data || !data.summary || data.summary.total_schemes === 0) {
    return (
      <EmptyState
        title="No Scheme Analytics Available"
        message="No public policy records found matching current criteria."
        action={onRetry ? { label: "Refresh Analytics", onClick: onRetry } : undefined}
      />
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

  const tooltipStyle = {
    backgroundColor: chartColors.surface,
    borderColor: chartColors.border,
    borderRadius: "8px",
    fontSize: "12px",
    color: chartColors.text
  };

  return (
    <div className="space-y-8 animate-fadeIn text-text">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Chip variant="info" size="sm">
              National Policy Landscape
            </Chip>
            {isLocalFallback ? (
              <Chip variant="warn" size="sm">
                Computed locally
              </Chip>
            ) : (
              <span className="text-xs text-muted">
                • Real-Time Aggregation
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight font-headline">
            Policy Intelligence & Capital Allocation Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted max-w-2xl">
            Macro-level intelligence on government startup capital flows, funding instruments, stage allocations, and regional policy coverage.
          </p>
        </div>
      </div>

      {/* ── AI Executive Policy Brief ─────────────────────────────────── */}
      <Card className="p-5 sm:p-6 bg-surface-2 border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Executive Policy Intelligence Brief
            </span>
          </div>
          <Chip variant="met" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fact-Checked Against Database
          </Chip>
        </div>
        <p className="text-xs sm:text-sm text-text leading-relaxed font-sans">
          {ai_brief}
        </p>
      </Card>

      {/* ── Total Money by Funding Instrument ─────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Coins className="w-4 h-4 text-ok" />
            Total Capital Allocation by Funding Instrument
          </h2>
          <p className="text-xs text-muted">
            Breakdown of public capital available across non-dilutive grants, debt guarantees, venture equity and statutory subsidies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(instrument_breakdown || []).map((item, idx) => (
            <Card 
              key={idx}
              className="p-4 sm:p-5 bg-surface border-border flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">
                    {item.instrument}
                  </span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-text mt-1 font-headline">
                  {item.total_display}
                </div>
                <div className="text-xs font-semibold text-accent mt-0.5">
                  {item.scheme_count} Active Frameworks
                </div>
              </div>
              <p className="text-xs text-muted pt-2 border-t border-border">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Macro KPI Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="text-xs font-semibold text-muted flex items-center justify-between">
            <span>Verified Schemes</span>
            <Layers className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {summary.total_schemes}
          </div>
          <div className="text-xs text-muted">
            {summary.pan_india_schemes} Pan-India • {summary.state_schemes} State Missions
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="text-xs font-semibold text-muted flex items-center justify-between">
            <span>Avg Max Funding Cap</span>
            <Coins className="w-4 h-4 text-ok" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ok font-headline">
            {summary.avg_max_funding_display}
          </div>
          <div className="text-xs text-muted">
            Average ceiling per targeted grant
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="text-xs font-semibold text-muted flex items-center justify-between">
            <span>Ministries & Agencies</span>
            <Building2 className="w-4 h-4 text-unlock" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {summary.unique_ministries}
          </div>
          <div className="text-xs text-muted">
            Central depts & state innovation cells
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="text-xs font-semibold text-muted flex items-center justify-between">
            <span>States & UTs Covered</span>
            <MapPin className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            28+
          </div>
          <div className="text-xs text-muted">
            Active state innovation policies
          </div>
        </Card>
      </div>

      {/* ── Two-Column Charts: Top Ministries & Sector Distribution ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ministries by Scheme Count */}
        <Card className="p-5 bg-surface border-border space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              Leading Government Nodal Authorities
            </h3>
            <p className="text-xs text-muted">Ministries and departments with highest scheme density.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(top_ministries || []).slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke={chartColors.muted} fontSize={11} />
                <YAxis dataKey="ministry" type="category" width={110} stroke={chartColors.muted} fontSize={10} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(val: unknown) => [`${val} Schemes`, "Total Schemes"]}
                />
                <Bar dataKey="scheme_count" fill={chartColors.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sector Distribution */}
        <Card className="p-5 bg-surface border-border space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-ok" />
              Scheme Volume by Technology Sector
            </h3>
            <p className="text-xs text-muted">Distribution of programs targeting specific verticals.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(sector_distribution || []).slice(0, 7)}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <XAxis 
                  dataKey="sector" 
                  stroke={chartColors.muted} 
                  fontSize={10} 
                  angle={-20} 
                  textAnchor="end" 
                  interval={0} 
                />
                <YAxis stroke={chartColors.muted} fontSize={11} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(val: unknown) => [`${val} Schemes`, "Total Schemes"]}
                />
                <Bar dataKey="scheme_count" fill={chartColors.ok} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Sector x Stage Opportunity Gap Matrix ─────────────────────── */}
      <Card className="p-5 bg-surface border-border space-y-4">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Grid className="w-4 h-4 text-unlock" />
            Funding Density & Opportunity Gap Matrix (Sector vs. Stage)
          </h3>
          <p className="text-xs text-muted">
            Heatmap highlighting policy saturation versus capital white-spaces across maturity stages.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text">
            <thead className="bg-surface-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2.5 px-3">Industry Vertical</th>
                <th className="py-2.5 px-3 text-center">Idea / Concept</th>
                <th className="py-2.5 px-3 text-center">Prototype / MVP</th>
                <th className="py-2.5 px-3 text-center">Early Revenue</th>
                <th className="py-2.5 px-3 text-center">Growth / Scale-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {(gap_heatmap || []).map((row, rIdx) => {
                const getHeatBg = (val: number) => {
                  if (val >= 25) return "bg-accent/20 text-accent font-bold border border-accent/30";
                  if (val >= 12) return "bg-accent/10 text-accent font-semibold";
                  if (val >= 5) return "bg-surface-2 text-text";
                  return "bg-surface text-muted";
                };

                return (
                  <tr key={rIdx} className="hover:bg-surface-2/60">
                    <td className="py-2.5 px-3 font-semibold text-text">
                      {row.sector}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getHeatBg(Number(row["Idea"]) || 0)}`}>
                        {Number(row["Idea"]) || 0} schemes
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getHeatBg(Number(row["Prototype/MVP"]) || 0)}`}>
                        {Number(row["Prototype/MVP"]) || 0} schemes
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getHeatBg(Number(row["Early Revenue"]) || 0)}`}>
                        {Number(row["Early Revenue"]) || 0} schemes
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getHeatBg(Number(row["Growth/Scale-up"]) || 0)}`}>
                        {Number(row["Growth/Scale-up"]) || 0} schemes
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Regional Innovation Corridors ─────────────────────────────── */}
      <Card className="p-5 bg-surface border-border space-y-4">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Compass className="w-4 h-4 text-warn" />
            Regional Innovation Corridors & Nationwide Policy Access
          </h3>
          <p className="text-xs text-muted">
            Authoritative geographic distribution grouping central frameworks and regional startup missions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(regional_corridors || []).map((corr, idx) => (
            <Card 
              key={idx}
              className="p-4 bg-surface-2 border-border flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">
                    {corr.region}
                  </span>
                  <Chip variant="warn" size="sm">
                    {corr.badge}
                  </Chip>
                </div>
                <p className="text-xs text-muted mt-1">
                  {corr.coverage}
                </p>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Cluster Capacity:</span>
                <span className="font-bold text-ok font-mono">
                  {corr.count}+ Frameworks
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
