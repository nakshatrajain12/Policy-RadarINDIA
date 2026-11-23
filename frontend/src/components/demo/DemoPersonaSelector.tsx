"use client";

import React from "react";
import { Sparkles, UserCheck, ArrowRight, CheckCircle2, Sprout, Cpu, Sun } from "lucide-react";
import { DemoPersona } from "@/types";

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
}

export function DemoPersonaSelector({ activePersonaSlug, onSelectPersona, compact = false }: Props) {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/25 ${compact ? "" : "my-4"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              Instant Interactive Demo Mode
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                NO SIGN-UP REQUIRED
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Pick a real Indian founder profile to test how the engine customizes roadmaps in &lt;1 second:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEMO_PERSONAS.map((p) => {
          const isSelected = activePersonaSlug === p.slug;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p)}
              className={`p-3.5 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-600/20 border-blue-400 shadow-md shadow-blue-500/20 scale-[1.01]"
                  : "bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-lg">{p.avatar}</span>
                  {isSelected ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active Profile
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 font-medium">
                      Try This <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white tracking-tight">
                  {p.name}
                </div>
                <div className="text-[10px] font-semibold text-blue-400 mb-1">
                  {p.tagline}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {p.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[150px]">{p.founderName}</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {p.answers.primaryGoal === "Idea Validation / Prototype" ? "₹10L Grant" : p.answers.primaryGoal === "R&D Grant / Product MVP" ? "₹50L Seed" : "₹10Cr Debt"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
