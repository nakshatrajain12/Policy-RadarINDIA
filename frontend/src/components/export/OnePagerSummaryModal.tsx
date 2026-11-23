"use client";

import React, { useRef } from "react";
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  FileText 
} from "lucide-react";
import { FounderProfile, RecommendationMatch } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";

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
    : `₹${(totalFundingEstimate / 100000).toFixed(0)} Lakhs`;

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
      "GOV-DASH INDIA: FOUNDER SCHEME INTELLIGENCE DOSSIER",
      `Generated for: ${profile.startupName || "Innovative Enterprise"}`,
      `Date: ${currentDate}`,
      "==================================================================",
      "",
      "FOUNDER PROFILE ATTRIBUTES:",
      `- Venture Sector: ${profile.sector}`,
      `- Maturity Stage: ${profile.stage}`,
      `- Registered State / Domicile: ${profile.state}`,
      `- Legal Structure: ${profile.entityType.replace(/_/g, " ")}`,
      `- DPIIT Recognition: ${profile.dpiitRegistered ? "YES (Verified)" : "NO (Pending registration)"}`,
      `- Women-Led: ${profile.womenLed ? "YES" : "NO"}`,
      "",
      `MAX NON-DILUTIVE & EQUITY-FREE CAPITAL POOL: Up to ${fundingDisplay}`,
      "",
      "------------------------------------------------------------------",
      "TOP 5 MATCHED CENTRAL & STATE SCHEMES:",
      "------------------------------------------------------------------"
    ];

    topMatches.forEach((s, idx) => {
      lines.push(`${idx + 1}. ${s.name.toUpperCase()}`);
      lines.push(`   - Ministry / Nodal Body: ${s.ministry || "Government Department"}`);
      lines.push(`   - Instrument: ${s.funding_type || "Non-Dilutive Grant"}`);
      lines.push(`   - Maximum Ticket: ${s.max_funding_display || "Variable"}`);
      lines.push(`   - Rule-Fit Match Score: ${s.match_score}%`);
      lines.push(`   - Key Rationale: ${(s.reasons || [s.reason]).join("; ")}`);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalized One-Pager Executive Summary"
      subtitle={`Official briefing customized for ${profile.startupName || "your venture"}.`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-text">
        {/* Top Control Bar */}
        <div className="flex items-center justify-end gap-2 pb-3 border-b border-border">
          <Button
            variant="primary"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print / Save PDF</span>
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownloadTxt}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Text Brief</span>
          </Button>
        </div>

        {/* Printable One-Pager Document Container */}
        <div 
          ref={printRef}
          className="print-container space-y-6 max-h-[60vh] overflow-y-auto pr-1"
        >
          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-contrast font-bold text-xs">
                  GD
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-text font-headline">
                    GOV-DASH INDIA
                  </h1>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
                    Scheme Intelligence Dossier
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted max-w-lg mt-1">
                National Government Schemes, Non-Dilutive Grants & Regulatory Compliance Pathway
              </p>
            </div>

            <div className="text-right">
              <Chip variant="met" size="sm">
                100% Grounded in Official Gazettes
              </Chip>
              <div className="text-xs text-muted mt-1 font-mono">
                Issued: {currentDate}
              </div>
            </div>
          </div>

          {/* Founder Profile Metadata Box */}
          <Card className="p-4 bg-surface-2 border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-xs uppercase font-semibold text-muted block">Startup Entity</span>
              <strong className="text-xs sm:text-sm font-bold text-text">
                {profile.startupName || "Innovative Enterprise"}
              </strong>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-muted block">Domain / Sector</span>
              <strong className="text-xs sm:text-sm font-bold text-accent">
                {profile.sector}
              </strong>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-muted block">Venture Stage</span>
              <strong className="text-xs sm:text-sm font-bold text-ok">
                {profile.stage}
              </strong>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-muted block">Location / State</span>
              <strong className="text-xs sm:text-sm font-bold text-warn">
                {profile.state}
              </strong>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-xs uppercase font-semibold text-muted block">DPIIT Status</span>
              <span className={`font-semibold ${profile.dpiitRegistered ? "text-ok" : "text-warn"}`}>
                {profile.dpiitRegistered ? "Recognized ✓" : "Non-DPIIT"}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-xs uppercase font-semibold text-muted block">Structure</span>
              <span className="font-semibold text-text">
                {profile.entityType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="pt-2 border-t border-border col-span-2">
              <span className="text-xs uppercase font-semibold text-muted block">Top 5 Capital Pool</span>
              <strong className="text-sm font-bold text-ok">
                {fundingDisplay} <span className="text-xs font-normal text-muted">(Combined target pool)</span>
              </strong>
            </div>
          </Card>

          {/* Top 5 Matched Schemes Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                Priority Government Schemes Tailored to Profile
              </h3>
              <span className="text-xs text-muted">
                Ranked by eligibility fit
              </span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Scheme & Ministry</th>
                    <th className="py-2.5 px-3">Instrument</th>
                    <th className="py-2.5 px-3">Max Cap</th>
                    <th className="py-2.5 px-3">Match</th>
                    <th className="py-2.5 px-3">Qualification Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topMatches.map((scheme, idx) => (
                    <tr key={scheme.id || idx} className="hover:bg-surface-2/60">
                      <td className="py-2.5 px-3 font-semibold text-muted">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-text line-clamp-1">
                          {scheme.name}
                        </div>
                        <div className="text-xs text-muted line-clamp-1">
                          {scheme.ministry || "Central Ministry / State Mission"}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Chip variant="neutral" size="sm">
                          {scheme.funding_type || "Grant"}
                        </Chip>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-ok">
                        {scheme.max_funding_display || "Non-dilutive"}
                      </td>
                      <td className="py-2.5 px-3">
                        <Chip variant="info" size="sm">
                          {scheme.match_score}%
                        </Chip>
                      </td>
                      <td className="py-2.5 px-3 text-muted">
                        <div className="line-clamp-2 text-xs">
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
          <Card className="p-4 bg-surface-2 border-border space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Strategic Policy Unlock & Compliance Roadmap
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                <span className="text-xs font-bold text-accent uppercase">Step 1: DPIIT Certification</span>
                <p className="text-xs text-muted">
                  {profile.dpiitRegistered 
                    ? "DPIIT active. Apply for 80-IAC tax holiday (3 consecutive years zero corporate tax)." 
                    : "Apply on startupindia.gov.in (free, 48 hours). Unlocks SISFS ₹70L & CGSS credit guarantees."}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                <span className="text-xs font-bold text-accent uppercase">Step 2: State Mission Sync</span>
                <p className="text-xs text-muted">
                  Enroll with the {profile.state} Startup Mission to access localized seed grants (e.g. ELEVATE, MSInS, TANSEED) and lease subsidies.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                <span className="text-xs font-bold text-accent uppercase">Step 3: IP & Statutory Rebate</span>
                <p className="text-xs text-muted">
                  Claim 80% statutory rebate on patent filings and 50% on trademark registration under the SIPP scheme.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted font-mono">
            GOV-DASH / Policy Radar India
          </span>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
