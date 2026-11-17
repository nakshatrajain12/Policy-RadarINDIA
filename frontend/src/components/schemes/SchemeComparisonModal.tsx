"use client";

import React, { useMemo } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Coins, 
  Building2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ExternalLink, 
  Award, 
  HelpCircle, 
  TrendingUp, 
  FileText, 
  Scale, 
  Check, 
  AlertTriangle,
  UserCheck,
  Target
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schemes: Scheme[];
  userProfile: FounderProfile;
  onSelectScheme: (scheme: Scheme) => void;
}

export function SchemeComparisonModal({
  isOpen,
  onClose,
  schemes,
  userProfile,
  onSelectScheme
}: Props) {
  if (!isOpen || schemes.length < 2) return null;

  // Analysis & Strategic Verdict Computation
  const analysis = useMemo(() => {
    const details = schemes.map(s => ({
      scheme: s,
      formatted: formatSchemeGrantDetails(s)
    }));

    // 1. Highest funding scheme
    const sortedByFunding = [...schemes].sort((a, b) => (b.max_funding_amount || 0) - (a.max_funding_amount || 0));
    const highestFunding = sortedByFunding[0];

    // 2. Grant / Equity-free schemes
    const grantSchemes = schemes.filter(s => {
      const ft = (s.funding_type || "").toLowerCase();
      return ft.includes("grant") || ft.includes("fellowship") || ft.includes("equity-free");
    });

    // 3. Best profile fit score
    const scoredSchemes = schemes.map(s => {
      let fitScore = 0;
      const sec = (Array.isArray(s.sector_eligibility) ? s.sector_eligibility.join(" ") : s.sector_eligibility || "").toLowerCase();
      const stg = (Array.isArray(s.startup_stage) ? s.startup_stage.join(" ") : s.startup_stage || "").toLowerCase();
      const geo = (s.geographic_restriction || "").toLowerCase();

      // Sector fit
      if (sec.includes("all") || sec.includes(userProfile.sector.toLowerCase())) fitScore += 35;
      // Stage fit
      if (stg.includes("all") || stg.includes(userProfile.stage.toLowerCase())) fitScore += 35;
      // State fit
      if (geo.includes("pan") || geo.includes(userProfile.state.toLowerCase())) fitScore += 20;
      // DPIIT alignment
      if (!s.dpiit_required || userProfile.dpiitRegistered) fitScore += 10;

      return { scheme: s, fitScore };
    });

    scoredSchemes.sort((a, b) => b.fitScore - a.fitScore);
    const bestFit = scoredSchemes[0].scheme;

    // Generate head-to-head recommendations
    const s1 = schemes[0];
    const s2 = schemes[1];
    const d1 = details[0].formatted;
    const d2 = details[1].formatted;

    return {
      details,
      highestFunding,
      grantSchemes,
      bestFit,
      s1,
      s2,
      d1,
      d2
    };
  }, [schemes, userProfile]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[94vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white tracking-tight">
                  Comparative Scheme Evaluation & Smart Recommendation
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  {schemes.length} Schemes Side-by-Side
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Head-to-head analysis comparing individual startup ticket sizes, grant structures, compliance load, and founder personas.
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

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          
          {/* ── 1. Smart Head-to-Head Recommendation Card ─────────────── */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-4 h-4" />
                GOV-DASH Strategic Decision Matrix & Verdict
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Profile-Optimized Match
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-950 dark:text-white font-headline">
              Recommended Choice for {userProfile.startupName || "Your Venture"}: {analysis.bestFit.scheme_name}
            </h3>

            {/* Head-to-Head Persona Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-blue-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                  <span className="truncate">{analysis.s1.scheme_name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600">Option A</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {analysis.d1.individualTicket}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200">Who should choose this:</strong> {analysis.d1.whoShouldOpt}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-blue-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                  <span className="truncate">{analysis.s2.scheme_name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600">Option B</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {analysis.d2.individualTicket}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200">Who should choose this:</strong> {analysis.d2.whoShouldOpt}
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Side-by-Side Parameter Matrix ───────────────────────── */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-4 px-4 w-48 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                      Comparison Dimension
                    </th>
                    {schemes.map((s, idx) => {
                      const isBestFit = s.id === analysis.bestFit.id;
                      const d = analysis.details[idx].formatted;
                      return (
                        <th 
                          key={s.id || idx} 
                          className={`py-4 px-4 text-left transition-colors ${
                            isBestFit ? "bg-blue-500/5 dark:bg-blue-950/20 border-l border-r border-blue-500/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {isBestFit && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white shadow-sm">
                                Best Fit
                              </span>
                            )}
                          </div>
                          <div className="font-extrabold text-sm text-slate-950 dark:text-white line-clamp-2">
                            {s.scheme_name}
                          </div>
                          <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {s.ministry || "Government Department"}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-sans">
                  
                  {/* Parameter 1: Individual Startup Grant / Ticket Size */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 bg-emerald-50/20 dark:bg-emerald-950/10">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Individual Startup Grant
                    </td>
                    {schemes.map((s, idx) => {
                      const d = analysis.details[idx].formatted;
                      return (
                        <td key={idx} className="py-3.5 px-4">
                          <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 font-headline">
                            {d.individualTicket}
                          </div>
                          {d.macroCeilingDisplay && (
                            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              {d.macroCeilingDisplay}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Parameter 2: Grant Instrument & Financial Nature */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Grant Type & Structure
                    </td>
                    {schemes.map((s, idx) => {
                      const d = analysis.details[idx].formatted;
                      return (
                        <td key={idx} className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-500/20 inline-block">
                            {d.grantTypeBadge}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Parameter 3: Who Should Opt For This Scheme? */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 bg-blue-50/10 dark:bg-blue-950/10">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Who Should Opt For This?
                    </td>
                    {schemes.map((s, idx) => {
                      const d = analysis.details[idx].formatted;
                      return (
                        <td key={idx} className="py-3.5 px-4 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {d.whoShouldOpt}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Parameter 4: When to Choose */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      When to Choose This
                    </td>
                    {schemes.map((s, idx) => {
                      const d = analysis.details[idx].formatted;
                      return (
                        <td key={idx} className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {d.whenToChoose}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Parameter 5: When to Avoid */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      When to Avoid
                    </td>
                    {schemes.map((s, idx) => {
                      const d = analysis.details[idx].formatted;
                      return (
                        <td key={idx} className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {d.whenToAvoid}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Parameter 6: Equity Dilution & Repayment */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Equity Dilution Terms
                    </td>
                    {schemes.map((s, idx) => {
                      const d = analysis.details[idx].formatted;
                      return (
                        <td key={idx} className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {d.dilutionTerms}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Parameter 7: Target Startup Stage */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Target Maturity Stage
                    </td>
                    {schemes.map((s, idx) => (
                      <td key={idx} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {Array.isArray(s.startup_stage) ? s.startup_stage.join(", ") : s.startup_stage || "All Stages"}
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 8: Sector Focus */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Sector Focus
                    </td>
                    {schemes.map((s, idx) => (
                      <td key={idx} className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {Array.isArray(s.sector_eligibility) ? s.sector_eligibility.join(", ") : s.sector_eligibility || "All Sectors"}
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 9: DPIIT Registration Requirement */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      DPIIT Prerequisite
                    </td>
                    {schemes.map((s, idx) => (
                      <td key={idx} className="py-3.5 px-4">
                        {s.dpiit_required ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" /> Mandatory
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 w-fit">
                            Open (Not Required)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 10: Geographic Scope */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Geographic Scope
                    </td>
                    {schemes.map((s, idx) => (
                      <td key={idx} className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        📍 {s.geographic_restriction || "Pan-India"}
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 11: Processing Timeline */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Processing Cycle
                    </td>
                    {schemes.map((s, idx) => (
                      <td key={idx} className="py-3.5 px-4 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {s.processing_timeline || "30 to 60 days in tranches"}
                      </td>
                    ))}
                  </tr>

                  {/* Parameter 12: Actions & Dossier */}
                  <tr className="bg-slate-50 dark:bg-slate-950">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      Scheme Dossiers
                    </td>
                    {schemes.map((s, idx) => (
                      <td key={idx} className="py-4 px-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <button
                            onClick={() => {
                              onClose();
                              onSelectScheme(s);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Dossier</span>
                          </button>
                          {s.source_url && (
                            <a
                              href={s.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Evaluating against active venture: <strong className="text-slate-900 dark:text-white">{userProfile.startupName || "Startup"}</strong> ({userProfile.sector} • {userProfile.stage} • {userProfile.state})
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
}
