"use client";

import React from "react";
import { 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  ArrowRight, 
  Unlock, 
  CheckCircle2, 
  SlidersHorizontal,
  Building2, 
  Layers, 
  HelpCircle, 
  FileText, 
  Info 
} from "lucide-react";
import { FounderProfile, RecommendationMatch, UnlockInsights } from "@/types";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { ResourceStatus } from "@/hooks/useAppData";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface Props {
  profile: FounderProfile;
  recommendations: RecommendationMatch[];
  unlockable: RecommendationMatch[];
  unlockInsights: UnlockInsights;
  totalSchemesCount: number;
  loading: boolean;
  recommendationsStatus?: ResourceStatus;
  recommendationsError?: string | null;
  onRetryRecommendations?: () => void;
  onSelectScheme: (scheme: any) => void;
  onOpenProfileModal: () => void;
  onOpenOnePagerModal: () => void;
  onOpenComplianceModal: () => void;
  onNavigate: (tab: any) => void;
  onBuildRoadmap?: () => void;
  onOpenTour?: () => void;
}

export function OverviewView({
  profile,
  recommendations,
  unlockable,
  unlockInsights,
  totalSchemesCount,
  loading,
  recommendationsStatus,
  recommendationsError,
  onRetryRecommendations,
  onSelectScheme,
  onOpenProfileModal,
  onOpenOnePagerModal,
  onOpenComplianceModal,
  onNavigate,
  onBuildRoadmap,
  onOpenTour,
}: Props) {
  const isRecLoading = loading || recommendationsStatus === "loading";
  const isRecError = recommendationsStatus === "error";
  const topMatches = recommendations.slice(0, 6);

  // Compute total capital available in direct matches
  const totalDirectCapital = topMatches.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0);
  const directCapitalDisplay = totalDirectCapital >= 10000000
    ? `₹${(totalDirectCapital / 10000000).toFixed(2)} Cr`
    : `₹${(totalDirectCapital / 100000).toFixed(1)} Lakhs`;

  return (
    <div className="space-y-8 animate-fadeIn text-text">
      {/* ── 1. Hero Section: Clean Power BI card, No gradient, No blur ── */}
      <Card className="p-6 sm:p-8 bg-surface-2 border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Chip variant="info" size="sm">
                GOV-DASH INDIA 🇮🇳
              </Chip>
              <span className="text-xs text-muted">
                193 Schemes • 132 Ministries • 28 States
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text tracking-tight font-headline leading-tight">
              Personalised Government Scheme Roadmaps for Indian Innovators
            </h1>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Stop searching through 193 complex government portals. Get a custom step-by-step action roadmap with verified grants up to ₹10 Crore, deadlines, and required document checklists in under 2 minutes.
            </p>

            {/* 3-Step "How It Works" Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <span>Profile your startup (2 mins)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-unlock/15 text-unlock font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <span>Get 3-Phase Action Roadmap</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-text flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ok/15 text-ok font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <span>Unlock Non-Dilutive Capital</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <Button
              variant="primary"
              onClick={onBuildRoadmap || (() => onNavigate("roadmap"))}
              className="py-3 px-5 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Build My Action Roadmap</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {onOpenTour && (
              <Button
                variant="secondary"
                onClick={onOpenTour}
              >
                <HelpCircle className="w-3.5 h-3.5 mr-2 text-accent" />
                <span>Take 60-Second Platform Tour</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Active Targeting Sub-Bar ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted font-medium">Active Targeting:</span>
          <Chip variant="info" size="sm">
            🌾 {profile.sector}
          </Chip>
          <Chip variant="met" size="sm">
            🚀 {profile.stage}
          </Chip>
          <Chip variant="warn" size="sm">
            📍 {profile.state}
          </Chip>
          {profile.dpiitRegistered ? (
            <Chip variant="met" size="sm">
              DPIIT Registered ✓
            </Chip>
          ) : (
            <Chip variant="neutral" size="sm">
              Non-DPIIT
            </Chip>
          )}
          <Button
            variant="ghost"
            onClick={onOpenProfileModal}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-accent" />
            Switch Domain
          </Button>
          <Button
            variant="secondary"
            onClick={onOpenComplianceModal}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-ok" />
            {profile.state} State Guide
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onOpenOnePagerModal}
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-accent" />
            One-Pager Brief
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate("schemes")}
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-muted" />
            All {totalSchemesCount || 193} Schemes
          </Button>
        </div>
      </div>

      {/* ── Metric KPI Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Qualified Matches */}
        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Direct Qualified Matches</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {isRecLoading && recommendations.length === 0 ? (
              <span className="inline-block w-12 h-7 bg-surface-2 rounded animate-pulse" />
            ) : (
              recommendations.length
            )}
          </div>
          <div className="text-xs text-ok flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Direct profile matches
          </div>
        </Card>

        {/* Metric 2: Max Capital Accessible */}
        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Max Capital Available</span>
            <Coins className="w-4 h-4 text-ok" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ok font-headline">
            {isRecLoading && recommendations.length === 0 ? (
              <span className="inline-block w-20 h-7 bg-surface-2 rounded animate-pulse" />
            ) : (
              directCapitalDisplay
            )}
          </div>
          <div className="text-xs text-muted">
            Across top targeted funding programs
          </div>
        </Card>

        {/* Metric 3: Unlock Potential */}
        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>DPIIT Unlock Potential</span>
            <Unlock className="w-4 h-4 text-unlock" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-unlock font-headline">
            +{unlockInsights?.dpiit_unlock_count ?? unlockable.length}
          </div>
          <div className="text-xs text-muted font-medium">
            Additional schemes unlocked with DPIIT
          </div>
        </Card>

        {/* Metric 4: Total Monitored */}
        <Card className="p-4 sm:p-5 bg-surface border-border space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-semibold">
            <span>Total Verified Schemes</span>
            <Building2 className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-text font-headline">
            {totalSchemesCount || 193}
          </div>
          <div className="text-xs text-muted">
            Across 132 Ministries & 28 States
          </div>
        </Card>
      </div>

      {/* ── Explanation Banner: WHAT IS STRATEGIC SIMULATOR? ──────────── */}
      <Card className="p-5 bg-surface-2 border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-accent text-accent-contrast shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text">
                What is the Strategic / Policy Unlock Simulator?
              </h3>
              <Chip variant="info" size="sm">
                Optimization Engine
              </Chip>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-3xl">
              Rather than just listing schemes you currently qualify for, the <strong className="text-text">Unlock Simulator</strong> calculates what <em className="text-text">latent government capital</em> is locked behind 1 or 2 missing administrative milestones (such as DPIIT Recognition, Private Limited Incorporation, or Patent filing). It displays the exact financial ROI, estimated turnaround time (2–5 days), and direct portal links to unlock those funds.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => onNavigate("unlock")}
          className="shrink-0"
        >
          <Unlock className="w-3.5 h-3.5 mr-1" />
          Launch Simulator
        </Button>
      </Card>

      {/* ── Top Recommended Schemes Section ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Highest Rated Schemes for Your Venture
            </h2>
            <p className="text-xs text-muted">
              Ranked using hybrid rule-fit validation, sector taxonomy alignment, and stage eligibility.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => onNavigate("schemes")}
          >
            View all {recommendations.length} matches <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {isRecLoading && topMatches.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-5 border-border bg-surface space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        ) : isRecError && topMatches.length === 0 ? (
          <ErrorState
            title="Unable to Load Recommendations"
            message={recommendationsError || "Failed to fetch matching schemes."}
            onRetry={onRetryRecommendations}
            retryText="Retry Matching"
          />
        ) : topMatches.length === 0 ? (
          <EmptyState
            title="No strict matches for this configuration"
            message="Try broadening your startup stage or sector targeting."
            action={{
              label: "Adjust Profile Targeting",
              onClick: onOpenProfileModal
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((scheme, idx) => {
              const details = formatSchemeGrantDetails(scheme);
              const score = scheme.match_score || 85;
              const confidence = scheme.confidence_score || 96;
              const isHigh = score >= 80;
              const isMid = score >= 50 && score < 80;

              return (
                <Card
                  key={scheme.id || idx}
                  onClick={() => onSelectScheme(scheme)}
                  className="group relative p-5 border-border bg-surface hover:border-accent transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Match Score & Grant Type Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Chip
                        variant={isHigh ? "met" : isMid ? "warn" : "info"}
                        size="sm"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {score}% Match ({confidence}% Conf)
                      </Chip>
                      <Chip variant="info" size="sm">
                        {details.grantTypeBadge}
                      </Chip>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-accent transition-colors line-clamp-2 mb-1">
                      {scheme.name || (scheme as any).scheme_name}
                    </h3>

                    {/* Ministry / Agency */}
                    <p className="text-xs text-muted line-clamp-1 mb-3">
                      {scheme.ministry || "Central Ministry / State Agency"}
                    </p>

                    {/* Funding Breakdown */}
                    <div className="p-3 rounded-lg bg-surface-2 border border-border mb-3 space-y-1">
                      <div className="text-xs uppercase font-semibold text-muted">
                        Individual Startup Grant
                      </div>
                      <div className="text-sm font-bold text-ok font-headline leading-tight">
                        {details.individualTicket}
                      </div>
                      {details.macroCeilingDisplay && (
                        <div className="text-xs text-muted pt-1 border-t border-border">
                          {details.macroCeilingDisplay}
                        </div>
                      )}
                    </div>

                    {/* Reasons Why You Match */}
                    <div className="space-y-1.5 mb-4">
                      {((scheme.reasons || [scheme.reason || "Direct rule-fit match"]).filter(Boolean) as string[]).slice(0, 2).map((r: string, rIdx: number) => (
                        <div key={rIdx} className="flex items-start gap-1.5 text-xs text-muted">
                          <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Geography & CTA */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1 font-medium">
                      📍 {scheme.geographic_restriction || "Pan-India"}
                    </span>
                    <span className="font-semibold text-accent group-hover:underline flex items-center gap-1">
                      View Dossier <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Unlock Simulator Callout Banner ──────────────────────────── */}
      <Card className="p-5 sm:p-6 bg-surface-2 border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-unlock/10 text-unlock border border-unlock/20 flex items-center justify-center shrink-0">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-unlock">
                Strategic Opportunity Radar
              </span>
              <Chip variant="unlock" size="sm">
                Interactive ROI
              </Chip>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text mt-0.5">
              Unlock up to 14 additional central schemes worth ₹1.85 Cr
            </h3>
            <p className="text-xs text-muted max-w-xl mt-1 leading-relaxed">
              {profile.dpiitRegistered 
                ? "Your DPIIT status already qualifies you for top tier central venture and credit guarantee programs. Simulate legal entity or state adjustments to view further incentives."
                : "Your startup is currently missing DPIIT Recognition. Applying online on startupindia.gov.in takes ~48 hours (100% free) and unlocks SISFS, CGSS, and 80-IAC tax exemptions."}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => onNavigate("unlock")}
          className="shrink-0"
        >
          <Unlock className="w-4 h-4 mr-1.5" />
          Run Unlock Simulator
        </Button>
      </Card>
    </div>
  );
}
