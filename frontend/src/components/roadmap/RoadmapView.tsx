"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Calendar, 
  ExternalLink, 
  FileText, 
  SlidersHorizontal,
  Printer,
  ChevronDown,
  ChevronUp,
  Building2,
  CheckSquare,
  Square,
  AlertCircle
} from "lucide-react";
import { PersonalizedRoadmap, RoadmapStep, RoadmapStepStatus } from "@/types";
import { RoadmapChartsSection } from "./RoadmapChartsSection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

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
    <div className="space-y-8 animate-fadeIn text-text print:m-0 print:p-0">
      {/* ── 1. Top Roadmap Header & Action Bar ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Chip variant="info" size="sm">
              Personalized Actionable Roadmap
            </Chip>
            <span className="text-xs text-muted">• Dynamic 3-Phase Execution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight font-headline">
            Capital & Growth Pathway for {profileSummary.startupName || "Your Startup"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted max-w-2xl">
            A tailored milestone sequence moving from early compliance and rapid prototype grants to scale-up debt guarantees and tax holidays.
          </p>

          {/* Profile Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border font-medium text-text">
              🌾 {profileSummary.sector}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border font-medium text-text">
              📍 {profileSummary.state}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border font-medium text-text">
              🚀 {profileSummary.stage}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border font-medium text-text">
              🎯 {profileSummary.primaryGoal}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="shrink-0 flex items-center gap-2.5 print:hidden">
          <Button
            variant="secondary"
            onClick={onOpenWizard}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-accent" />
            Re-customize Inputs
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* ── 2. Progress Tracker Bar & KPI Banner ───────────────────────── */}
      <Card className="p-5 sm:p-6 bg-surface border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              Roadmap Progress Tracking
            </div>
            <div className="text-xl sm:text-2xl font-bold text-text mt-0.5">
              {stats.completedSteps} of {stats.totalSteps} Milestones Completed ({stats.progressPercentage}%)
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-semibold text-muted">
              Indicative Non-Dilutive Capital
            </div>
            <div className="text-sm sm:text-base font-bold text-ok font-headline mt-0.5">
              {stats.totalCapitalDisplay}
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-surface-2 h-3 rounded-full overflow-hidden flex border border-border">
          <div 
            className="bg-ok transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-1">
          <div className="p-2 rounded-lg bg-accent/10 text-accent border border-accent/20">
            Phase 1: NOW ({nowSteps.length} Steps)
          </div>
          <div className="p-2 rounded-lg bg-unlock/10 text-unlock border border-unlock/20">
            Phase 2: NEXT ({nextSteps.length} Steps)
          </div>
          <div className="p-2 rounded-lg bg-warn/10 text-warn border border-warn/20">
            Phase 3: LATER ({laterSteps.length} Steps)
          </div>
        </div>
      </Card>

      {/* ── 3. Highlighted "Next Best Action" Card (No gradient, no blur) ─────────────────────── */}
      {nextBestAction && (
        <Card className="p-5 sm:p-6 bg-surface-2 border-2 border-accent text-text space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Chip variant="info" size="sm">
                  ⚡ Next Best Action
                </Chip>
                <span className="text-xs text-muted">
                  {nextBestAction.phase.toUpperCase()} (Target: {nextBestAction.estimatedTime})
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-text">
                {nextBestAction.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                {nextBestAction.whyItMatters}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <a
                href={nextBestAction.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] px-4 py-2 rounded-lg bg-accent text-accent-contrast font-semibold text-xs inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Button
                variant="secondary"
                onClick={() => onUpdateStepStatus(nextBestAction.id, "done")}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-ok" />
                <span>Mark Done</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── 4. The 3 Temporal Phases ──────────────────────────────────── */}
      <div className="space-y-8">
        {/* PHASE 1: NOW */}
        <PhaseSection
          title="Phase 1: NOW (0 – 2 Weeks)"
          subtitle="Foundational Enablers, Essential Accreditations & Rapid Prototype Micro-Grants"
          badgeVariant="info"
          steps={nowSteps}
          expandedSteps={expandedSteps}
          checkedDocs={checkedDocs}
          onToggleExpand={toggleExpand}
          onToggleDoc={toggleDoc}
          onUpdateStepStatus={onUpdateStepStatus}
          onSelectSchemeDetail={onSelectSchemeDetail}
        />

        {/* PHASE 2: NEXT */}
        <PhaseSection
          title="Phase 2: NEXT (1 – 3 Months)"
          subtitle="Proof-of-Concept, Prototype Validation Grants & Seed Incubator Funds"
          badgeVariant="unlock"
          steps={nextSteps}
          expandedSteps={expandedSteps}
          checkedDocs={checkedDocs}
          onToggleExpand={toggleExpand}
          onToggleDoc={toggleDoc}
          onUpdateStepStatus={onUpdateStepStatus}
          onSelectSchemeDetail={onSelectSchemeDetail}
        />

        {/* PHASE 3: LATER */}
        <PhaseSection
          title="Phase 3: LATER (3 – 12 Months)"
          subtitle="Commercial Scale-up, Collateral-Free Credit Guarantees & 3-Year Tax Holidays"
          badgeVariant="warn"
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
  badgeVariant: "info" | "unlock" | "warn";
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
  badgeVariant,
  steps,
  expandedSteps,
  checkedDocs,
  onToggleExpand,
  onToggleDoc,
  onUpdateStepStatus
}: PhaseSectionProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Chip variant={badgeVariant} size="sm">
          {badgeVariant === "info" ? "NOW" : badgeVariant === "unlock" ? "NEXT" : "LATER"}
        </Chip>
        <div>
          <h2 className="text-lg font-bold text-text font-headline">
            {title}
          </h2>
          <p className="text-xs text-muted">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const isExpanded = !!expandedSteps[step.id];
          const isDone = step.status === "done";
          const isInProgress = step.status === "in_progress";

          return (
            <Card
              key={step.id}
              className={`border transition-all ${
                isDone
                  ? "bg-ok/5 border-ok/30"
                  : isInProgress
                  ? "bg-accent/5 border-accent shadow-sm"
                  : "bg-surface border-border hover:border-border/80"
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
                    className={`mt-0.5 min-h-[32px] min-w-[32px] rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      isDone
                        ? "bg-ok border-ok text-surface"
                        : isInProgress
                        ? "border-accent text-accent bg-accent/10"
                        : "border-border text-transparent hover:border-muted"
                    }`}
                    title="Toggle step completion"
                    aria-label={`Mark step ${step.title} status`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : isInProgress ? <CircleDot className="w-3.5 h-3.5" /> : null}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isDone ? "line-through text-muted" : "text-text"}`}>
                        {step.title}
                      </h3>
                      <Chip variant="neutral" size="sm">
                        {step.fundingDisplay}
                      </Chip>
                      <Chip variant="info" size="sm">
                        {step.matchScore}% Match
                      </Chip>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {step.whyItMatters}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-muted" />
                        <span className="truncate max-w-[200px]">{step.ministry}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted" />
                        <span>{step.estimatedTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
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
                    className="min-h-[44px] px-3.5 py-2 rounded-lg bg-accent text-accent-contrast text-xs font-semibold inline-flex items-center gap-1 hover:opacity-90 transition-opacity"
                  >
                    <span>Apply / Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onToggleExpand(step.id)}
                    aria-label={isExpanded ? "Collapse step details" : "Expand step details"}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                    title={isExpanded ? "Collapse" : "Expand checklist & requirements"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Document Checklist & Prerequisites */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-border bg-surface-2 space-y-3.5 rounded-b-xl animate-fadeIn">
                  {/* Dependencies Banner */}
                  {step.dependencies && step.dependencies.length > 0 && (
                    <div className="p-3 rounded-lg bg-warn/10 border border-warn/20 text-xs text-warn flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                      <div>
                        <strong>Prerequisite Dependencies:</strong>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-xs">
                          {step.dependencies.map((dep, idx) => (
                            <li key={idx}>{dep}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Included Incubation Centres Breakdown */}
                  {step.subSchemes && step.subSchemes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-accent" />
                        Included Incubation Centres & Programmes ({step.subSchemes.length}):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.subSchemes.map((sub, sIdx) => (
                          <div key={sIdx} className="p-2.5 rounded-lg bg-surface border border-border flex flex-col justify-between space-y-1.5">
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-text line-clamp-1">{sub.name}</span>
                                <span className="font-mono text-ok font-semibold">{sub.funding}</span>
                              </div>
                              <div className="text-[11px] text-muted line-clamp-1">{sub.ministry}</div>
                              {sub.summary && (
                                <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed">{sub.summary}</p>
                              )}
                            </div>
                            {sub.portal && (
                              <a 
                                href={sub.portal}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-accent hover:underline font-semibold inline-flex items-center gap-1 self-start"
                              >
                                <span>Direct Portal</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-text mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent" />
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
                            className={`min-h-[44px] p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                              isDocChecked
                                ? "bg-ok/10 border-ok text-ok line-through font-medium"
                                : "bg-surface border-border text-muted hover:border-border/80"
                            }`}
                          >
                            {isDocChecked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-ok shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-muted shrink-0" />
                            )}
                            <span className="text-xs font-medium leading-tight">{doc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Portal Instructions & Verification */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border text-xs text-muted">
                    <span>Application Channel: <strong className="text-text">{step.portalName}</strong></span>
                    <a
                      href={step.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent font-semibold hover:underline flex items-center gap-1"
                    >
                      Visit Official Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
