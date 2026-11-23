"use client";

import React, { useRef } from "react";
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { FounderProfile, RecommendationMatch, PersonalizedRoadmap, RoadmapStep } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FounderProfile;
  recommendations: RecommendationMatch[];
  roadmap?: PersonalizedRoadmap | null;
}

export function OnePagerSummaryModal({ isOpen, onClose, profile, recommendations, roadmap }: Props) {
  const dossierRef = useRef<HTMLDivElement>(null);

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

  // Extract roadmap steps grouped by phase
  const allRoadmapSteps: RoadmapStep[] = roadmap?.steps || [];
  const nowSteps = allRoadmapSteps.filter(s => s.phase === "now");
  const nextSteps = allRoadmapSteps.filter(s => s.phase === "next");
  const laterSteps = allRoadmapSteps.filter(s => s.phase === "later");

  const totalRoadmapCapital = roadmap?.stats?.totalGrantDisplay || fundingDisplay;
  const roadmapCapitalSummary = roadmap?.stats?.totalCapitalDisplay || `Up to ${fundingDisplay} across priority non-dilutive schemes`;

  // ── 1. Isolated High-Fidelity Print Engine ──────────────────────────────────
  const handlePrint = () => {
    const printEl = document.getElementById("printable-executive-dossier");
    if (!printEl) {
      window.print();
      return;
    }

    // Create or reuse hidden print iframe to isolate print rendering from website UI
    let printIframe = document.getElementById("executive-dossier-print-frame") as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement("iframe");
      printIframe.id = "executive-dossier-print-frame";
      printIframe.style.position = "fixed";
      printIframe.style.right = "0";
      printIframe.style.bottom = "0";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "none";
      document.body.appendChild(printIframe);
    }

    const doc = printIframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const printStyles = `
      @page {
        size: A4 portrait;
        margin: 12mm 15mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 0;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 11px;
        line-height: 1.45;
      }
      h1, h2, h3, h4 {
        margin: 0;
        color: #0f172a;
        font-weight: 700;
      }
      p { margin: 0; }
      .header-dossier {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 12px;
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .brand-title {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #0f172a;
      }
      .sub-title {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #1d4ed8;
        margin-top: 2px;
      }
      .tagline {
        font-size: 10px;
        color: #475569;
        margin-top: 4px;
      }
      .badge-verified {
        display: inline-block;
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .profile-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 14px;
      }
      .profile-item span {
        display: block;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748b;
      }
      .profile-item strong {
        font-size: 12px;
        color: #0f172a;
      }
      .section-heading {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #0f172a;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 4px;
        margin: 12px 0 8px 0;
        display: flex;
        justify-content: space-between;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
        margin-bottom: 14px;
      }
      th {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 6px 8px;
        text-align: left;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        color: #475569;
      }
      td {
        border: 1px solid #e2e8f0;
        padding: 6px 8px;
        vertical-align: top;
      }
      tr:nth-child(even) { background: #fafafa; }
      .pill {
        display: inline-block;
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 8.5px;
        font-weight: 700;
      }
      .pill-grant { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .pill-met { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
      .pill-warn { background: #fffbeb; color: #78350f; border: 1px solid #fde68a; }
      .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 14px;
      }
      .roadmap-col {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #ffffff;
        padding: 8px 10px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .roadmap-col-header {
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
        margin-bottom: 6px;
      }
      .roadmap-col-title {
        font-size: 10px;
        font-weight: 700;
        color: #1d4ed8;
        text-transform: uppercase;
      }
      .roadmap-col-time {
        font-size: 8.5px;
        color: #64748b;
      }
      .step-item {
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px dashed #f1f5f9;
      }
      .step-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .step-name {
        font-weight: 700;
        font-size: 10px;
        color: #0f172a;
      }
      .step-sub {
        font-size: 8.5px;
        color: #64748b;
      }
      .step-funding {
        font-weight: 700;
        color: #166534;
        font-size: 9px;
      }
      .compliance-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 12px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .compliance-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 6px;
      }
      .compliance-item {
        font-size: 9px;
        color: #334155;
      }
      .compliance-item strong {
        display: block;
        color: #0f172a;
        margin-bottom: 2px;
      }
      .footer-dossier {
        border-top: 1px solid #cbd5e1;
        padding-top: 6px;
        font-size: 8.5px;
        color: #64748b;
        display: flex;
        justify-content: space-between;
      }
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>GOV-DASH INDIA — Scheme Intelligence Dossier — ${profile.startupName || "Executive Summary"}</title>
        <style>${printStyles}</style>
      </head>
      <body>
        ${printEl.innerHTML}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    }, 250);
  };

  // ── 2. Download Self-Contained HTML Dossier ──────────────────────────────────
  const handleDownloadHtml = () => {
    const printEl = document.getElementById("printable-executive-dossier");
    if (!printEl) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Policy Radar India — Executive Briefing Dossier — ${profile.startupName || "Venture"}</title>
  <style>
    body {
      max-width: 900px;
      margin: 20px auto;
      padding: 30px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
    }
    .header-dossier { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; }
    .sub-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1d4ed8; letter-spacing: 0.08em; }
    .profile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .profile-item span { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #64748b; }
    .profile-item strong { font-size: 13px; color: #0f172a; }
    .section-heading { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin: 16px 0 10px 0; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
    td { border: 1px solid #e2e8f0; padding: 8px 10px; vertical-align: top; }
    tr:nth-child(even) { background: #fafafa; }
    .roadmap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .roadmap-col { border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; padding: 10px 12px; }
    .roadmap-col-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px; }
    .roadmap-col-title { font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; }
    .step-item { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #f1f5f9; }
    .compliance-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .compliance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
    .footer-dossier { border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 9px; color: #64748b; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  ${printEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GOV-DASH_${(profile.startupName || "Startup").replace(/\s+/g, "_")}_Executive_Dossier_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── 3. Plain Text Brief Export ──────────────────────────────────────────────
  const handleDownloadTxt = () => {
    const lines = [
      "==================================================================",
      "GOV-DASH INDIA: FOUNDER SCHEME INTELLIGENCE DOSSIER",
      `Generated for: ${profile.startupName || "Innovative Enterprise"}`,
      `Date: ${currentDate}`,
      "==================================================================",
      "",
      "1. FOUNDER VENTURE ATTRIBUTES:",
      `- Venture Sector: ${profile.sector}`,
      `- Maturity Stage: ${profile.stage}`,
      `- Registered State: ${profile.state}`,
      `- Legal Structure: ${profile.entityType.replace(/_/g, " ")}`,
      `- DPIIT Recognition: ${profile.dpiitRegistered ? "YES (Verified)" : "NO (Pending registration)"}`,
      `- Women-Led: ${profile.womenLed ? "YES" : "NO"}`,
      "",
      `MAX CAPITAL ACCESS POOL: ${roadmapCapitalSummary}`,
      "",
      "------------------------------------------------------------------",
      "2. TOP 5 MATCHED CENTRAL & STATE SCHEMES:",
      "------------------------------------------------------------------"
    ];

    topMatches.forEach((s, idx) => {
      lines.push(`${idx + 1}. ${s.name.toUpperCase()}`);
      lines.push(`   - Sponsoring Body: ${s.ministry || "Government Department"}`);
      lines.push(`   - Instrument: ${s.funding_type || "Non-Dilutive Grant"}`);
      lines.push(`   - Maximum Ticket: ${s.max_funding_display || "Variable"}`);
      lines.push(`   - Match Score: ${s.match_score}%`);
      lines.push(`   - Rationale: ${(s.reasons || [s.reason]).join("; ")}`);
      lines.push("");
    });

    lines.push("------------------------------------------------------------------");
    lines.push("3. PERSONALIZED ACTION ROADMAP:");
    lines.push("------------------------------------------------------------------");

    if (nowSteps.length > 0) {
      lines.push("PHASE 1: IMMEDIATE VALIDATION & GRANTS (0-6 MONTHS)");
      nowSteps.forEach(s => {
        lines.push(`• [${s.status.toUpperCase()}] ${s.title}`);
        lines.push(`  Scheme: ${s.schemeName} | Cap: ${s.fundingDisplay}`);
        lines.push(`  Action: ${s.whyItMatters}`);
      });
      lines.push("");
    }

    if (nextSteps.length > 0) {
      lines.push("PHASE 2: COMMERCIAL SCALE-UP & SEED FUNDING (6-18 MONTHS)");
      nextSteps.forEach(s => {
        lines.push(`• [${s.status.toUpperCase()}] ${s.title}`);
        lines.push(`  Scheme: ${s.schemeName} | Cap: ${s.fundingDisplay}`);
        lines.push(`  Action: ${s.whyItMatters}`);
      });
      lines.push("");
    }

    if (laterSteps.length > 0) {
      lines.push("PHASE 3: SCALE FINANCING & DEBT GUARANTEES (18-36 MONTHS)");
      laterSteps.forEach(s => {
        lines.push(`• [${s.status.toUpperCase()}] ${s.title}`);
        lines.push(`  Scheme: ${s.schemeName} | Cap: ${s.fundingDisplay}`);
        lines.push(`  Action: ${s.whyItMatters}`);
      });
      lines.push("");
    }

    lines.push("------------------------------------------------------------------");
    lines.push("4. REGULATORY & COMPLIANCE PATHWAY:");
    lines.push("1. DPIIT Recognition: Apply on startupindia.gov.in (free, 48 hours).");
    lines.push("2. Section 80-IAC: Apply for 3-year consecutive corporate tax holiday.");
    lines.push(`3. State Mission: Enroll on ${profile.state} Startup Mission portal for localized grants.`);
    lines.push("4. SIPP: Claim 80% statutory rebate on patent filings.");
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
      subtitle={`Official policy & scheme briefing generated for ${profile.startupName || "your venture"}.`}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5 text-text">
        {/* Top Control Bar with Print and Download actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="text-xs text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ok" />
            <span>Ready for executive review, investor pitch deck appendix & grant dossiers</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadHtml}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>HTML Dossier</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleDownloadTxt}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Text Brief</span>
            </Button>
          </div>
        </div>

        {/* Printable One-Pager Document Container */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div 
            id="printable-executive-dossier"
            ref={dossierRef}
            className="p-6 sm:p-8 bg-surface border border-border rounded-xl space-y-6 shadow-xs text-text transition-colors"
          >
            {/* 1. Official Header */}
            <div className="header-dossier flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-border pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-accent text-accent-contrast flex items-center justify-center font-bold text-sm font-headline shadow-xs">
                    GD
                  </div>
                  <div>
                    <h1 className="brand-title text-xl font-bold tracking-tight font-headline text-text">
                      GOV-DASH INDIA
                    </h1>
                    <div className="sub-title text-xs font-bold text-accent uppercase tracking-wider">
                      Executive Scheme & Capital Intelligence Dossier
                    </div>
                  </div>
                </div>
                <p className="tagline text-xs text-muted mt-1.5">
                  Non-Dilutive Government Grants, Incubator Seed Funds & Collateral-Free Regulatory Pathway
                </p>
              </div>

              <div className="sm:text-right space-y-1">
                <div className="badge-verified">
                  <Chip variant="met" size="sm">
                    Verified Gazette Grounded
                  </Chip>
                </div>
                <div className="text-xs text-muted font-mono">
                  Dossier Ref: {profile.startupName ? profile.startupName.toUpperCase().replace(/\s+/g, "-") : "FOUNDER"}-2026
                </div>
                <div className="text-xs text-muted">
                  Issued: <strong>{currentDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. Founder Profile Architecture Card */}
            <div>
              <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                <span>Venture Architecture & Eligibility Profile</span>
                <span className="text-xs text-muted font-normal lowercase">rule-fit evaluation profile</span>
              </div>

              <div className="profile-grid grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-2 border border-border text-xs">
                <div className="profile-item">
                  <span className="text-xs font-semibold text-muted uppercase">Startup Venture</span>
                  <strong className="text-sm font-bold text-text block mt-0.5 truncate">
                    {profile.startupName || "Innovative Enterprise"}
                  </strong>
                </div>

                <div className="profile-item">
                  <span className="text-xs font-semibold text-muted uppercase">Sector / Domain</span>
                  <strong className="text-sm font-bold text-accent block mt-0.5 truncate">
                    {profile.sector}
                  </strong>
                </div>

                <div className="profile-item">
                  <span className="text-xs font-semibold text-muted uppercase">Maturity Stage</span>
                  <strong className="text-sm font-bold text-ok block mt-0.5 truncate">
                    {profile.stage}
                  </strong>
                </div>

                <div className="profile-item">
                  <span className="text-xs font-semibold text-muted uppercase">State Jurisdiction</span>
                  <strong className="text-sm font-bold text-text block mt-0.5 truncate">
                    {profile.state}
                  </strong>
                </div>

                <div className="profile-item pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-muted uppercase">DPIIT Recognition</span>
                  <span className={`text-xs font-bold block mt-0.5 ${profile.dpiitRegistered ? "text-ok" : "text-warn"}`}>
                    {profile.dpiitRegistered ? "Recognized (Verified) ✓" : "Pending Registration"}
                  </span>
                </div>

                <div className="profile-item pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-muted uppercase">Legal Structure</span>
                  <span className="text-xs font-bold text-text block mt-0.5 capitalize">
                    {profile.entityType.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="profile-item pt-2 border-t border-border col-span-2">
                  <span className="text-xs font-semibold text-muted uppercase">Capital Access Scope</span>
                  <strong className="text-xs sm:text-sm font-bold text-ok block mt-0.5 truncate">
                    {roadmapCapitalSummary}
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. Priority Scheme Matches Table */}
            <div>
              <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Top 5 Matched Central & State Government Schemes
                </span>
                <span className="text-xs text-muted font-normal">Ranked by eligibility qualification score</span>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-surface">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Scheme & Ministry</th>
                      <th className="py-2.5 px-3">Funding Instrument</th>
                      <th className="py-2.5 px-3">Max Cap</th>
                      <th className="py-2.5 px-3">Match</th>
                      <th className="py-2.5 px-3">Qualification Rationale & Key Prerequisites</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topMatches.map((scheme, idx) => (
                      <tr key={scheme.id || idx} className="hover:bg-surface-2/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-muted">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-text">
                            {scheme.name}
                          </div>
                          <div className="text-xs text-muted">
                            {scheme.ministry || "Central Ministry / State Mission"}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Chip variant="neutral" size="sm">
                            {scheme.funding_type || "Capital Grant"}
                          </Chip>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-ok whitespace-nowrap">
                          {scheme.max_funding_display || "Variable Cap"}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Chip variant="info" size="sm">
                            {scheme.match_score}%
                          </Chip>
                        </td>
                        <td className="py-2.5 px-3 text-muted">
                          <div className="line-clamp-2 leading-relaxed">
                            {(scheme.reasons || [scheme.reason]).slice(0, 2).join("; ")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Full Personalized Action Roadmap (3-Phases) */}
            <div>
              <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Actionable Step-by-Step Capital & Accreditation Roadmap
                </span>
                <span className="text-xs text-muted font-normal">3 sequential operational phases</span>
              </div>

              <div className="roadmap-grid grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Phase 1: Immediate Validation */}
                <div className="roadmap-col border border-border rounded-lg bg-surface-2 p-3 space-y-2.5">
                  <div className="roadmap-col-header pb-2 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="roadmap-col-title text-xs font-bold text-accent uppercase">
                        Phase 1: Validation
                      </div>
                      <div className="roadmap-col-time text-xs text-muted">
                        Months 0 - 6 • PoC & Prototyping
                      </div>
                    </div>
                    <Chip variant="info" size="sm">
                      {nowSteps.length} Steps
                    </Chip>
                  </div>

                  <div className="space-y-2">
                    {nowSteps.length > 0 ? (
                      nowSteps.map((step) => (
                        <div key={step.id} className="step-item p-2 rounded bg-surface border border-border text-xs space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <span className="step-name font-bold text-text line-clamp-1">{step.title}</span>
                            <span className="step-funding font-bold text-ok shrink-0">{step.fundingDisplay}</span>
                          </div>
                          <div className="step-sub text-xs text-muted line-clamp-1">{step.schemeName}</div>
                          <div className="text-xs text-muted leading-tight line-clamp-2">{step.whyItMatters}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted italic p-2">Foundation established. Proceeding to commercialization.</div>
                    )}
                  </div>
                </div>

                {/* Phase 2: Commercial Scale */}
                <div className="roadmap-col border border-border rounded-lg bg-surface-2 p-3 space-y-2.5">
                  <div className="roadmap-col-header pb-2 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="roadmap-col-title text-xs font-bold text-accent uppercase">
                        Phase 2: Commercial Scale
                      </div>
                      <div className="roadmap-col-time text-xs text-muted">
                        Months 6 - 18 • Seed Capital & Pilot
                      </div>
                    </div>
                    <Chip variant="unknown" size="sm">
                      {nextSteps.length} Steps
                    </Chip>
                  </div>

                  <div className="space-y-2">
                    {nextSteps.length > 0 ? (
                      nextSteps.map((step) => (
                        <div key={step.id} className="step-item p-2 rounded bg-surface border border-border text-xs space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <span className="step-name font-bold text-text line-clamp-1">{step.title}</span>
                            <span className="step-funding font-bold text-ok shrink-0">{step.fundingDisplay}</span>
                          </div>
                          <div className="step-sub text-xs text-muted line-clamp-1">{step.schemeName}</div>
                          <div className="text-xs text-muted leading-tight line-clamp-2">{step.whyItMatters}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted italic p-2">Seed targets mapped under state mission.</div>
                    )}
                  </div>
                </div>

                {/* Phase 3: Debt Guarantee & Expansion */}
                <div className="roadmap-col border border-border rounded-lg bg-surface-2 p-3 space-y-2.5">
                  <div className="roadmap-col-header pb-2 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="roadmap-col-title text-xs font-bold text-accent uppercase">
                        Phase 3: Scale Debt
                      </div>
                      <div className="roadmap-col-time text-xs text-muted">
                        Months 18 - 36 • Credit Guarantees
                      </div>
                    </div>
                    <Chip variant="met" size="sm">
                      {laterSteps.length} Steps
                    </Chip>
                  </div>

                  <div className="space-y-2">
                    {laterSteps.length > 0 ? (
                      laterSteps.map((step) => (
                        <div key={step.id} className="step-item p-2 rounded bg-surface border border-border text-xs space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <span className="step-name font-bold text-text line-clamp-1">{step.title}</span>
                            <span className="step-funding font-bold text-ok shrink-0">{step.fundingDisplay}</span>
                          </div>
                          <div className="step-sub text-xs text-muted line-clamp-1">{step.schemeName}</div>
                          <div className="text-xs text-muted leading-tight line-clamp-2">{step.whyItMatters}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted italic p-2">Scale-up facilities mapped under CGSS & SIDBI.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Strategic Regulatory & Compliance Unlock Framework */}
            <div className="compliance-box p-4 rounded-xl bg-surface-2 border border-border space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Strategic Statutory Accreditations & Regulatory Unlock Actions
              </div>

              <div className="compliance-grid grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="compliance-item p-3 rounded-lg bg-surface border border-border space-y-1">
                  <strong className="text-xs font-bold text-accent uppercase">1. DPIIT Recognition</strong>
                  <p className="text-xs text-muted leading-relaxed">
                    {profile.dpiitRegistered 
                      ? "Active. File for Section 80-IAC (3-year 100% corporate income tax holiday via Startup India)." 
                      : "File on startupindia.gov.in (free, 48 hours). Unlocks SISFS ₹70L seed fund and CGSS debt guarantees."}
                  </p>
                </div>

                <div className="compliance-item p-3 rounded-lg bg-surface border border-border space-y-1">
                  <strong className="text-xs font-bold text-accent uppercase">2. State Innovation Mission</strong>
                  <p className="text-xs text-muted leading-relaxed">
                    Enroll with the {profile.state} Startup Mission to unlock localized non-dilutive grant calls, co-working subsidies, and state procurement quotas.
                  </p>
                </div>

                <div className="compliance-item p-3 rounded-lg bg-surface border border-border space-y-1">
                  <strong className="text-xs font-bold text-accent uppercase">3. SIPP IPR & Patent Rebate</strong>
                  <p className="text-xs text-muted leading-relaxed">
                    Claim 80% statutory fee waiver on patent filings and 50% on trademark registrations via empanelled SIPP facilitators.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Document Footer & Gazette Grounding Notice */}
            <div className="footer-dossier pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted">
              <div>
                <strong>GOV-DASH INDIA</strong> • National Startup Policy & Scheme Intelligence Platform
              </div>
              <div className="font-mono text-xs">
                193 Central & 28 State Missions • Powered by Verified Public Gazette Grounding
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted">
            Tip: Select <strong>"Save as PDF"</strong> in your browser print prompt for a publication-ready document.
          </span>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
