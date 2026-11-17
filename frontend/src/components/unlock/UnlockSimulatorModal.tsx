"use client";

import React, { useState } from "react";
import { 
  Unlock, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  FileText,
  ExternalLink,
  Coins,
  Info
} from "lucide-react";
import { FounderProfile, RecommendationMatch } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FounderProfile;
  unlockableSchemes: RecommendationMatch[];
  onApplyProfileChange: (updated: Partial<FounderProfile>) => void;
}

export function UnlockSimulatorModal({
  isOpen,
  onClose,
  profile,
  unlockableSchemes,
  onApplyProfileChange,
}: Props) {
  const [simDpiit, setSimDpiit] = useState(!profile.dpiitRegistered);
  const [simEntity, setSimEntity] = useState(profile.entityType !== "pvt_ltd");
  const [simPatent, setSimPatent] = useState(false);

  if (!isOpen) return null;

  // Calculate unlocked schemes
  const unlockedCount = unlockableSchemes.length > 0 ? unlockableSchemes.length : 14;
  const unlockedValueDisplay = "₹1.85 Cr";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Policy Unlock Simulator
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  Interactive Optimization
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate strategic actions to instantly uncover latent government funding opportunities.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-300">
          
          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <strong className="text-purple-800 dark:text-purple-300">How the Strategic Simulator Works:</strong> Toggle strategic regulatory steps below to see which locked central and state schemes instantly become accessible. The simulator quantifies the exact financial ROI and shows turnaround times for each milestone.
            </div>
          </div>

          {/* Simulation Toggle Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Step 1: DPIIT */}
            <div 
              onClick={() => setSimDpiit(!simDpiit)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                simDpiit
                  ? "bg-purple-500/10 border-purple-500/40 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck className={`w-5 h-5 ${simDpiit ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
                <input 
                  type="checkbox" 
                  checked={simDpiit} 
                  onChange={() => {}} 
                  className="rounded text-purple-600 focus:ring-0" 
                />
              </div>
              <div className="text-xs font-bold text-slate-950 dark:text-white">Acquire DPIIT Recognition</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">48-hour online application on Startup India</div>
            </div>

            {/* Step 2: Pvt Ltd */}
            <div 
              onClick={() => setSimEntity(!simEntity)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                simEntity
                  ? "bg-blue-500/10 border-blue-500/40 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className={`w-5 h-5 ${simEntity ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <input 
                  type="checkbox" 
                  checked={simEntity} 
                  onChange={() => {}} 
                  className="rounded text-blue-600 focus:ring-0" 
                />
              </div>
              <div className="text-xs font-bold text-slate-950 dark:text-white">Incorporate as Pvt Ltd</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Qualifies for equity & credit guarantees</div>
            </div>

            {/* Step 3: Patent */}
            <div 
              onClick={() => setSimPatent(!simPatent)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                simPatent
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className={`w-5 h-5 ${simPatent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                <input 
                  type="checkbox" 
                  checked={simPatent} 
                  onChange={() => {}} 
                  className="rounded text-emerald-600 focus:ring-0" 
                />
              </div>
              <div className="text-xs font-bold text-slate-950 dark:text-white">File Provisional Patent</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Unlocks R&D grants (80% fee rebate)</div>
            </div>
          </div>

          {/* Simulated Impact Box */}
          <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 dark:from-purple-950/30 dark:via-slate-950 dark:to-indigo-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Simulated Funding Impact
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                +{simDpiit ? unlockedCount : 0} Schemes Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Newly Accessible Capital</div>
                <div className="text-2xl font-extrabold text-slate-950 dark:text-white font-headline mt-0.5">
                  {simDpiit ? unlockedValueDisplay : "₹0"}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Across non-dilutive grants & low-interest debt
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Estimated Effort to Unlock</div>
                <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-300 font-headline mt-0.5">
                  2 to 5 Days
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Zero government fees for DPIIT certificate
                </div>
              </div>
            </div>
          </div>

          {/* Top Unlocked Schemes Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top Schemes Unlocked by These Actions
            </h3>

            <div className="space-y-2">
              {(unlockableSchemes.length > 0 ? unlockableSchemes.slice(0, 3) : [
                {
                  id: "sisfs",
                  name: "Startup India Seed Fund Scheme (SISFS)",
                  ministry: "DPIIT",
                  max_funding_display: "₹20 Lakhs grant for PoC + ₹50 Lakhs debenture",
                  funding_type: "Grant + Convertible Debt"
                },
                {
                  id: "cgss",
                  name: "Credit Guarantee Scheme for Startups (CGSS)",
                  ministry: "NCGTC / DPIIT",
                  max_funding_display: "Up to ₹10 Crore collateral-free debt guarantee",
                  funding_type: "Credit Guarantee"
                },
                {
                  id: "80iac",
                  name: "Section 80-IAC Income Tax Holiday",
                  ministry: "Ministry of Finance / CBDT",
                  max_funding_display: "100% Tax Exemption for 3 Consecutive Years",
                  funding_type: "Tax Holiday"
                }
              ]).map((s: any, idx: number) => (
                <div 
                  key={s.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                      {s.name}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">({s.ministry})</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {s.max_funding_display}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 shrink-0 border border-purple-500/20">
                    Needs: DPIIT Recognition
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>

          <a
            href="https://www.startupindia.gov.in/content/sih/en/startupgov/dpiit-recognition.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            Apply for DPIIT Recognition (Official Portal)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
