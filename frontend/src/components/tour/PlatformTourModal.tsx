"use client";

import React, { useState } from "react";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Compass, 
  Layers, 
  BarChart3, 
  Bot, 
  ShieldCheck, 
  CheckCircle2 
} from "lucide-react";

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  highlightTag: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to GOV-DASH INDIA 🇮🇳",
    subtitle: "National Startup Scheme & Policy Intelligence Platform",
    description: "GOV-DASH aggregates 193 verified central and state startup funding schemes across 132 ministries and 28 states, mapping them into actionable, non-dilutive capital pathways.",
    icon: Compass,
    highlightTag: "Overview"
  },
  {
    title: "Personalised 3-Phase Roadmap Engine",
    subtitle: "Moving from Information to an Actionable Path",
    description: "Rather than an unranked list, the engine generates an ordered execution roadmap: Phase 1: NOW (0-2 weeks) for prerequisite registrations and idea micro-grants, Phase 2: NEXT (1-3 months) for prototype validation seed funds, and Phase 3: LATER (3-12 months) for debt guarantees and tax holidays.",
    icon: Sparkles,
    highlightTag: "Roadmap Engine"
  },
  {
    title: "193 Verified Scheme Explorer",
    subtitle: "Search, Filter & Compare Funding Programs",
    description: "Explore official ministries, grant amounts up to ₹10 Crore, required documents, and direct application portal links. Compare schemes side-by-side with 1-click comparison.",
    icon: Layers,
    highlightTag: "Schemes Explorer"
  },
  {
    title: "Visual Policy Analytics & Capital Flow",
    subtitle: "Macro Intelligence on Funding Instruments",
    description: "Inspect government funding allocations via interactive charts: grant vs low-interest loan vs equity breakdown, stage distribution, and state-wise corridor coverage.",
    icon: BarChart3,
    highlightTag: "Analytics 2.0"
  },
  {
    title: "Interactive AI Copilot & State Guides",
    subtitle: "Conversational Assistance & Compliance Guides",
    description: "Ask our specialized Policy AI Copilot questions about scheme eligibility, pitch deck preparation, and state-level startup mission subsidies. Download executive 1-pager briefs anytime.",
    icon: Bot,
    highlightTag: "AI Copilot"
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function PlatformTourModal({ isOpen, onClose, onNavigateTab }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("govdash_tour_completed", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Guided Platform Tour
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={handleComplete}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Skip Tour
          </button>
        </div>

        {/* Step Visual & Card */}
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <StepIcon className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              {step.highlightTag}
            </span>
            <h3 className="text-xl font-black text-white tracking-tight font-headline mt-0.5">
              {step.title}
            </h3>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              {step.subtitle}
            </div>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 my-6">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? "w-6 bg-blue-500" : "w-2 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? "Start Exploring" : "Next Feature"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
