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
import { BarChart3, PieChart as PieIcon, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { PersonalizedRoadmap } from "@/types";

interface Props {
  roadmap: PersonalizedRoadmap;
}

const PHASE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];
const STATUS_COLORS = ["#10b981", "#3b82f6", "#64748b"];

export function RoadmapChartsSection({ roadmap }: Props) {
  const { steps, stats, profileSummary } = roadmap;

  // Chart 1: Match Score per Scheme
  const matchScoreData = steps.slice(0, 6).map(s => ({
    name: s.schemeName.length > 20 ? s.schemeName.slice(0, 18) + "..." : s.schemeName,
    fullName: s.schemeName,
    score: s.matchScore,
    funding: s.fundingDisplay,
    phase: s.phase.toUpperCase()
  }));

  // Chart 2: Funding Type Comparison
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

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
      
      {/* Section Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Roadmap Analytics & Fit Synthesis
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-headline">
          Capital Flow & Eligibility Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visual analysis of your matched schemes, funding instruments, and temporal milestone distribution.
        </p>
      </div>

      {/* Grid of 2x2 Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Match Score per Scheme */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                Match Fit Score by Program
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Max: 100%</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Algorithms rank schemes based on sector eligibility, stage fit, and goal alignment.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchScoreData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="name" type="category" width={110} stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "11px", color: "#fff" }}
                    formatter={(val: any, name: any, item: any) => [`${val}% Match Score (${item.payload.funding})`, item.payload.fullName]}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Insight: Top matched program achieves {matchScoreData[0]?.score || 99}% compatibility for {profileSummary.sector}.</span>
          </div>
        </div>

        {/* Chart 2: Milestone Phase Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                Roadmap Milestones across Temporal Phases
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">{stats.totalSteps} Milestones</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Structured sequence preventing premature debt or tax filing before foundation is laid.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "11px", color: "#fff" }}
                    formatter={(val: any, name: any, item: any) => [`${val} Actionable Steps (${item.payload.timeline})`, item.payload.name]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                    {phaseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PHASE_COLORS[index % PHASE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Insight: Complete Phase 1 ({stats.nowCount} steps) within 14 days to unlock Phase 2 seed grants.</span>
          </div>
        </div>

        {/* Chart 3: Funding Instrument Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-emerald-500" />
                Capital Instrument Composition
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold">{stats.totalCapitalDisplay}</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Distribution between non-dilutive grants, loan guarantees, and regulatory accreditations.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingTypeData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <XAxis dataKey="type" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "11px", color: "#fff" }}
                    formatter={(val: any, name: any, item: any) => [`${val} Programs (₹${item.payload.amountLakhs}L Max)`, item.payload.type]}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Insight: Non-dilutive grants prioritized first to protect founder equity before commercial debt.</span>
          </div>
        </div>

        {/* Chart 4: Roadmap Execution Progress Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                Execution Progress Status Donut
              </h4>
              <span className="text-[10px] text-amber-500 font-bold">{stats.progressPercentage}% Complete</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Real-time tracking of milestones achieved, ongoing applications, and remaining tasks.
            </p>

            <div className="h-56 w-full flex items-center justify-center">
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
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "11px", color: "#fff" }}
                    formatter={(val: any, name: any) => [`${val} Milestones`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done: {doneCount}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress: {inProgressCount}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Not Started: {notStartedCount}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
