"use client";

import React, { useState } from "react";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  Building2, 
  Target, 
  FileCheck, 
  TrendingUp,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { IntakeAnswers } from "@/types";
import { KNOWN_DOCUMENTS } from "@/lib/roadmapEngine";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Wizard Header & Progress Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Roadmap Intake Wizard
              </span>
              <span className="text-xs text-slate-500">• Step {step} of 4</span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-headline">
              {step === 1 && "Venture Identification & Domain"}
              {step === 2 && "Development Stage & Revenue Band"}
              {step === 3 && "Primary Capital & Support Goal"}
              {step === 4 && "Legal Status & Documents Held"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-800 h-1.5 shrink-0">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Startup Name, Sector, State */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Venture / Project Name:
                </label>
                <input
                  type="text"
                  value={answers.startupName}
                  onChange={(e) => setAnswers({ ...answers, startupName: e.target.value })}
                  placeholder="e.g. AgriSense Innovations"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
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
                        className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-sm"
                            : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Registered State / Operating Location:
                </label>
                <select
                  value={answers.state}
                  onChange={(e) => setAnswers({ ...answers, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Stage & Turnover */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Current Maturity / Startup Stage:
                </label>
                <div className="space-y-2">
                  {STAGES.map((stg) => {
                    const isSelected = answers.stage === stg.id;
                    return (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, stage: stg.id })}
                        className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white shadow-sm"
                            : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-blue-400 bg-blue-500" : "border-slate-600"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{stg.label}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{stg.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Annual Turnover / Revenue Band:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TURNOVER_BANDS.map((band) => (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setAnswers({ ...answers, turnoverBand: band as any })}
                      className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        answers.turnoverBand === band
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <input
                    type="checkbox"
                    checked={answers.womenLed || false}
                    onChange={(e) => setAnswers({ ...answers, womenLed: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Women-Led Enterprise</span>
                    <p className="text-[10px] text-slate-400">Unlocks dedicated 10% reserve quotas (Stand-Up India, BIRAC, TIDE 2.0).</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Primary Goal */}
          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select your primary capital & ecosystem priority:
              </label>
              {GOALS.map((g) => {
                const isSelected = answers.primaryGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, primaryGoal: g.id as any })}
                    className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 text-white shadow-sm"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-blue-400 bg-blue-500" : "border-slate-600"}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{g.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{g.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 4: Documents Held */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Which documents or registrations do you currently hold?
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
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
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${
                          isChecked
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600"}`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[11px] font-medium leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Explainable & Rule-Based Match</span>
                </div>
                <p className="text-[11px] text-blue-300/80 leading-relaxed">
                  Your customized roadmap will map eligible central and state schemes into a 3-phase temporal execution plan (Now, Next, Later) with links and document checklists.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" /> Generate My Roadmap
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
