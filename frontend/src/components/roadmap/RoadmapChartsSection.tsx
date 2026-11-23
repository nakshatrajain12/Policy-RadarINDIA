"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { BarChart3, TrendingUp, CheckCircle2, PieChart as PieIcon, CircleDot } from "lucide-react";
import { PersonalizedRoadmap } from "@/types";
import { useTheme } from "@/context/ThemeProvider";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

interface Props {
  roadmap: PersonalizedRoadmap;
}

export function RoadmapChartsSection({ roadmap }: Props) {
  const { chartColors } = useTheme();
  const { steps, stats, profileSummary } = roadmap;

  const phaseColors = [chartColors.accent, chartColors.unlock, chartColors.warn];
  const statusColors = [chartColors.ok, chartColors.accent, chartColors.muted];

  // Chart 1: Match Score per Scheme (Horizontal Bars with full scheme names in tooltips)
  const matchScoreData = steps.slice(0, 6).map(s => ({
    name: s.schemeName.length > 22 ? s.schemeName.slice(0, 20) + "..." : s.schemeName,
    fullName: s.schemeName,
    score: s.matchScore,
    funding: s.fundingDisplay,
    phase: s.phase.toUpperCase()
  }));

  // Chart 2: Funding Type Comparison in ₹ Crores (Fix units: ₹ amounts, not item counts)
  const fundingTypeMap: Record<string, { count: number; totalAmount: number }> = {};
  for (const s of steps) {
    const type = s.fundingType.includes("Grant") ? "Non-Dilutive Grant"
      : s.fundingType.includes("Accreditation") ? "Regulatory Gateway"
      : s.fundingType.includes("Loan") || s.fundingType.includes("Guarantee") ? "Debt Guarantee"
      : "Subsidy / Equity";
    if (!fundingTypeMap[type]) fundingTypeMap[type] = { count: 0, totalAmount: 0 };
    fundingTypeMap[type].count += 1;
    fundingTypeMap[type].totalAmount += (s.fundingAmount || 0);
  }
  const fundingTypeData = Object.entries(fundingTypeMap).map(([type, val]) => ({
    type,
    count: val.count,
    amountCr: Number((val.totalAmount / 10000000).toFixed(2)),
    amountLakhs: Math.round(val.totalAmount / 100000)
  }));

  // Chart 3: Phase Distribution
  const phaseData = [
    { name: "Phase 1: NOW", count: stats.nowCount, timeline: "0 - 2 Weeks" },
    { name: "Phase 2: NEXT", count: stats.nextCount, timeline: "1 - 3 Months" },
    { name: "Phase 3: LATER", count: stats.laterCount, timeline: "3 - 12 Months" }
  ];

  // Chart 4: Progress Status Donut
  const doneCount = steps.filter(s => s.status === "done").length;
  const inProgressCount = steps.filter(s => s.status === "in_progress").length;
  const notStartedCount = steps.filter(s => s.status === "not_started").length;
  const statusData = [
    { name: "Completed", value: doneCount || 0 },
    { name: "In Progress", value: inProgressCount || 0 },
    { name: "Not Started", value: notStartedCount || 0 }
  ];

  const tooltipStyle = {
    backgroundColor: chartColors.surface,
    borderColor: chartColors.border,
    borderRadius: "8px",
    fontSize: "12px",
    color: chartColors.text
  };

  return (
    <div className="space-y-6 pt-4 border-t border-border">
      {/* Section Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Chip variant="unlock" size="sm">
            Roadmap Analytics & Fit Synthesis
          </Chip>
        </div>
        <h3 className="text-lg font-bold text-text font-headline">
          Capital Flow & Eligibility Breakdown
        </h3>
        <p className="text-xs text-muted">
          Visual analysis of your matched schemes, funding instruments, and temporal milestone distribution.
        </p>
      </div>

      {/* Grid of 2x2 Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Match Score per Scheme (Horizontal Bars) */}
        <Card className="p-4 sm:p-5 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-accent" />
                Match Fit Score by Program
              </h4>
              <span className="text-xs text-muted font-mono">Max: 100%</span>
            </div>
            <p className="text-xs text-muted mb-3">
              Algorithms rank schemes based on sector eligibility, stage fit, and goal alignment.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchScoreData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke={chartColors.muted} fontSize={10} unit="%" />
                  <YAxis dataKey="name" type="category" width={120} stroke={chartColors.muted} fontSize={10} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}% Match Fit (${item.payload.funding})`, 
                      item.payload.fullName
                    ]}
                  />
                  <Bar dataKey="score" fill={chartColors.accent} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border text-xs text-accent flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Top program achieves {matchScoreData[0]?.score || 92}% fit for {profileSummary.sector}.</span>
          </div>
        </Card>

        {/* Chart 2: Milestone Phase Distribution */}
        <Card className="p-4 sm:p-5 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-unlock" />
                Roadmap Milestones across Temporal Phases
              </h4>
              <span className="text-xs text-muted font-mono">{stats.totalSteps} Milestones</span>
            </div>
            <p className="text-xs text-muted mb-3">
              Structured sequence preventing premature debt or tax filing before foundation is laid.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <XAxis dataKey="name" stroke={chartColors.muted} fontSize={10} />
                  <YAxis stroke={chartColors.muted} fontSize={10} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, _name: any, item: any) => [`${val} Actionable Steps (${item.payload.timeline})`, item.payload.name]}
                  />
                  <Bar dataKey="count" fill={chartColors.unlock} radius={[4, 4, 0, 0]}>
                    {phaseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={phaseColors[index % phaseColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border text-xs text-unlock flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Complete Phase 1 ({stats.nowCount} steps) within 14 days to unlock Phase 2 seed grants.</span>
          </div>
        </Card>

        {/* Chart 3: Funding Instrument Breakdown (Horizontal Bars with ₹ Crores Units) */}
        <Card className="p-4 sm:p-5 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-ok" />
                Capital by Funding Instrument
              </h4>
              <span className="text-xs text-ok font-bold">{stats.totalCapitalDisplay}</span>
            </div>
            <p className="text-xs text-muted mb-3">
              Max accessible public capital measured in ₹ Crore across instrument categories.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={fundingTypeData} 
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 15, bottom: 5 }}
                >
                  <XAxis type="number" stroke={chartColors.muted} fontSize={10} unit=" Cr" />
                  <YAxis type="category" dataKey="type" width={115} stroke={chartColors.muted} fontSize={10} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, _name: any, item: any) => [
                      `₹${val} Cr (${item.payload.count} scheme${item.payload.count > 1 ? "s" : ""})`,
                      item.payload.type
                    ]}
                  />
                  <Bar dataKey="amountCr" fill={chartColors.ok} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border text-xs text-ok flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Non-dilutive grants prioritized first to protect founder equity before commercial debt.</span>
          </div>
        </Card>

        {/* Chart 4: Roadmap Execution Progress Donut (with empty state "No steps started yet") */}
        <Card className="p-4 sm:p-5 bg-surface border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-warn" />
                Execution Progress Status Donut
              </h4>
              <span className="text-xs text-warn font-bold">{stats.progressPercentage}% Complete</span>
            </div>
            <p className="text-xs text-muted mb-3">
              Real-time tracking of milestones achieved, ongoing applications, and remaining tasks.
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              {doneCount === 0 && inProgressCount === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-1.5">
                  <CircleDot className="w-8 h-8 text-muted/50 stroke-1" />
                  <p className="text-xs font-bold text-text">No steps started yet</p>
                  <p className="text-[11px] text-muted max-w-[200px]">
                    Click the checkbox on any milestone above to start tracking your execution progress.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any, name: any) => [`${val} Milestones`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.ok }} /> Done: {doneCount}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.accent }} /> In Progress: {inProgressCount}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.muted }} /> Not Started: {notStartedCount}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
