"use client";

import React, { useMemo } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  FileText, 
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";

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
  // Analysis & Strategic Verdict Computation
  const analysis = useMemo(() => {
    if (!isOpen || schemes.length < 2) return null;
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
  }, [isOpen, schemes, userProfile]);

  if (!isOpen || schemes.length < 2 || !analysis) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comparative Scheme Evaluation"
      subtitle={`Head-to-head analysis comparing ${schemes.length} schemes side-by-side.`}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6 text-text">
        {/* ── 1. Smart Head-to-Head Recommendation Card ─────────────── */}
        <Card className="p-4 sm:p-5 bg-surface-2 border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-xs">
              <Sparkles className="w-4 h-4" />
              Strategic Decision Matrix & Verdict
            </div>
            <Chip variant="met" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Profile-Optimized Match
            </Chip>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-text font-headline">
            Recommended Choice for {userProfile.startupName || "Your Venture"}: {analysis.bestFit.scheme_name}
          </h3>

          {/* Head-to-Head Persona Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <Card className="p-3.5 bg-surface border-border space-y-1.5">
              <div className="flex items-center justify-between font-bold text-text text-xs">
                <span className="truncate">{analysis.s1.scheme_name}</span>
                <Chip variant="info" size="sm">Option A</Chip>
              </div>
              <div className="text-xs font-semibold text-ok">
                {analysis.d1.individualTicket}
              </div>
              <div className="text-xs text-muted">
                <strong className="text-text">Who should choose this:</strong> {analysis.d1.whoShouldOpt}
              </div>
            </Card>

            <Card className="p-3.5 bg-surface border-border space-y-1.5">
              <div className="flex items-center justify-between font-bold text-text text-xs">
                <span className="truncate">{analysis.s2.scheme_name}</span>
                <Chip variant="unlock" size="sm">Option B</Chip>
              </div>
              <div className="text-xs font-semibold text-ok">
                {analysis.d2.individualTicket}
              </div>
              <div className="text-xs text-muted">
                <strong className="text-text">Who should choose this:</strong> {analysis.d2.whoShouldOpt}
              </div>
            </Card>
          </div>
        </Card>

        {/* ── 2. Side-by-Side Parameter Matrix ───────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-2 border-b border-border">
                  <th className="py-3 px-4 w-48 font-semibold text-muted uppercase tracking-wider text-xs">
                    Dimension
                  </th>
                  {schemes.map((s, idx) => {
                    const isBestFit = s.id === analysis.bestFit.id;
                    return (
                      <th 
                        key={s.id || idx} 
                        className={`py-3 px-4 text-left ${
                          isBestFit ? "bg-accent/10 border-l border-r border-accent/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-surface-2 text-text font-bold text-xs flex items-center justify-center border border-border">
                            {idx + 1}
                          </span>
                          {isBestFit && (
                            <Chip variant="met" size="sm">
                              Best Fit
                            </Chip>
                          )}
                        </div>
                        <div className="font-bold text-xs sm:text-sm text-text line-clamp-2">
                          {s.scheme_name}
                        </div>
                        <div className="text-xs font-normal text-muted line-clamp-1 mt-0.5">
                          {s.ministry || "Government Department"}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {/* Parameter 1: Individual Startup Grant */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-ok" />
                    Individual Grant
                  </td>
                  {schemes.map((s, idx) => {
                    const d = analysis.details[idx].formatted;
                    return (
                      <td key={idx} className="py-3 px-4">
                        <div className="font-bold text-xs text-ok font-headline">
                          {d.individualTicket}
                        </div>
                        {d.macroCeilingDisplay && (
                          <div className="text-xs text-muted mt-0.5">
                            {d.macroCeilingDisplay}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Parameter 2: Grant Instrument */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text">
                    Grant Structure
                  </td>
                  {schemes.map((s, idx) => {
                    const d = analysis.details[idx].formatted;
                    return (
                      <td key={idx} className="py-3 px-4">
                        <Chip variant="info" size="sm">{d.grantTypeBadge}</Chip>
                      </td>
                    );
                  })}
                </tr>

                {/* Parameter 3: Who Should Opt */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-accent" />
                    Who Should Opt
                  </td>
                  {schemes.map((s, idx) => {
                    const d = analysis.details[idx].formatted;
                    return (
                      <td key={idx} className="py-3 px-4 text-muted leading-relaxed">
                        {d.whoShouldOpt}
                      </td>
                    );
                  })}
                </tr>

                {/* Parameter 4: When to Choose */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-ok flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    When to Choose
                  </td>
                  {schemes.map((s, idx) => {
                    const d = analysis.details[idx].formatted;
                    return (
                      <td key={idx} className="py-3 px-4 text-muted">
                        {d.whenToChoose}
                      </td>
                    );
                  })}
                </tr>

                {/* Parameter 5: When to Avoid */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-danger flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    When to Avoid
                  </td>
                  {schemes.map((s, idx) => {
                    const d = analysis.details[idx].formatted;
                    return (
                      <td key={idx} className="py-3 px-4 text-muted">
                        {d.whenToAvoid}
                      </td>
                    );
                  })}
                </tr>

                {/* Parameter 6: Dilution */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text">
                    Equity Terms
                  </td>
                  {schemes.map((s, idx) => {
                    const d = analysis.details[idx].formatted;
                    return (
                      <td key={idx} className="py-3 px-4 text-muted">
                        {d.dilutionTerms}
                      </td>
                    );
                  })}
                </tr>

                {/* Parameter 7: Target Stage */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text">
                    Target Stage
                  </td>
                  {schemes.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-muted">
                      {Array.isArray(s.startup_stage) ? s.startup_stage.join(", ") : s.startup_stage || "All Stages"}
                    </td>
                  ))}
                </tr>

                {/* Parameter 8: DPIIT */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text">
                    DPIIT Required
                  </td>
                  {schemes.map((s, idx) => (
                    <td key={idx} className="py-3 px-4">
                      {s.dpiit_required ? (
                        <Chip variant="warn" size="sm">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Mandatory
                        </Chip>
                      ) : (
                        <Chip variant="met" size="sm">Open</Chip>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Parameter 9: Processing Timeline */}
                <tr className="hover:bg-surface-2/60">
                  <td className="py-3 px-4 font-semibold text-text">
                    Processing Cycle
                  </td>
                  {schemes.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-muted flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {s.processing_timeline || "30 to 60 days"}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr className="bg-surface-2">
                  <td className="py-3 px-4 font-semibold text-text">
                    Actions
                  </td>
                  {schemes.map((s, idx) => (
                    <td key={idx} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            onClose();
                            onSelectScheme(s);
                          }}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          <span>Dossier</span>
                        </Button>
                        {s.source_url && (
                          <a
                            href={s.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-3 py-2 rounded-lg bg-accent text-accent-contrast text-xs font-semibold inline-flex items-center gap-1 hover:opacity-90 transition-opacity"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
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

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted">
            Evaluating against: <strong className="text-text">{userProfile.startupName || "Startup"}</strong> ({userProfile.sector} • {userProfile.stage})
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
}
