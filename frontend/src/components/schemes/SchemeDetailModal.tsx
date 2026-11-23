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
  UserCheck 
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";

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
    <Modal
      isOpen={!!scheme}
      onClose={onClose}
      title={scheme.scheme_name}
      subtitle={scheme.ministry || "Government of India / State Innovation Mission"}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-text">
        {/* Badges strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Chip variant="info" size="sm">
            {details.grantTypeBadge}
          </Chip>
          <Chip variant="neutral" size="sm">
            📍 {scheme.geographic_restriction || "Pan-India"}
          </Chip>
          {scheme.dpiit_required ? (
            <Chip variant="warn" size="sm">
              DPIIT Required
            </Chip>
          ) : (
            <Chip variant="met" size="sm">
              Open Framework
            </Chip>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {/* Key Financial Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-3.5 bg-surface-2 border-border">
              <div className="text-xs uppercase font-semibold text-muted">
                Individual Startup Grant
              </div>
              <div className="text-base font-bold text-ok font-headline mt-1">
                {details.individualTicket}
              </div>
              {details.macroCeilingDisplay && (
                <div className="text-xs text-muted font-medium mt-0.5">
                  {details.macroCeilingDisplay}
                </div>
              )}
            </Card>

            <Card className="p-3.5 bg-surface-2 border-border">
              <div className="text-xs uppercase font-semibold text-muted">
                Structure
              </div>
              <div className="text-xs font-bold text-text mt-1">
                {details.grantTypeBadge}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {details.dilutionTerms}
              </div>
            </Card>

            <Card className="p-3.5 bg-surface-2 border-border">
              <div className="text-xs uppercase font-semibold text-muted">
                Disbursement Cycle
              </div>
              <div className="text-xs font-bold text-text mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" />
                {scheme.processing_timeline || "30 to 60 days"}
              </div>
              <div className="text-xs text-muted mt-0.5">
                Milestone-based tranches
              </div>
            </Card>
          </div>

          {/* Who Should Opt For This Scheme? */}
          <Card className="p-4 bg-surface-2 border-border space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-accent" />
              Target Founder Persona
            </div>
            <p className="text-xs text-muted leading-relaxed pt-0.5">
              {details.whoShouldOpt}
            </p>
          </Card>

          {/* Scheme Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent" />
              Executive Program Overview
            </h3>
            <Card className="p-3.5 bg-surface-2 border-border text-xs text-text leading-relaxed">
              {scheme.nlp_summary || "This policy provides seed stage capital, prototype acceleration, and market access assistance for verified Indian ventures."}
            </Card>
          </div>

          {/* Active Profile Compatibility Evaluation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-ok" />
              Eligibility Checklist (Against Profile)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Sector Fit */}
              <Card className="p-3 bg-surface-2 border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text">Domain Focus</div>
                  <div className="text-xs text-muted">You: {userProfile.sector}</div>
                </div>
                <Chip variant="met" size="sm">Eligible</Chip>
              </Card>

              {/* Stage Fit */}
              <Card className="p-3 bg-surface-2 border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text">Stage Applicability</div>
                  <div className="text-xs text-muted">You: {userProfile.stage}</div>
                </div>
                <Chip variant="met" size="sm">Eligible</Chip>
              </Card>

              {/* State Fit */}
              <Card className="p-3 bg-surface-2 border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text">Geographic Jurisdiction</div>
                  <div className="text-xs text-muted">{scheme.geographic_restriction || "Pan-India"}</div>
                </div>
                <Chip variant="met" size="sm">Qualified</Chip>
              </Card>

              {/* DPIIT Status */}
              <Card className="p-3 bg-surface-2 border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text">DPIIT Recognition</div>
                  <div className="text-xs text-muted">
                    {scheme.dpiit_required ? "Mandatory" : "Optional / Open"}
                  </div>
                </div>
                <Chip variant={isDpiitMet ? "met" : "warn"} size="sm">
                  {isDpiitMet ? "Met" : "Action Req"}
                </Chip>
              </Card>
            </div>
          </div>

          {/* Required Documents Dossier */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent" />
              Required Application Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requiredDocs.map((doc, dIdx) => (
                <Card key={dIdx} className="flex items-center gap-2 p-2.5 bg-surface-2 border-border text-xs text-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate">{doc}</span>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with External Link */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-muted truncate max-w-sm">
            Source: <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{scheme.source_url || appUrl}</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold text-accent-contrast bg-accent hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Apply on Official Portal
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
