"use client";

import React from "react";
import { 
  ExternalLink, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Info, 
  UserCheck,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { formatInrCapital } from "@/lib/roadmapEngine";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { getSchemeMedia } from "@/lib/schemeMedia";

interface Props {
  scheme: Scheme | null;
  onClose: () => void;
  userProfile: FounderProfile;
  onOpenCopilot?: (scheme: Scheme) => void;
}

export function SchemeDetailModal({ scheme, onClose, userProfile, onOpenCopilot }: Props) {
  if (!scheme) return null;

  const details = formatSchemeGrantDetails(scheme);
  const media = getSchemeMedia(scheme);
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
    <Modal
      isOpen={!!scheme}
      onClose={onClose}
      title={scheme.scheme_name}
      subtitle={scheme.ministry || "Government of India / State Innovation Mission"}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-text">
        
        {/* Cover Picture & Ministry Emblem Banner */}
        <div className="relative h-44 -mx-6 -mt-4 mb-2 overflow-hidden bg-surface-raised border-b border-border">
          <img 
            src={media.coverImage} 
            alt={scheme.scheme_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          
          <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white p-1 shadow shrink-0 flex items-center justify-center">
                <img src={media.logoUrl} alt="Emblem" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <span className="text-xs font-bold text-white drop-shadow block">
                  {media.badgeLabel}
                </span>
                <span className="text-[11px] text-white/80 block">
                  {scheme.geographic_restriction || "Pan-India Jurisdiction"}
                </span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-lg text-xs font-bold bg-ok text-white shadow">
              {details.grantTypeBadge}
            </div>
          </div>
        </div>

        {/* Ask AI Copilot Nudge Banner */}
        {onOpenCopilot && (
          <div className="p-3.5 rounded-xl bg-accent-soft border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-text block">
                  Have questions about this scheme?
                </span>
                <span className="text-[11px] text-text-muted block">
                  Our mini RAG copilot has indexed this program's full gazette guidelines & document checklist.
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenCopilot(scheme);
              }}
              className="text-xs font-bold shrink-0 py-2 px-3 shadow-xs"
            >
              <span>Ask AI Copilot</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}

        {/* Badges strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Chip variant="info" size="sm">
            {details.grantTypeBadge}
          </Chip>
          <Chip variant={isDpiitMet ? "met" : "warn"} size="sm">
            {scheme.dpiit_required ? "DPIIT Required" : "No DPIIT Restriction"}
          </Chip>
          <Chip variant="neutral" size="sm">
            {scheme.geographic_restriction || "Pan-India"}
          </Chip>
          {scheme.status && (
            <Chip variant={scheme.status.toLowerCase() === "active" ? "met" : "warn"} size="sm">
              {scheme.status}
            </Chip>
          )}
        </div>

        {/* Capital Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="p-3 bg-surface-2 border-border">
            <span className="text-xs text-muted block">Max Capital Grant</span>
            <span className="text-base sm:text-lg font-bold text-ok">{scheme.max_funding_amount ? formatInrCapital(scheme.max_funding_amount) : (details.individualTicket || "Grant Subsidy")}</span>
          </Card>
          <Card className="p-3 bg-surface-2 border-border">
            <span className="text-xs text-muted block">Funding Structure</span>
            <span className="text-xs sm:text-sm font-bold text-text truncate block mt-0.5">{scheme.funding_type || "Direct Grant"}</span>
          </Card>
          <Card className="p-3 bg-surface-2 border-border col-span-2 sm:col-span-1">
            <span className="text-xs text-muted block">Processing Time</span>
            <span className="text-xs sm:text-sm font-bold text-text flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{scheme.processing_timeline || "30-60 Days"}</span>
            </span>
          </Card>
        </div>

        {/* Overview & NLP Summary */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent" />
            <span>Scheme Intelligence Overview</span>
          </h4>
          <p className="text-xs text-text leading-relaxed bg-surface-2 p-3.5 rounded-lg border border-border">
            {scheme.nlp_summary || "Official central/state policy scheme targeted at Indian innovative ventures."}
          </p>
        </div>

        {/* Eligibility Check against Founder Profile */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span>Eligibility Evaluation for {userProfile.startupName}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border bg-surface-2 flex items-center justify-between">
              <span className="text-muted">Target Sector:</span>
              <span className="font-semibold text-text truncate max-w-[150px]">
                {Array.isArray(scheme.sector_eligibility) 
                  ? scheme.sector_eligibility.join(", ") 
                  : scheme.sector_eligibility || "Cross-Sector"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border bg-surface-2 flex items-center justify-between">
              <span className="text-muted">Eligible Stage:</span>
              <span className="font-semibold text-text truncate max-w-[150px]">
                {Array.isArray(scheme.startup_stage) 
                  ? scheme.startup_stage.join(", ") 
                  : scheme.startup_stage || "All Stages"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border bg-surface-2 flex items-center justify-between">
              <span className="text-muted">DPIIT Recognition:</span>
              <span className={`font-semibold ${isDpiitMet ? "text-ok" : "text-warn"}`}>
                {scheme.dpiit_required ? (userProfile.dpiitRegistered ? "Met (Registered)" : "Required (Missing)") : "Not Required"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border bg-surface-2 flex items-center justify-between">
              <span className="text-muted">Geography:</span>
              <span className="font-semibold text-text">
                {scheme.geographic_restriction || "Pan-India"}
              </span>
            </div>
          </div>
        </div>

        {/* Required Statutory Documents */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-accent" />
            <span>Required Documents Checklist</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {requiredDocs.map((doc: string, idx: number) => (
              <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 border border-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                <span className="text-text truncate">{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Official Action Buttons */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-muted flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Single-Window Govt. Gateway</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-accent text-white hover:opacity-95 shadow-sm transition-opacity"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </Modal>
  );
}
