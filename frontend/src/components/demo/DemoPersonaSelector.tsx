"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { DemoPersona } from "@/types";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "persona-student-agri",
    slug: "student_agri",
    name: "KisanAI Soil Health",
    founderName: "Aarav Patel (Student Innovator)",
    avatar: "🌾",
    tagline: "AgriTech • Student / Idea Stage • Karnataka",
    description: "Developing IoT-based soil micro-nutrient sensor. Seeking initial prototype fabrication grant & incubator support. Non-DPIIT.",
    answers: {
      startupName: "KisanAI Soil Health",
      sector: "AgriTech",
      stage: "Idea",
      state: "Karnataka",
      primaryGoal: "Idea Validation / Prototype",
      turnoverBand: "< ₹10 Lakhs (Pre-revenue)",
      documentsHeld: ["aadhaar_pan", "pitch_deck"],
      womenLed: false
    }
  },
  {
    id: "persona-woman-deeptech",
    slug: "woman_deeptech",
    name: "NeuroSense Diagnostics",
    founderName: "Dr. Priya Sharma (Woman Founder)",
    avatar: "🧬",
    tagline: "DeepTech AI • Prototype / MVP • Maharashtra",
    description: "AI-powered non-invasive neural biomarker scanner. DPIIT registered, filed provisional patent. Seeking BIRAC & Seed Fund support.",
    answers: {
      startupName: "NeuroSense Diagnostics",
      sector: "DeepTech & Hardware",
      stage: "Prototype/MVP",
      state: "Maharashtra",
      primaryGoal: "R&D Grant / Product MVP",
      turnoverBand: "₹10 Lakhs - ₹1 Crore",
      documentsHeld: ["aadhaar_pan", "incorporation", "dpiit_cert", "patent_ipr"],
      womenLed: true
    }
  },
  {
    id: "persona-cleantech-msme",
    slug: "cleantech_msme",
    name: "SuryaShakti Green Fab",
    founderName: "Rajesh Bhai (MSME Entrepreneur)",
    avatar: "⚡",
    tagline: "CleanTech & Solar • Early Revenue • Gujarat",
    description: "Rural solar pump and micro-grid inverter manufacturer. Generating commercial revenue, seeking collateral-free debt guarantees & scale-up subsidies.",
    answers: {
      startupName: "SuryaShakti Green Fab",
      sector: "CleanTech & EV",
      stage: "Early Revenue",
      state: "Gujarat",
      primaryGoal: "Scale-up Debt / Credit Guarantee",
      turnoverBand: "₹1 Crore - ₹5 Crore",
      documentsHeld: ["aadhaar_pan", "incorporation", "dpiit_cert", "udyam_msme", "gstin"],
      womenLed: false
    }
  }
];

interface Props {
  activePersonaSlug?: string;
  onSelectPersona: (persona: DemoPersona) => void;
  compact?: boolean;
  defaultExpanded?: boolean;
}

export function DemoPersonaSelector({ 
  activePersonaSlug, 
  onSelectPersona, 
  compact = false,
  defaultExpanded
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (defaultExpanded !== undefined) {
      setIsOpen(defaultExpanded);
      return;
    }
    try {
      const visited = localStorage.getItem("govdash_demo_visited");
      if (!visited) {
        setIsOpen(true);
      }
    } catch {}
  }, [defaultExpanded]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      localStorage.setItem("govdash_demo_visited", "true");
    } catch {}
  };

  const handleSelect = (p: DemoPersona) => {
    onSelectPersona(p);
    try {
      localStorage.setItem("govdash_demo_visited", "true");
    } catch {}
  };

  const activePersona = DEMO_PERSONAS.find(p => p.slug === activePersonaSlug);

  return (
    <Card className={`border-border bg-surface ${compact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
      {/* Header bar / Toggle */}
      <div 
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-accent/10 text-accent">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-text group-hover:text-accent transition-colors">
                Try a Sample Founder Profile
              </h3>
              <Chip variant="unknown" label="Interactive Demo" />
              {activePersona && (
                <Chip variant="info" label={`${activePersona.avatar} ${activePersona.name}`} />
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              Instant simulation with real startup data • No registration needed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="hidden sm:inline font-medium">
            {isOpen ? "Collapse" : "Choose persona"}
          </span>
          <span className={`p-1 rounded-md hover:bg-surface-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            <ChevronDown className="w-4 h-4 text-muted" />
          </span>
        </div>
      </div>

      {/* Expandable Grid */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 mt-3 border-t border-border">
          {DEMO_PERSONAS.map((p) => {
            const isSelected = activePersonaSlug === p.slug;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`p-3.5 rounded-xl text-left transition-colors border relative flex flex-col justify-between min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${
                  isSelected
                    ? "bg-surface border-accent ring-1 ring-accent shadow-xs"
                    : "bg-surface-2 hover:bg-surface border-border text-text"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xl">{p.avatar}</span>
                    {isSelected ? (
                      <Chip variant="met" icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Active" />
                    ) : (
                      <span className="text-xs text-muted hover:text-text flex items-center gap-1 font-semibold">
                        Select <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-text tracking-tight">
                    {p.name}
                  </div>
                  <div className="text-xs font-medium text-accent mb-1">
                    {p.tagline}
                  </div>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span className="truncate max-w-[150px] font-medium">{p.founderName}</span>
                  <span className="font-mono text-ok font-bold">
                    {p.answers.primaryGoal === "Idea Validation / Prototype" ? "₹10L Grant" : p.answers.primaryGoal === "R&D Grant / Product MVP" ? "₹50L Seed" : "₹10Cr Debt"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
