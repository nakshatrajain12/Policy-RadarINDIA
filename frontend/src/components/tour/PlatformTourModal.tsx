"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Layers, 
  BarChart3, 
  Bot, 
  Sparkles
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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

export function PlatformTourModal({ isOpen, onClose }: Props) {
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
    <Modal
      isOpen={isOpen}
      onClose={handleComplete}
      title="Guided Platform Tour"
      subtitle={`Step ${currentStep + 1} of ${TOUR_STEPS.length}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Step Visual & Card */}
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent text-accent-contrast flex items-center justify-center">
            <StepIcon className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              {step.highlightTag}
            </span>
            <h3 className="text-xl font-bold text-text tracking-tight font-headline mt-1">
              {step.title}
            </h3>
            <div className="text-xs font-semibold text-muted mt-1">
              {step.subtitle}
            </div>
            <p className="mt-3 text-xs sm:text-sm text-text leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 my-4">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              aria-label={`Go to tour step ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? "w-6 bg-accent" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {currentStep > 0 ? (
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleComplete}
            >
              Skip Tour
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleNext}
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? "Start Exploring" : "Next Feature"}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
