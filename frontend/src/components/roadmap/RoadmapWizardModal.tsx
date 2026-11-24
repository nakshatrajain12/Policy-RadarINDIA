"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Calendar,
  FileCheck2,
  FileText
} from "lucide-react";
import { IntakeAnswers } from "@/types";
const DOC_OPTIONS = [
  { key: "aadhaar_pan", label: "Founder Aadhaar & PAN Card", description: "Identity & KYC verification" },
  { key: "incorporation", label: "MCA Certificate of Incorporation", description: "Pvt Ltd / LLP / Partnership deed" },
  { key: "dpiit_cert", label: "DPIIT Recognition Certificate", description: "Unlocks 80-IAC, SISFS & Section 56" },
  { key: "udyam_msme", label: "Udyam MSME Certificate", description: "Subsidized credit & patent rebates" },
  { key: "gstin", label: "GSTIN Certificate", description: "Active GST registration" },
  { key: "pitch_deck", label: "5-10 Slide Pitch Deck", description: "Executive summary & business model" },
  { key: "patent_ipr", label: "Patent Application / IPR Proof", description: "Provisional or published patent filing" }
];
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SECTORS = [
  { id: "AgriTech", label: "AgriTech & Rural", icon: "🌾" },
  { id: "DeepTech & Hardware", label: "DeepTech, AI & Robotics", icon: "🤖" },
  { id: "CleanTech & EV", label: "CleanTech, Solar & EV", icon: "⚡" },
  { id: "HealthTech & Bio", label: "HealthTech & BioTech", icon: "🧬" },
  { id: "FinTech", label: "FinTech & InsurTech", icon: "💳" },
  { id: "Defence & SpaceTech", label: "Defence & Aerospace", icon: "🛡️" },
  { id: "SaaS & Enterprise", label: "SaaS & Digital Tech", icon: "💻" },
  { id: "EdTech & Skills", label: "EdTech & Skilling", icon: "🎓" },
  { id: "Consumer & D2C", label: "Consumer & D2C", icon: "📦" },
  { id: "All Sectors", label: "Cross-Sector / Other", icon: "🚀" }
];

const STAGES = [
  { id: "Idea", label: "Idea / Student", desc: "Conceptualizing or lab validation. Pre-incorporation." },
  { id: "Prototype/MVP", label: "Prototype / MVP", desc: "Working prototype built, pilot testing in progress." },
  { id: "Early Revenue", label: "Early Revenue", desc: "First paying customers acquired. Scaling initial sales." },
  { id: "Growth/Scale-up", label: "Growth / Commercial Scale", desc: "Product-market fit proven. Scaling pan-India / global." }
];

const STATES = [
  "Pan-India", "Karnataka", "Maharashtra", "Telangana", "Tamil Nadu", "Gujarat", 
  "Delhi", "Uttar Pradesh", "Kerala", "Rajasthan", "Odisha", "Haryana", 
  "Punjab", "Andhra Pradesh", "Madhya Pradesh", "West Bengal", "Bihar"
];

const GOALS: Array<{ id: IntakeAnswers["primaryGoal"]; label: string; desc: string }> = [
  { id: "Idea Validation / Prototype", label: "Idea Validation / Prototype Grant", desc: "Need ₹10L - ₹20L non-dilutive grant for hardware/software MVP build." },
  { id: "R&D Grant / Product MVP", label: "R&D & High-Tech POC Seed", desc: "Need ₹25L - ₹50L technical validation grant (e.g. BIRAC, TIDE, MeitY)." },
  { id: "Market Entry & Commercial Seed", label: "Market Entry & Commercial Seed Fund", desc: "Need ₹20L - ₹1 Cr equity/convertible seed for market launch (e.g. SISFS)." },
  { id: "Scale-up Debt / Credit Guarantee", label: "Scale-up Debt / Credit Guarantee", desc: "Need collateral-free bank working capital up to ₹10 Cr (e.g. CGSS, CGTMSE)." },
  { id: "Tax Exemption & Patent Relief", label: "Tax Exemption & 80% Patent Rebate", desc: "Need 3-year income tax holiday (80-IAC) and patent fee subsidies." }
];

const TURNOVER_BANDS: Array<IntakeAnswers["turnoverBand"]> = [
  "< ₹10 Lakhs (Pre-revenue)",
  "₹10 Lakhs - ₹1 Crore",
  "₹1 Crore - ₹5 Crore",
  "> ₹5 Crore"
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialAnswers?: IntakeAnswers;
  onComplete: (answers: IntakeAnswers) => void;
}

