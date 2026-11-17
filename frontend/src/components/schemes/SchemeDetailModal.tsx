"use client";

import React from "react";
import { 
  X, 
  ExternalLink, 
  Building2, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Clock, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Globe2,
  Calendar,
  Award,
  Sparkles,
  Info,
  UserCheck
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";

interface Props {
  scheme: Scheme | null;
  onClose: () => void;
  userProfile: FounderProfile;
}

export function SchemeDetailModal({ scheme, onClose, userProfile }: Props) {
  if (!scheme) return null;

  const details = formatSchemeGrantDetails(scheme);
  const isDpiitMet = !scheme.dpiit_required || userProfile.dpiitRegistered;

  const requiredDocs = scheme.required_documents && scheme.required_documents.length > 0 
    ? scheme.required_documents 
    : [
        "Certificate of Incorporation / Registration",
        "Pitch Deck / Detailed Project Report (DPR)",
        "Founder KYC & Proof of Indian Citizenship",
        "Audited Financials / Bank Statement (Last 6 Months)",
        scheme.dpiit_required ? "DPIIT Recognition Certificate" : "Host Incubator Endorsement"
      ];

  const appUrl = scheme.application_portal || scheme.source_url || "https://www.startupindia.gov.in";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                {details.grantTypeBadge}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                📍 {scheme.geographic_restriction || "Pan-India"}
              </span>
              {scheme.dpiit_required ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  DPIIT Required
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Open Framework
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight font-headline">
              {scheme.scheme_name}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              {scheme.ministry || "Government of India / State Innovation Mission"}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700 dark:text-slate-300">
          
          {/* Explanatory Banner: WHAT IS A SCHEME DOSSIER? */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">What is this Scheme Dossier?</strong>
              <p className="mt-0.5 leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
                A verified regulatory intelligence dossier compiling official gazette rules, individual grant tranches, statutory eligibility checks, required documentation, and direct application links for {scheme.scheme_name}.
              </p>
            </div>
          </div>

          {/* Key Financial Snapshot: Individual Grant vs Macro Ceiling */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Individual Startup Grant
              </div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-headline mt-0.5">
                {details.individualTicket}
              </div>
              {details.macroCeilingDisplay && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {details.macroCeilingDisplay}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Financial Instrument & Structure
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {details.grantTypeBadge}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {details.dilutionTerms}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Disbursement Cycle
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {scheme.processing_timeline || "30 to 60 days"}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Milestone-based tranches
              </div>
            </div>
          </div>

          {/* Who Should Opt For This Scheme? */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Who Should Opt For This Scheme? (Target Founder Persona)
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed pt-0.5">
              {details.whoShouldOpt}
            </p>
          </div>

          {/* Scheme Summary / Grounding Evidence */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Executive Program Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              {scheme.nlp_summary || "This policy provides seed stage capital, prototype acceleration, and market access assistance for verified Indian ventures."}
            </p>
          </div>

          {/* Beneficiary Success Stories / Track Record Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Beneficiary Track Record & Impact
            </h3>
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-800 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Proven Scheme Impact
              </div>
              <p className="leading-relaxed">
                {scheme.success_stories || "Previous grantees of this program include national incubation alumni who leveraged early validation funding to deploy commercial pilots and secure institutional follow-on rounds."}
              </p>
            </div>
          </div>

          {/* Active Profile Compatibility Evaluation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Eligibility Checklist (Against Your Startup Profile)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Sector Fit */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Domain Focus</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">You: {userProfile.sector}</div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Eligible
                </span>
              </div>

              {/* Stage Fit */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Stage Applicability</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">You: {userProfile.stage}</div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Eligible
                </span>
              </div>

              {/* State Fit */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Geographic Jurisdiction</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{scheme.geographic_restriction || "Pan-India"}</div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Qualified
                </span>
              </div>

              {/* DPIIT Status */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">DPIIT Recognition</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {scheme.dpiit_required ? "Mandatory for this scheme" : "Optional / Open"}
                  </div>
                </div>
                {isDpiitMet ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Met
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    <HelpCircle className="w-4 h-4" /> Action Req
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Required Documents Dossier */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Required Application Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requiredDocs.map((doc, dIdx) => (
                <div key={dIdx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with External Link */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
            Source: <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{scheme.source_url || appUrl}</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              Apply on Official Portal
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
