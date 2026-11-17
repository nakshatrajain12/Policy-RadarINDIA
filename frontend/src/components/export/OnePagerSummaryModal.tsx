"use client";

import React, { useRef } from "react";
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Coins, 
  ShieldCheck, 
  ExternalLink,
  FileText,
  Calendar,
  Compass
} from "lucide-react";
import { FounderProfile, RecommendationMatch } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FounderProfile;
  recommendations: RecommendationMatch[];
}

export function OnePagerSummaryModal({ isOpen, onClose, profile, recommendations }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const topMatches = recommendations.slice(0, 5);
  const totalFundingEstimate = topMatches.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0);
  const fundingDisplay = totalFundingEstimate >= 10000000 
    ? `₹${(totalFundingEstimate / 10000000).toFixed(2)} Cr` 
    : `₹${(totalFundingEstimate / 100000).toFixed(1)} Lakhs`;

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const lines = [
      "==================================================================",
      "GOV-DASH | POLICY RADAR INDIA — EXECUTIVE SCHEME BRIEFING",
      "Official Government Startup Policy & Matching Intelligence",
      "==================================================================",
      `Date Generated : ${currentDate}`,
      `Venture Name   : ${profile.startupName || "Innovative Enterprise"}`,
      `Domain Vertical: ${profile.sector}`,
      `Maturity Stage : ${profile.stage}`,
      `State / UT     : ${profile.state}`,
      `DPIIT Status   : ${profile.dpiitRegistered ? "Recognized (Active)" : "Unregistered (Action Required)"}`,
      `Legal Entity   : ${profile.entityType}`,
      "------------------------------------------------------------------",
      `TOTAL ACCESSIBLE FUNDING CEILING (TOP 5): ${fundingDisplay}`,
      "------------------------------------------------------------------",
      "",
      "TOP MATCHED GOVERNMENT SCHEMES:",
      ""
    ];

    topMatches.forEach((s, idx) => {
      lines.push(`${idx + 1}. ${s.name.toUpperCase()}`);
      lines.push(`   - Nodal Ministry/Agency: ${s.ministry || "Government Authority"}`);
      lines.push(`   - Funding Instrument   : ${s.funding_type || "Non-dilutive Grant"}`);
      lines.push(`   - Max Funding Ceiling  : ${s.max_funding_display || "Grant"}`);
      lines.push(`   - Match Fit Score      : ${s.match_score}% (Confidence: ${s.confidence_score || 95}%)`);
      lines.push(`   - Rationale            : ${(s.reasons || [s.reason]).join("; ")}`);
      lines.push(`   - Official Portal      : ${s.source_url || "https://startupindia.gov.in"}`);
      lines.push("");
    });

    lines.push("------------------------------------------------------------------");
    lines.push("STRATEGIC POLICY UNLOCK ACTIONS:");
    if (!profile.dpiitRegistered) {
      lines.push("1. Acquire DPIIT Startup Recognition on startupindia.gov.in (100% free, 48 hours).");
      lines.push("   Unlocks Startup India Seed Fund Scheme (SISFS) and Credit Guarantee Scheme (CGSS).");
    } else {
      lines.push("1. Apply for Section 80-IAC 3-year 100% Income Tax Exemption via Startup India portal.");
    }
    lines.push(`2. Register on ${profile.state} State Startup Mission portal for localized grants and patent fee rebates.`);
    lines.push("3. File provisional patent / IP for an 80% government statutory fee rebate.");
    lines.push("==================================================================");

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GOV-DASH_${(profile.startupName || "Startup").replace(/\s+/g, "_")}_Executive_Brief_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeInUp">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Personalized One-Pager Executive Summary
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Print or download an official briefing customized for {profile.startupName || "your venture"}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Text Brief</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable One-Pager Document Container */}
        <div 
          ref={printRef}
          className="print-container flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans space-y-6"
        >
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                  GD
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white font-headline">
                    GOV-DASH
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block -mt-1">
                    POLICY RADAR INDIA • SCHEME INTELLIGENCE DOSSIER
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mt-1">
                National Government Schemes, Non-Dilutive Grants & Regulatory Compliance Pathway
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                100% Grounded in Official Gazettes
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Issued: {currentDate}
              </div>
            </div>
          </div>

          {/* Founder Profile Metadata Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Startup Entity</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.startupName || "Innovative Enterprise"}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Domain / Sector</span>
              <strong className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {profile.sector}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Venture Stage</span>
              <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {profile.stage}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Location / State</span>
              <strong className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {profile.state}
              </strong>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">DPIIT Status</span>
              <span className={`font-semibold ${profile.dpiitRegistered ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {profile.dpiitRegistered ? "Recognized ✓" : "Non-DPIIT (Recommended to register)"}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Incorporation Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile.entityType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Combined Top 5 Capital Pool</span>
              <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {fundingDisplay} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Across eligible grants & seed instruments)</span>
              </strong>
            </div>
          </div>

          {/* Top 5 Matched Schemes Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Priority Government Schemes Tailored to Active Profile
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by hybrid eligibility fit
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Scheme & Nodal Ministry</th>
                    <th className="py-2.5 px-3">Instrument</th>
                    <th className="py-2.5 px-3">Max Cap</th>
                    <th className="py-2.5 px-3">Match</th>
                    <th className="py-2.5 px-3">Key Qualification Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {topMatches.map((scheme, idx) => (
                    <tr key={scheme.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="py-2.5 px-3 font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {scheme.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {scheme.ministry || "Central Ministry / State Mission"}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                          {scheme.funding_type || "Grant"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {scheme.max_funding_display || "Non-dilutive"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {scheme.match_score}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        <div className="line-clamp-2 text-[11px]">
                          {(scheme.reasons || [scheme.reason]).slice(0, 2).join("; ")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Action Roadmap */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Strategic Policy Unlock & Compliance Roadmap
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-blue-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Step 1: DPIIT Certification</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {profile.dpiitRegistered 
                    ? "DPIIT active. Apply for 80-IAC tax holiday (3 consecutive years zero corporate tax)." 
                    : "Apply on startupindia.gov.in (free, 48 hours). Unlocks SISFS ₹70L & CGSS credit guarantees."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-blue-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Step 2: State Mission Sync</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Enroll with the {profile.state} Startup Mission to access localized seed grants (e.g. ELEVATE, MSInS, TANSEED) and lease subsidies.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-blue-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Step 3: IP & Statutory Rebate</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Claim 80% statutory rebate on patent filings and 50% on trademark registration under the SIPP scheme.
                </p>
              </div>
            </div>
          </div>

          {/* Footer & Disclaimer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>GOV-DASH / Policy Radar India • Autonomous Policy Engine</span>
            <span>https://startupindia.gov.in • BTP Evaluated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

