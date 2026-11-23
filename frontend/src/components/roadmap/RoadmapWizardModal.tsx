"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";
import { IntakeAnswers } from "@/types";
import { KNOWN_DOCUMENTS } from "@/lib/roadmapEngine";
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

const GOALS = [
  { id: "Idea Validation / Prototype", label: "Idea Validation / Prototype Grant", desc: "Need ₹10L - ₹20L non-dilutive grant for hardware/software MVP build." },
  { id: "R&D Grant / Product MVP", label: "R&D & High-Tech POC Seed", desc: "Need ₹25L - ₹50L technical validation grant (e.g. BIRAC, TIDE, MeitY)." },
  { id: "Market Entry & Commercial Seed", label: "Market Entry & Commercial Seed Fund", desc: "Need ₹20L - ₹1 Cr equity/convertible seed for market launch (e.g. SISFS)." },
  { id: "Scale-up Debt / Credit Guarantee", label: "Scale-up Debt / Credit Guarantee", desc: "Need collateral-free bank working capital up to ₹10 Cr (e.g. CGSS, CGTMSE)." },
  { id: "Tax Exemption & Patent Relief", label: "Tax Exemption & 80% Patent Rebate", desc: "Need 3-year income tax holiday (80-IAC) and patent fee subsidies." }
];

const TURNOVER_BANDS = [
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

  if (!isOpen) return null;

  const toggleDocument = (docKey: string) => {
    const set = new Set(answers.documentsHeld || []);
    if (set.has(docKey)) set.delete(docKey);
    else set.add(docKey);
    setAnswers({ ...answers, documentsHeld: Array.from(set) });
  };

  const handleFinish = () => {
    onComplete(answers);
    onClose();
  };

  const getStepTitle = () => {
    if (step === 1) return "Venture Identification & Domain";
    if (step === 2) return "Development Stage & Revenue Band";
    if (step === 3) return "Primary Capital & Support Goal";
    return "Legal Status & Documents Held";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getStepTitle()}
      subtitle={`Roadmap Intake Wizard • Step ${step} of 4`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Step Progress Line */}
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-accent h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="max-h-[55vh] overflow-y-auto space-y-5 pr-1">
          {/* STEP 1: Startup Name, Sector, State */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Venture / Project Name:
                </label>
                <input
                  type="text"
                  value={answers.startupName}
                  onChange={(e) => setAnswers({ ...answers, startupName: e.target.value })}
                  placeholder="e.g. AgriSense Innovations"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface-2 border border-border text-text placeholder-muted text-xs sm:text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-2">
                  Primary Innovation Domain / Sector:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTORS.map((sec) => {
                    const isSelected = answers.sector === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, sector: sec.id })}
                        className={`min-h-[44px] p-2.5 rounded-lg text-left text-xs font-medium border transition-colors flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-accent/15 border-accent text-accent font-semibold"
                            : "bg-surface-2 border-border text-muted hover:text-text hover:border-border/80"
                        }`}
                      >
                        <span className="text-base">{sec.icon}</span>
                        <span className="truncate">{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Registered State / Operating Location:
                </label>
                <select
                  value={answers.state}
                  onChange={(e) => setAnswers({ ...answers, state: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface-2 border border-border text-text text-xs sm:text-sm focus:outline-none focus:border-accent"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Stage & Turnover */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-2">
                  Current Maturity / Startup Stage:
                </label>
                <div className="space-y-2">
                  {STAGES.map((stg) => {
                    const isSelected = answers.stage === stg.id;
                    return (
                      <Card
                        key={stg.id}
                        onClick={() => setAnswers({ ...answers, stage: stg.id })}
                        className={`p-3.5 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-accent/10 border-accent"
                            : "bg-surface-2 border-border hover:border-border/80"
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-accent bg-accent" : "border-muted"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-accent-contrast" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text">{stg.label}</div>
                          <div className="text-xs text-muted mt-0.5">{stg.desc}</div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Annual Turnover / Revenue Band:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TURNOVER_BANDS.map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setAnswers({ ...answers, turnoverBand: band as any })}
                      className={`min-h-[44px] p-3 rounded-lg text-xs font-semibold border text-center transition-colors cursor-pointer ${
                        answers.turnoverBand === band
                          ? "bg-accent/15 border-accent text-accent"
                          : "bg-surface-2 border-border text-muted hover:text-text"
                      }`}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-surface-2 border border-border">
                  <input
                    type="checkbox"
                    checked={answers.womenLed || false}
                    onChange={(e) => setAnswers({ ...answers, womenLed: e.target.checked })}
                    className="w-4 h-4 rounded text-accent bg-surface border-border focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-text">Women-Led Enterprise</span>
                    <p className="text-xs text-muted">Unlocks dedicated 10% reserve quotas (Stand-Up India, BIRAC, TIDE 2.0).</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Primary Goal */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text mb-1">
                Select your primary capital & ecosystem priority:
              </label>
              {GOALS.map((g) => {
                const isSelected = answers.primaryGoal === g.id;
                return (
                  <Card
                    key={g.id}
                    onClick={() => setAnswers({ ...answers, primaryGoal: g.id as any })}
                    className={`p-3.5 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-accent/10 border-accent"
                        : "bg-surface-2 border-border hover:border-border/80"
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-accent bg-accent" : "border-muted"}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-accent-contrast" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text">{g.label}</div>
                      <div className="text-xs text-muted mt-0.5">{g.desc}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* STEP 4: Documents Held */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Which documents or registrations do you currently hold?
                </label>
                <p className="text-xs text-muted mb-3">
                  The roadmap automatically marks eligible schemes and inserts registration steps for missing prerequisites.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(KNOWN_DOCUMENTS).map(([key, label]) => {
                    const isChecked = (answers.documentsHeld || []).includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleDocument(key)}
                        className={`min-h-[44px] p-3 rounded-lg border text-left text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                          isChecked
                            ? "bg-ok/10 border-ok text-ok font-semibold"
                            : "bg-surface-2 border-border text-muted hover:text-text hover:border-border/80"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-ok border-ok text-surface" : "border-muted"}`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Card className="p-3.5 bg-surface-2 border-border text-xs text-muted space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-text">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Explainable & Rule-Based Match</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Your customized roadmap will map eligible central and state schemes into a 3-phase temporal execution plan (Now, Next, Later) with links and document checklists.
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinish}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              <span>Generate My Roadmap</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