export function RoadmapWizardModal({ isOpen, onClose, initialAnswers, onComplete }: Props) {
  const [step, setStep] = useState<number>(1);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisProgress, setSynthesisProgress] = useState<number>(0);
  const [synthesisStageText, setSynthesisStageText] = useState<string>("Initializing intelligence engine...");

  const [answers, setAnswers] = useState<IntakeAnswers>(initialAnswers || {
    startupName: "",
    sector: "AgriTech",
    stage: "Idea",
    state: "Karnataka",
    primaryGoal: "Idea Validation / Prototype",
    turnoverBand: "< ₹10 Lakhs (Pre-revenue)",
    documentsHeld: ["aadhaar_pan", "pitch_deck"],
    womenLed: false
  });

  // 12-14 Second AI Synthesis Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSynthesizing) {
      setSynthesisProgress(5);
      setSynthesisStageText("Scanning 193 Central and State gazette databases...");

      const startTime = Date.now();
      const totalDuration = 12500; // ~12.5 seconds

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
        setSynthesisProgress(progressPct);

        if (elapsed > 2500 && elapsed <= 5500) {
          setSynthesisStageText("Evaluating legal entity prerequisites & funding limits...");
        } else if (elapsed > 5500 && elapsed <= 8500) {
          setSynthesisStageText("Sequencing 3-phase temporal execution milestones (Now, Next, Later)...");
        } else if (elapsed > 8500 && elapsed <= 11500) {
          setSynthesisStageText("Calibrating capital stack and required documentation checklist...");
        } else if (elapsed > 11500) {
          setSynthesisStageText("Personalized Roadmap Ready! Finalizing your execution plan...");
        }

        if (elapsed >= totalDuration) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSynthesizing(false);
            onComplete(answers);
            onClose();
          }, 600);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSynthesizing, answers, onComplete, onClose]);

  if (!isOpen) return null;

  const toggleDocument = (docKey: string) => {
    const set = new Set(answers.documentsHeld || []);
    if (set.has(docKey)) set.delete(docKey);
    else set.add(docKey);
    setAnswers({ ...answers, documentsHeld: Array.from(set) });
  };

  const handleStartSynthesis = () => {
    setIsSynthesizing(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSynthesizing) onClose();
      }}
      title={
        isSynthesizing 
          ? "Synthesizing Personalized Roadmap" 
          : step === 1 
          ? "Step 1: Foundational Venture Profile" 
          : "Step 2: Deep-Dive Strategic Inputs"
      }
      subtitle={
        isSynthesizing
          ? "Rule-based AI engine calibrating 193 government funding programs"
          : step === 1 
          ? "Basic identity, sector, maturity stage, and state jurisdiction" 
          : "Financial targets, held accreditations, and entity status"
      }
      maxWidth="lg"
    >
      {/* ── A. 12-14 Second Intelligence Engine Synthesizing Screen ──────── */}
      {isSynthesizing ? (
        <div className="py-8 px-4 text-center space-y-6 animate-fadeIn">
          {/* Animated AI Pulse Visual */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-accent/40 animate-spin" />
            <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-lg">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-text">
              Synthesizing Custom Execution Roadmap
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Evaluating your venture profile against 193 central & state schemes, filtering non-dilutive grants, and compiling document checklists.
            </p>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text">
              <span className="flex items-center gap-1.5 text-accent">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{synthesisStageText}</span>
              </span>
              <span>{synthesisProgress}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-surface-raised border border-border overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-accent to-ok transition-all duration-150"
                style={{ width: `${synthesisProgress}%` }}
              />
            </div>
          </div>

          {/* Live Checkmarks List */}
          <div className="max-w-md mx-auto text-left rounded-xl bg-surface-raised border border-border p-4 space-y-2.5 text-xs">
            <div className={`flex items-center gap-2 ${synthesisProgress >= 20 ? "text-ok" : "text-text-muted opacity-50"}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Scanning 193 central & state scheme gazettes</span>
            </div>
            <div className={`flex items-center gap-2 ${synthesisProgress >= 45 ? "text-ok" : "text-text-muted opacity-50"}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Verifying legal entity and stage eligibility</span>
            </div>
            <div className={`flex items-center gap-2 ${synthesisProgress >= 70 ? "text-ok" : "text-text-muted opacity-50"}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Sequencing 3-Phase temporal roadmap (Now, Next, Later)</span>
            </div>
            <div className={`flex items-center gap-2 ${synthesisProgress >= 95 ? "text-ok" : "text-text-muted opacity-50"}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Generating document readiness checklist & portal links</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── B. 2-Step Form View ────────────────────────────────────────── */
        <div className="space-y-6 pt-2">
          
          {/* Step Progress Pill */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                step === 1 ? "bg-accent text-white" : "bg-surface-raised text-text-muted"
              }`}>
                1. Foundational
              </span>
              <span className="text-text-muted text-xs">→</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                step === 2 ? "bg-accent text-white" : "bg-surface-raised text-text-muted"
              }`}>
                2. Deep-Dive & Documents
              </span>
            </div>
            <span className="text-xs text-text-muted">Takes ~90 seconds</span>
          </div>

          {/* ── STEP 1: Foundational Inputs ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  Venture Name
                </label>
                <input
                  type="text"
                  value={answers.startupName}
                  onChange={(e) => setAnswers({ ...answers, startupName: e.target.value })}
                  placeholder="e.g. KisanAI, NeuroSense, GreenGrid"
                  className="w-full bg-surface-raised text-text border border-border rounded-lg text-xs py-2 px-3 focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Sector & Technology Domain
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTORS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, sector: s.id })}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 text-xs transition-colors ${
                        answers.sector === s.id
                          ? "border-accent bg-accent-soft text-accent font-bold"
                          : "border-border bg-surface-raised text-text hover:border-border-strong"
                      }`}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Current Maturity Stage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STAGES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, stage: st.id })}
                      className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                        answers.stage === st.id
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-surface-raised hover:border-border-strong"
                      }`}
                    >
                      <div className="font-bold text-text mb-0.5">{st.label}</div>
                      <div className="text-[11px] text-text-muted leading-relaxed">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  State / Jurisdiction
                </label>
                <select
                  value={answers.state}
                  onChange={(e) => setAnswers({ ...answers, state: e.target.value })}
                  className="w-full bg-surface-raised text-text border border-border rounded-lg text-xs py-2 px-3 focus:border-accent focus:outline-none"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 2: Strategic Inputs & Held Documents ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Primary Capital & Support Goal
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, primaryGoal: g.id })}
                      className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                        answers.primaryGoal === g.id
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-surface-raised hover:border-border-strong"
                      }`}
                    >
                      <div className="font-bold text-text mb-0.5">{g.label}</div>
                      <div className="text-[11px] text-text-muted">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Annual Turnover / Revenue Band
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TURNOVER_BANDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setAnswers({ ...answers, turnoverBand: b })}
                      className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-colors ${
                        answers.turnoverBand === b
                          ? "border-accent bg-accent-soft text-accent font-bold"
                          : "border-border bg-surface-raised text-text hover:border-border-strong"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Documents & Accreditations Currently Held
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DOC_OPTIONS.map((doc) => {
                    const isHeld = (answers.documentsHeld || []).includes(doc.key);
                    return (
                      <button
                        key={doc.key}
                        type="button"
                        onClick={() => toggleDocument(doc.key)}
                        className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 text-xs transition-colors ${
                          isHeld
                            ? "border-ok bg-ok-soft text-ok font-semibold"
                            : "border-border bg-surface-raised text-text hover:border-border-strong"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isHeld ? "bg-ok border-ok text-white" : "border-border bg-surface"
                        }`}>
                          {isHeld && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="block text-text font-bold">{doc.label}</span>
                          <span className="text-[11px] text-text-muted font-normal block">{doc.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Woman-led venture toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text font-semibold">
                  <input
                    type="checkbox"
                    checked={!!answers.womenLed}
                    onChange={(e) => setAnswers({ ...answers, womenLed: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span>Woman-Led Venture (≥ 51% female equity holding for special quotas)</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {step === 1 ? (
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-xs text-text-muted"
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Previous Step
              </Button>
            )}

            {step === 1 ? (
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                className="text-xs font-semibold"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleStartSynthesis}
                className="text-xs font-bold py-2.5 px-4 shadow-md bg-gradient-to-r from-accent to-ok hover:opacity-95"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Generate My Action Roadmap</span>
              </Button>
            )}
          </div>

        </div>
      )}
    </Modal>
  );
}
