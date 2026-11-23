"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Coins, 
  SlidersHorizontal,
  Printer,
  ChevronDown,
  ChevronUp,
  Building2,
  CheckSquare,
  Square,
  Award
} from "lucide-react";
import { PersonalizedRoadmap, RoadmapStep, RoadmapStepStatus } from "@/types";
import { RoadmapChartsSection } from "./RoadmapChartsSection";

interface Props {
  roadmap: PersonalizedRoadmap;
  onUpdateStepStatus: (stepId: string, status: RoadmapStepStatus) => void;
  onOpenWizard: () => void;
  onSelectSchemeDetail?: (schemeName: string) => void;
}

export function RoadmapView({ roadmap, onUpdateStepStatus, onOpenWizard, onSelectSchemeDetail }: Props) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleExpand = (stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const toggleDoc = (docId: string) => {
    setCheckedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const { stats, nextBestAction, steps, profileSummary } = roadmap;

  const nowSteps = steps.filter(s => s.phase === "now");
  const nextSteps = steps.filter(s => s.phase === "next");
  const laterSteps = steps.filter(s => s.phase === "later");

  return (
    <div className="space-y-8 animate-fadeIn print:m-0 print:p-0">
      
      {/* ── 1. Top Roadmap Header & Action Bar ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Personalized Actionable Roadmap
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• Dynamic 3-Phase Execution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
            Capital & Growth Pathway for {profileSummary.startupName || "Your Startup"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            A tailored milestone sequence moving from early compliance and rapid prototype grants to scale-up debt guarantees and tax holidays.
          </p>

          {/* Profile Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              🌾 {profileSummary.sector}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              📍 {profileSummary.state}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              🚀 {profileSummary.stage}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              🎯 {profileSummary.primaryGoal}
            </span>
          </div>
        </div>

        {/* Action Controls: Re-customize & Print/PDF */}
        <div className="shrink-0 flex items-center gap-2.5 print:hidden">
          <button
            onClick={onOpenWizard}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            Re-customize Inputs
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── 2. Progress Tracker Bar & KPI Banner ───────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Roadmap Progress Tracking
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats.completedSteps} of {stats.totalSteps} Milestones Completed ({stats.progressPercentage}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Non-Dilutive & Guaranteed Capital
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-headline">
              {stats.totalCapitalDisplay}
            </div>
          </div>
        </div>

        {/* Multi-Segment Progress Line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-1">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Phase 1: NOW ({nowSteps.length} Steps)
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Phase 2: NEXT ({nextSteps.length} Steps)
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Phase 3: LATER ({laterSteps.length} Steps)
          </div>
        </div>
      </div>

      {/* ── 3. Highlighted "Next Best Action" Card ─────────────────────── */}
      {nextBestAction && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  ⚡ Your Next Best Action
                </span>
                <span className="text-xs text-blue-100">
                  {nextBestAction.phase.toUpperCase()} (Target: {nextBestAction.estimatedTime})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {nextBestAction.title}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
                {nextBestAction.whyItMatters}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <a
                href={nextBestAction.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-extrabold text-xs hover:bg-blue-50 transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => onUpdateStepStatus(nextBestAction.id, "done")}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. The 3 Temporal Phases ──────────────────────────────────── */}
      <div className="space-y-10">

        {/* PHASE 1: NOW (0 - 2 Weeks) */}
        <PhaseSection
          title="Phase 1: NOW (0 – 2 Weeks)"
          subtitle="Foundational Enablers, Essential Accreditations & Rapid Prototype Micro-Grants"
          badgeColor="blue"
          steps={nowSteps}
          expandedSteps={expandedSteps}
          checkedDocs={checkedDocs}
          onToggleExpand={toggleExpand}
          onToggleDoc={toggleDoc}
          onUpdateStepStatus={onUpdateStepStatus}
          onSelectSchemeDetail={onSelectSchemeDetail}
        />

        {/* PHASE 2: NEXT (1 - 3 Months) */}
        <PhaseSection
          title="Phase 2: NEXT (1 – 3 Months)"
          subtitle="Proof-of-Concept, Prototype Validation Grants & Seed Incubator Funds"
          badgeColor="purple"
          steps={nextSteps}
          expandedSteps={expandedSteps}
          checkedDocs={checkedDocs}
          onToggleExpand={toggleExpand}
          onToggleDoc={toggleDoc}
          onUpdateStepStatus={onUpdateStepStatus}
          onSelectSchemeDetail={onSelectSchemeDetail}
        />

        {/* PHASE 3: LATER (3 - 12 Months) */}
        <PhaseSection
          title="Phase 3: LATER (3 – 12 Months)"
          subtitle="Commercial Scale-up, Collateral-Free Credit Guarantees & 3-Year Tax Holidays"
          badgeColor="amber"
          steps={laterSteps}
          expandedSteps={expandedSteps}
          checkedDocs={checkedDocs}
          onToggleExpand={toggleExpand}
          onToggleDoc={toggleDoc}
          onUpdateStepStatus={onUpdateStepStatus}
          onSelectSchemeDetail={onSelectSchemeDetail}
        />

      </div>

      {/* ── 5. Visual Roadmap Analytics & Charts ───────────────────────── */}
      <RoadmapChartsSection roadmap={roadmap} />

    </div>
  );
}

// ── Sub-Component: Phase Section ─────────────────────────────────────────────
interface PhaseSectionProps {
  title: string;
  subtitle: string;
  badgeColor: "blue" | "purple" | "amber";
  steps: RoadmapStep[];
  expandedSteps: Record<string, boolean>;
  checkedDocs: Record<string, boolean>;
  onToggleExpand: (stepId: string) => void;
  onToggleDoc: (docId: string) => void;
  onUpdateStepStatus: (stepId: string, status: RoadmapStepStatus) => void;
  onSelectSchemeDetail?: (schemeName: string) => void;
}

function PhaseSection({
  title,
  subtitle,
  badgeColor,
  steps,
  expandedSteps,
  checkedDocs,
  onToggleExpand,
  onToggleDoc,
  onUpdateStepStatus,
  onSelectSchemeDetail
}: PhaseSectionProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${badgeColor === "blue" ? "bg-blue-500 ring-4 ring-blue-500/20" : badgeColor === "purple" ? "bg-purple-500 ring-4 ring-purple-500/20" : "bg-amber-500 ring-4 ring-amber-500/20"}`} />
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-headline">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {steps.map((step) => {
          const isExpanded = !!expandedSteps[step.id];
          const isDone = step.status === "done";
          const isInProgress = step.status === "in_progress";

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all ${
                isDone
                  ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30"
                  : isInProgress
                  ? "bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/30 shadow-sm"
                  : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              {/* Card Main Bar */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => {
                      const next = isDone ? "not_started" : isInProgress ? "done" : "in_progress";
                      onUpdateStepStatus(step.id, next);
                    }}
                    className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isInProgress
                        ? "border-blue-500 text-blue-500 bg-blue-500/10"
                        : "border-slate-300 dark:border-slate-700 text-transparent hover:border-slate-400"
                    }`}
                    title="Toggle step completion"
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : isInProgress ? <CircleDot className="w-3.5 h-3.5" /> : null}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDone ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                        {step.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {step.fundingDisplay}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {step.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.whyItMatters}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[200px]">{step.ministry}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{step.estimatedTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Deadline: {step.deadline}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Apply / Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onToggleExpand(step.id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isExpanded ? "Collapse" : "Expand checklist & requirements"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Document Checklist & Prerequisites */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 space-y-3.5 rounded-b-2xl animate-fadeIn">
                  
                  {/* Dependencies Banner */}
                  {step.dependencies && step.dependencies.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Prerequisite Dependencies:</strong>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                          {step.dependencies.map((dep, idx) => (
                            <li key={idx}>{dep}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Documents Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      Required Documents Dossier Checklist:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.documentsRequired.map((doc, idx) => {
                        const docId = `${step.id}-doc-${idx}`;
                        const isDocChecked = !!checkedDocs[docId];
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onToggleDoc(docId)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                              isDocChecked
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 line-through"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {isDocChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="text-[11px] font-medium leading-tight">{doc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Portal Instructions & Verification */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500">
                    <span>Application Channel: <strong>{step.portalName}</strong></span>
                    <a
                      href={step.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      Visit Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
