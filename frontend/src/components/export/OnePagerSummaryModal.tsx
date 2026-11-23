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
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { FounderProfile, RecommendationMatch, PersonalizedRoadmap, RoadmapStep } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { formatInrCapital } from "@/lib/roadmapEngine";

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

  // Ensure at least top 5 matches
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

  // Determine Next Best Action
  const nextActionTitle = profile.dpiitRegistered
    ? "Apply for Section 80-IAC 3-Year Income Tax Holiday"
    : "Acquire DPIIT Startup Recognition (Free, 48 Hours)";
  const nextActionDesc = profile.dpiitRegistered
    ? "DPIIT recognition is active. Filing for 80-IAC provides 100% corporate tax relief for 3 consecutive financial years and fast-tracks SISFS incubator commercialization support."
    : "Register on startupindia.gov.in using your MCA Certificate of Incorporation to unlock ₹70L SISFS seed funds, 80-IAC tax exemptions, and CGSS debt guarantees.";

  // ── 1. Isolated High-Fidelity Print Engine ──────────────────────────────────
  const handlePrint = () => {
    const printEl = document.getElementById("printable-executive-dossier");
    if (!printEl) {
      window.print();
      return;
    }

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
        margin: 10mm 14mm;
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
        font-size: 10.5px;
        line-height: 1.4;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .dossier-page {
        min-height: 270mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .header-dossier {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 10px;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .brand-title {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #0f172a;
        margin: 0;
      }
      .sub-title {
        font-size: 9.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #1d4ed8;
        margin-top: 2px;
      }
      .tagline {
        font-size: 9.5px;
        color: #475569;
        margin-top: 3px;
      }
      .badge-verified {
        display: inline-block;
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 8.5px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .profile-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 9px 12px;
        margin-bottom: 12px;
      }
      .profile-item span {
        display: block;
        font-size: 8.5px;
        font-weight: 700;
        text-transform: uppercase;
        color: #64748b;
      }
      .profile-item strong {
        font-size: 11.5px;
        color: #0f172a;
      }
      .section-heading {
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #0f172a;
        border-bottom: 1.5px solid #cbd5e1;
        padding-bottom: 4px;
        margin: 10px 0 6px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9.5px;
        margin-bottom: 10px;
      }
      th {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 5px 7px;
        text-align: left;
        font-size: 8.5px;
        font-weight: 700;
        text-transform: uppercase;
        color: #475569;
      }
      td {
        border: 1px solid #e2e8f0;
        padding: 5px 7px;
        vertical-align: top;
      }
      tr:nth-child(even) { background: #fafafa; }
      .pill {
        display: inline-block;
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 8.5px;
        font-weight: 700;
        white-space: nowrap;
      }
      .pill-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .pill-met { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
      .pill-neutral { background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; }
      .highlight-box {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .highlight-box strong {
        color: #0369a1;
        font-size: 10px;
        text-transform: uppercase;
        display: block;
        margin-bottom: 2px;
      }
      .highlight-box p {
        font-size: 9px;
        color: #0c4a6e;
        line-height: 1.35;
      }
      .compliance-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 4px;
      }
      .compliance-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 5px;
        padding: 7px 9px;
      }
      .compliance-item strong {
        display: block;
        font-size: 9.5px;
        color: #1d4ed8;
        margin-bottom: 2px;
      }
      .compliance-item p {
        font-size: 8.5px;
        color: #475569;
        line-height: 1.3;
      }
      .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
        margin-bottom: 10px;
      }
      .roadmap-col {
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: #ffffff;
        padding: 7px 9px;
      }
      .roadmap-col-header {
        border-bottom: 1.5px solid #e2e8f0;
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      .roadmap-col-title {
        font-size: 9.5px;
        font-weight: 700;
        color: #1d4ed8;
        text-transform: uppercase;
      }
      .roadmap-col-time {
        font-size: 8px;
        color: #64748b;
      }
      .step-item {
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1px dashed #e2e8f0;
      }
      .step-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 2px;
      }
      .step-name {
        font-weight: 700;
        font-size: 9.5px;
        color: #0f172a;
        line-height: 1.25;
        flex: 1;
      }
      .step-funding {
        font-weight: 700;
        color: #166534;
        font-size: 8.5px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        padding: 1px 4px;
        border-radius: 3px;
        white-space: nowrap;
      }
      .step-sub {
        font-size: 8px;
        color: #64748b;
        margin-bottom: 2px;
      }
      .step-action {
        font-size: 8.5px;
        color: #334155;
        line-height: 1.3;
      }
      .checklist-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 5px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .checklist-item {
        font-size: 8.5px;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .checklist-item span {
        color: #166534;
        font-weight: bold;
      }
      .footer-dossier {
        border-top: 1px solid #cbd5e1;
        padding-top: 6px;
        font-size: 8px;
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

  // ── 2. Download Self-Contained Standalone HTML Dossier ───────────────────────
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
      max-width: 920px;
      margin: 20px auto;
      padding: 30px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.45;
      color: #0f172a;
      background: #ffffff;
    }
    .header-dossier { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
    .sub-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #1d4ed8; letter-spacing: 0.08em; }
    .tagline { font-size: 10px; color: #475569; margin-top: 2px; }
    .profile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; }
    .profile-item span { display: block; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .profile-item strong { font-size: 12px; color: #0f172a; }
    .section-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin: 12px 0 8px 0; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #475569; }
    td { border: 1px solid #e2e8f0; padding: 6px 8px; vertical-align: top; }
    tr:nth-child(even) { background: #fafafa; }
    .pill { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 9px; font-weight: 700; }
    .pill-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .pill-met { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .pill-neutral { background: #f8fafc; color: #334155; border: 1px solid #e2e8f0; }
    .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 9px 12px; margin-bottom: 14px; }
    .compliance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 6px; }
    .compliance-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 8px 10px; }
    .compliance-item strong { display: block; font-size: 10px; color: #1d4ed8; margin-bottom: 2px; }
    .roadmap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .roadmap-col { border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; padding: 8px 10px; }
    .step-item { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; }
    .step-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 2px; }
    .step-name { font-weight: 700; font-size: 10px; color: #0f172a; }
    .step-funding { font-weight: 700; color: #166534; font-size: 9px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1px 4px; border-radius: 3px; white-space: nowrap; }
    .checklist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 8px 10px; margin-bottom: 14px; }
    .footer-dossier { border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 8.5px; color: #64748b; display: flex; justify-content: space-between; }
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
      const matchPct = s.match_score ?? s.eligibility_score ?? 85;
      const maxCapDisplay = s.max_funding_display || formatInrCapital(s.max_funding_amount) || "Variable";
      lines.push(`${idx + 1}. ${s.name.toUpperCase()}`);
      lines.push(`   - Sponsoring Body: ${s.ministry || "Government Department"}`);
      lines.push(`   - Instrument: ${s.funding_type || "Non-Dilutive Grant"}`);
      lines.push(`   - Maximum Ticket: ${maxCapDisplay}`);
      lines.push(`   - Match Score: ${matchPct}%`);
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
    lines.push(profile.dpiitRegistered 
      ? "1. Section 80-IAC: Apply for 3-year consecutive corporate tax holiday via Startup India portal."
      : "1. DPIIT Recognition: Apply on startupindia.gov.in (free, 48 hours) to unlock SISFS & CGSS.");
    lines.push(`2. State Mission: Enroll on ${profile.state} Startup Mission portal for localized grants.`);
    lines.push("3. SIPP: Claim 80% statutory fee waiver on patent filings.");
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
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <div 
            id="printable-executive-dossier"
            ref={dossierRef}
            className="p-6 sm:p-8 bg-surface border border-border rounded-xl space-y-6 shadow-xs text-text transition-colors"
          >
            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* PAGE 1: EXECUTIVE BRIEFING & QUALIFIED SCHEMES DOSSIER           */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="dossier-page page-break space-y-4">
              <div>
                {/* 1. Official Header */}
                <div className="header-dossier flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-border pb-4">
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
                    <p className="tagline text-xs text-muted mt-1">
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
                <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                  <span>Venture Architecture & Eligibility Profile</span>
                  <span className="text-xs text-muted font-normal lowercase">rule-fit evaluation profile</span>
                </div>

                <div className="profile-grid grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-2 border border-border text-xs mb-3">
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

                {/* 3. Executive Next Best Action Callout */}
                <div className="highlight-box p-3 rounded-lg bg-accent/5 border border-accent/20 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <strong className="text-xs font-bold text-accent uppercase block">
                        Executive Next Action: {nextActionTitle}
                      </strong>
                      <p className="text-xs text-text mt-0.5 leading-relaxed">
                        {nextActionDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Priority Scheme Matches Table */}
                <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-accent" />
                    Top 5 Matched Central & State Government Schemes
                  </span>
                  <span className="text-xs text-muted font-normal">Ranked by eligibility qualification fit</span>
                </div>

                <div className="border border-border rounded-lg overflow-hidden bg-surface mb-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
                      <tr>
                        <th className="py-2 px-2.5 w-7 text-center">#</th>
                        <th className="py-2 px-2.5">Scheme & Sponsoring Ministry</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Funding Instrument</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Max Funding Cap</th>
                        <th className="py-2 px-2.5 whitespace-nowrap text-center">Match</th>
                        <th className="py-2 px-2.5">Qualification Rationale & Key Prerequisites</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {topMatches.map((scheme, idx) => {
                        const matchPct = scheme.match_score ?? scheme.eligibility_score ?? 88;
                        const maxCapDisplay = scheme.max_funding_display || formatInrCapital(scheme.max_funding_amount) || "Variable Cap";
                        return (
                          <tr key={scheme.id || idx} className="hover:bg-surface-2/40 transition-colors">
                            <td className="py-2 px-2.5 font-bold text-muted text-center">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-2.5">
                              <div className="font-bold text-text">
                                {scheme.name}
                              </div>
                              <div className="text-xs text-muted">
                                {scheme.ministry || "Central Ministry / State Mission"}
                              </div>
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <span className="pill pill-neutral">
                                {scheme.funding_type || "Capital Grant"}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 font-bold text-ok whitespace-nowrap">
                              {maxCapDisplay}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap text-center">
                              <span className="pill pill-info font-mono">
                                {matchPct}%
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-muted leading-tight">
                              {(scheme.reasons || [scheme.reason]).slice(0, 2).join("; ")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 5. Strategic Accreditations Pathway */}
                <div className="compliance-box p-3 rounded-lg bg-surface-2 border border-border">
                  <div className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    Regulatory Accreditations & Statutory Concessions
                  </div>

                  <div className="compliance-grid grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="compliance-item p-2.5 rounded bg-surface border border-border">
                      <strong className="text-xs font-bold text-accent uppercase block">1. DPIIT & 80-IAC</strong>
                      <p className="text-xs text-muted leading-tight mt-0.5">
                        {profile.dpiitRegistered 
                          ? "DPIIT Verified ✓. File for Section 80-IAC (3-year 100% corporate tax holiday via Startup India)." 
                          : "File on startupindia.gov.in (free, 48 hours). Unlocks SISFS ₹70L seed fund and CGSS debt guarantees."}
                      </p>
                    </div>

                    <div className="compliance-item p-2.5 rounded bg-surface border border-border">
                      <strong className="text-xs font-bold text-accent uppercase block">2. State Mission Sync</strong>
                      <p className="text-xs text-muted leading-tight mt-0.5">
                        {profile.state && profile.state.toLowerCase() !== "pan-india"
                          ? `Enroll on ${profile.state} Startup Mission to access localized seed grants, lease subsidies, and state procurement quotas.`
                          : "Enroll on your registered state's Startup Mission portal for localized grants, incubator seats, and lease subsidies."}
                      </p>
                    </div>

                    <div className="compliance-item p-2.5 rounded bg-surface border border-border">
                      <strong className="text-xs font-bold text-accent uppercase block">3. SIPP Patent Waiver</strong>
                      <p className="text-xs text-muted leading-tight mt-0.5">
                        Claim 80% statutory fee waiver on patent filings and 50% on trademark registration through empanelled facilitators.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 1 Footer */}
              <div className="footer-dossier pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
                <div>
                  <strong>GOV-DASH INDIA</strong> • National Startup Scheme Intelligence Platform
                </div>
                <div className="font-mono text-xs">
                  Page 1 of 2 • Executive Dossier Summary
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* PAGE 2: SEQUENTIAL ACTION ROADMAP & COMPLIANCE BLUEPRINT         */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            <div className="dossier-page space-y-4 pt-4 sm:pt-0">
              <div>
                {/* Page 2 Header */}
                <div className="header-dossier flex items-center justify-between border-b-2 border-border pb-3 mb-3">
                  <div>
                    <h2 className="brand-title text-base font-bold text-text">
                      GOV-DASH INDIA • SEQUENTIAL ACTION ROADMAP
                    </h2>
                    <div className="sub-title text-xs font-bold text-accent uppercase tracking-wider">
                      Targeted Capital Milestones for {profile.startupName || "Innovative Enterprise"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted font-mono">
                    Ref: {profile.startupName ? profile.startupName.toUpperCase().replace(/\s+/g, "-") : "FOUNDER"}-ROADMAP
                  </div>
                </div>

                {/* Section Title */}
                <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    3-Phase Execution Blueprint: Grants, Seed & Debt Guarantees
                  </span>
                  <span className="text-xs text-muted font-normal">Sequenced by maturity and capital timeline</span>
                </div>

                {/* Roadmap 3 Columns */}
                <div className="roadmap-grid grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  {/* Phase 1: Validation */}
                  <div className="roadmap-col border border-border rounded-lg bg-surface-2 p-3 space-y-2">
                    <div className="roadmap-col-header pb-1.5 border-b border-border flex items-center justify-between">
                      <div>
                        <div className="roadmap-col-title text-xs font-bold text-accent uppercase">
                          Phase 1: Validation
                        </div>
                        <div className="roadmap-col-time text-xs text-muted">
                          Months 0 - 6 • PoC & Prototyping
                        </div>
                      </div>
                      <span className="pill pill-info text-xs">
                        {nowSteps.length} Steps
                      </span>
                    </div>

                    <div className="space-y-2">
                      {nowSteps.length > 0 ? (
                        nowSteps.map((step) => (
                          <div key={step.id} className="step-item p-2 rounded bg-surface border border-border text-xs space-y-1">
                            <div className="step-header">
                              <span className="step-name font-bold text-text">{step.title}</span>
                              <span className="step-funding">{step.fundingDisplay}</span>
                            </div>
                            <div className="step-sub text-xs text-muted">{step.schemeName}</div>
                            <div className="step-action text-xs text-muted leading-tight">{step.whyItMatters}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted italic p-2">Foundation verified. Proceeding to commercialization calls.</div>
                      )}
                    </div>
                  </div>

                  {/* Phase 2: Commercial Scale */}
                  <div className="roadmap-col border border-border rounded-lg bg-surface-2 p-3 space-y-2">
                    <div className="roadmap-col-header pb-1.5 border-b border-border flex items-center justify-between">
                      <div>
                        <div className="roadmap-col-title text-xs font-bold text-accent uppercase">
                          Phase 2: Commercial Scale
                        </div>
                        <div className="roadmap-col-time text-xs text-muted">
                          Months 6 - 18 • Seed & Incubator Capital
                        </div>
                      </div>
                      <span className="pill pill-info text-xs">
                        {nextSteps.length} Steps
                      </span>
                    </div>

                    <div className="space-y-2">
                      {nextSteps.length > 0 ? (
                        nextSteps.map((step) => (
                          <div key={step.id} className="step-item p-2 rounded bg-surface border border-border text-xs space-y-1">
                            <div className="step-header">
                              <span className="step-name font-bold text-text">{step.title}</span>
                              <span className="step-funding">{step.fundingDisplay}</span>
                            </div>
                            <div className="step-sub text-xs text-muted">{step.schemeName}</div>
                            <div className="step-action text-xs text-muted leading-tight">{step.whyItMatters}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted italic p-2">Seed targets mapped under state mission.</div>
                      )}
                    </div>
                  </div>

                  {/* Phase 3: Scale Debt & Guarantees */}
                  <div className="roadmap-col border border-border rounded-lg bg-surface-2 p-3 space-y-2">
                    <div className="roadmap-col-header pb-1.5 border-b border-border flex items-center justify-between">
                      <div>
                        <div className="roadmap-col-title text-xs font-bold text-accent uppercase">
                          Phase 3: Scale Debt
                        </div>
                        <div className="roadmap-col-time text-xs text-muted">
                          Months 18 - 36 • Credit Guarantees
                        </div>
                      </div>
                      <span className="pill pill-met text-xs">
                        {laterSteps.length} Steps
                      </span>
                    </div>

                    <div className="space-y-2">
                      {laterSteps.length > 0 ? (
                        laterSteps.map((step) => (
                          <div key={step.id} className="step-item p-2 rounded bg-surface border border-border text-xs space-y-1">
                            <div className="step-header">
                              <span className="step-name font-bold text-text">{step.title}</span>
                              <span className="step-funding">{step.fundingDisplay}</span>
                            </div>
                            <div className="step-sub text-xs text-muted">{step.schemeName}</div>
                            <div className="step-action text-xs text-muted leading-tight">{step.whyItMatters}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted italic p-2">Scale-up facilities mapped under CGSS & SIDBI.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mandatory Documentation Checklist for Application Readiness */}
                <div className="section-heading text-xs font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-accent" />
                    Essential Documentation Checklist for Grant & Guarantee Filings
                  </span>
                  <span className="text-xs text-muted font-normal">Pre-requisite dossier attachments</span>
                </div>

                <div className="checklist-grid grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-surface-2 border border-border text-xs mb-3">
                  <div className="checklist-item flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                    <span>DPIIT Startup Recognition Certificate & Form-1 Application</span>
                  </div>
                  <div className="checklist-item flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                    <span>Certificate of Incorporation (CIN / MCA) & Memorandum of Association</span>
                  </div>
                  <div className="checklist-item flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                    <span>5-10 Slide Investor/Grant Pitch Deck with Technical Architecture & Demo URL</span>
                  </div>
                  <div className="checklist-item flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                    <span>Provisional Patent Application Receipt / IPR Trademark Filing Documents</span>
                  </div>
                  <div className="checklist-item flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                    <span>Active Corporate Current Account Statements (Last 6 Months / Cancelled Cheque)</span>
                  </div>
                  <div className="checklist-item flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                    <span>Audited Financial Statements or CA Certified Provisional Balance Sheet</span>
                  </div>
                </div>
              </div>

              {/* Page 2 Footer */}
              <div className="footer-dossier pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
                <div>
                  <strong>GOV-DASH INDIA</strong> • Powered by Verified Public Gazette Grounding
                </div>
                <div className="font-mono text-xs">
                  Page 2 of 2 • Official Execution Blueprint
                </div>
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
