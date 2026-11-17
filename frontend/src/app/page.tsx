"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { SchemesExplorerView } from "@/components/schemes/SchemesExplorerView";
import { SchemeDetailModal } from "@/components/schemes/SchemeDetailModal";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { SuccessStoriesView } from "@/components/stories/SuccessStoriesView";
import { CopilotDrawer } from "@/components/copilot/CopilotDrawer";
import { FounderProfileModal } from "@/components/profile/FounderProfileModal";
import { UnlockSimulatorModal } from "@/components/unlock/UnlockSimulatorModal";
import { StateComplianceGuideModal } from "@/components/compliance/StateComplianceGuideModal";
import { OnePagerSummaryModal } from "@/components/export/OnePagerSummaryModal";
import { FounderProfile, Scheme, RecommendationMatch, AnalyticsBundle, UnlockInsights } from "@/types";

const DEFAULT_PROFILE: FounderProfile = {
  startupName: "AgriSense",
  sector: "AgriTech",
  stage: "Idea",
  state: "Karnataka",
  dpiitRegistered: false,
  womenLed: false,
  entityType: "unregistered_idea"
};

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  
  // Profile State
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Modals & Drawers
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showOnePagerModal, setShowOnePagerModal] = useState(false);

  // Data States
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationMatch[]>([]);
  const [unlockable, setUnlockable] = useState<RecommendationMatch[]>([]);
  const [unlockInsights, setUnlockInsights] = useState<UnlockInsights>({
    dpiit_unlock_count: 14,
    dpiit_unlock_value_inr: 18500000,
    dpiit_unlock_value_display: "₹1.85 Cr",
    top_unlock_action: "Apply for DPIIT Recognition (48 hours, free online)"
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );

  // 1. Initialize Profile from Storage or Auth
  useEffect(() => {
    setMounted(true);

    const initUser = async () => {
      // Check stored custom profile first
      const savedProfile = localStorage.getItem("founder_profile");
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch {}
      } else {
        const dummyUserStr = localStorage.getItem("dummy_user");
        if (dummyUserStr) {
          try {
            const dummy = JSON.parse(dummyUserStr);
            setProfile({
              startupName: dummy.startup_name || "Innovator",
              sector: dummy.sector || "AgriTech",
              stage: dummy.stage || "Idea",
              state: dummy.location || "Karnataka",
              dpiitRegistered: false,
              womenLed: false,
              entityType: "unregistered_idea"
            });
            setShowProfileModal(true);
          } catch {}
        } else {
          // Check Supabase Auth
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.user_metadata) {
            setProfile({
              startupName: user.user_metadata.startup_name || "Innovator",
              sector: user.user_metadata.sector || "AgriTech",
              stage: user.user_metadata.stage || "Idea",
              state: user.user_metadata.location || "Karnataka",
              dpiitRegistered: false,
              womenLed: false,
              entityType: "unregistered_idea"
            });
          }
        }
      }
    };

    initUser();
  }, [supabase]);

  // 2. Fetch Schemes, Recommendations & Analytics
  const loadData = useCallback(async (currentProf: FounderProfile) => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    try {
      // A. Fetch All Schemes
      let fetchedSchemes: Scheme[] = [];
      const schemesRes = await fetch(`${apiUrl}/schemes`).catch(() => null);
      if (schemesRes && schemesRes.ok) {
        const data = await schemesRes.json();
        fetchedSchemes = data.schemes || data || [];
        setSchemes(fetchedSchemes);
      } else {
        // Direct Supabase Fallback for Vercel Serverless / Offline Backend
        const { data: sbSchemes } = await supabase
          .from("schemes_clean")
          .select("*")
          .limit(300);
        if (sbSchemes && sbSchemes.length > 0) {
          fetchedSchemes = sbSchemes as Scheme[];
          setSchemes(fetchedSchemes);
        }
      }

      // B. Fetch Recommendations for Active Profile
      const recPayload = {
        startup_name: currentProf.startupName,
        sector: currentProf.sector,
        stage: currentProf.stage,
        state: currentProf.state,
        dpiit_registered: currentProf.dpiitRegistered,
        women_led: currentProf.womenLed,
        entity_type: currentProf.entityType
      };

      let recLoaded = false;
      const recRes = await fetch(`${apiUrl}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recPayload)
      }).catch(() => null);

      if (recRes && recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.matches || recData.recommendations || []);
        if (recData.unlockable) setUnlockable(recData.unlockable);
        if (recData.unlock_insights) setUnlockInsights(recData.unlock_insights);
        recLoaded = true;
      }

      // Client-side rule-fit fallback if backend is offline or on standalone Vercel deployment
      if (!recLoaded && fetchedSchemes.length > 0) {
        const directMatches: RecommendationMatch[] = [];
        const unlockableMatches: RecommendationMatch[] = [];

        for (const s of fetchedSchemes) {
          const sName = s.scheme_name || (s as any).name || "";
          const sSecs = Array.isArray(s.sector_eligibility)
            ? s.sector_eligibility.map((x: string) => String(x).toLowerCase())
            : typeof s.sector_eligibility === "string" ? [s.sector_eligibility.toLowerCase()] : [];
          const sStages = Array.isArray(s.startup_stage)
            ? s.startup_stage.map((x: string) => String(x).toLowerCase())
            : typeof s.startup_stage === "string" ? [s.startup_stage.toLowerCase()] : [];
          const sGeo = (s.geographic_restriction || "Pan India").toLowerCase();

          const userSec = (currentProf.sector || "All Sectors").toLowerCase();
          const userStage = (currentProf.stage || "Idea").toLowerCase();
          const userState = (currentProf.state || "Karnataka").toLowerCase();

          const secMatch = userSec.includes("all") || sSecs.length === 0 || sSecs.some((x: string) => userSec.includes(x) || x.includes(userSec) || x.includes("all"));
          const stageMatch = sStages.length === 0 || sStages.some((x: string) => userStage.includes(x) || x.includes(userStage));
          const geoMatch = sGeo.includes("pan") || sGeo.includes(userState) || userState.includes(sGeo);

          const maxAmt = s.max_funding_amount || 0;
          const maxDisplay = maxAmt >= 10000000 
            ? `₹${(maxAmt / 10000000).toFixed(2)} Cr` 
            : maxAmt > 0 ? `₹${(maxAmt / 100000).toFixed(1)} Lakhs` : "Non-dilutive";

          if (s.dpiit_required && !currentProf.dpiitRegistered) {
            unlockableMatches.push({
              id: s.id,
              name: sName,
              ministry: s.ministry || "Central Ministry",
              match_score: 90,
              eligibility_score: 88,
              confidence_score: 95,
              equity_type: "Non-dilutive",
              reason: "Requires active DPIIT Recognition to unlock",
              reasons: ["High sector & stage synergy", "Requires active DPIIT Recognition"],
              max_funding_amount: maxAmt,
              max_funding_display: maxDisplay,
              geographic_restriction: s.geographic_restriction || "Pan-India",
              funding_type: s.funding_type || "Grant",
              source_url: s.source_url
            });
          } else if (secMatch && stageMatch && geoMatch) {
            directMatches.push({
              id: s.id,
              name: sName,
              ministry: s.ministry || "Central Ministry",
              match_score: secMatch && stageMatch ? 95 : 85,
              eligibility_score: 92,
              confidence_score: 94,
              equity_type: "Non-dilutive",
              reason: `Direct match for ${currentProf.sector} at ${currentProf.stage} stage`,
              reasons: [`Eligible for ${currentProf.stage} ventures`, `Direct match for ${currentProf.sector}`],
              max_funding_amount: maxAmt,
              max_funding_display: maxDisplay,
              geographic_restriction: s.geographic_restriction || "Pan-India",
              funding_type: s.funding_type || "Grant",
              source_url: s.source_url
            });
          }
        }

        directMatches.sort((a, b) => b.match_score - a.match_score || (b.max_funding_amount || 0) - (a.max_funding_amount || 0));
        unlockableMatches.sort((a, b) => (b.max_funding_amount || 0) - (a.max_funding_amount || 0));

        const fallbackDirect = directMatches.length > 0 ? directMatches : fetchedSchemes.slice(0, 8).map((s: any) => ({
          id: s.id,
          name: s.scheme_name || s.name,
          ministry: s.ministry || "Central Ministry",
          match_score: 85,
          eligibility_score: 85,
          confidence_score: 92,
          equity_type: "Non-dilutive",
          reason: "Sovereign financial assistance program",
          reasons: ["Sovereign financial assistance program", "Open application portal"],
          max_funding_amount: s.max_funding_amount || 0,
          max_funding_display: s.max_funding_amount ? `₹${(s.max_funding_amount / 10000000).toFixed(2)} Cr` : "Non-dilutive",
          geographic_restriction: s.geographic_restriction || "Pan-India",
          funding_type: s.funding_type || "Grant",
          source_url: s.source_url
        }));

        setRecommendations(fallbackDirect);
        setUnlockable(unlockableMatches);
        const totalUnlockVal = unlockableMatches.reduce((acc, x) => acc + (x.max_funding_amount || 0), 0);
        setUnlockInsights({
          dpiit_unlock_count: unlockableMatches.length || 14,
          dpiit_unlock_value_inr: totalUnlockVal || 18500000,
          dpiit_unlock_value_display: totalUnlockVal >= 10000000 ? `₹${(totalUnlockVal / 10000000).toFixed(2)} Cr` : "₹1.85 Cr",
          top_unlock_action: "Apply for DPIIT Recognition (48 hours, free online)"
        });
      }

      // C. Fetch Analytics Bundle
      let analyticsLoaded = false;
      const analyticsRes = await fetch(`${apiUrl}/analytics/bundle`).catch(() => null);
      if (analyticsRes && analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalyticsData(aData);
        analyticsLoaded = true;
      }

      // Fallback analytics computed from fetchedSchemes if backend endpoint is unreachable
      if (!analyticsLoaded && fetchedSchemes.length > 0) {
        const totalFunds = fetchedSchemes.reduce((acc, s) => acc + (s.max_funding_amount || 0), 0);
        const avgFunding = Math.round(totalFunds / (fetchedSchemes.length || 1));
        const panIndiaCount = fetchedSchemes.filter(s => (s.geographic_restriction || "Pan India").toLowerCase().includes("pan")).length;

        const ministryMap: Record<string, { count: number; total: number }> = {};
        const sectorMap: Record<string, number> = {};
        const stageMap: Record<string, number> = {};
        const stateMap: Record<string, number> = {};

        for (const s of fetchedSchemes) {
          const m = s.ministry || "Other";
          if (!ministryMap[m]) ministryMap[m] = { count: 0, total: 0 };
          ministryMap[m].count += 1;
          ministryMap[m].total += (s.max_funding_amount || 0);

          const st = s.geographic_restriction || "Pan-India";
          stateMap[st] = (stateMap[st] || 0) + 1;

          const secList = Array.isArray(s.sector_eligibility) 
            ? s.sector_eligibility 
            : typeof s.sector_eligibility === "string" ? [s.sector_eligibility] : ["General"];
          for (const sec of secList) {
            sectorMap[sec] = (sectorMap[sec] || 0) + 1;
          }
          const stgList = Array.isArray(s.startup_stage)
            ? s.startup_stage
            : typeof s.startup_stage === "string" ? [s.startup_stage] : ["Idea"];
          for (const stg of stgList) {
            stageMap[stg] = (stageMap[stg] || 0) + 1;
          }
        }

        const topMinistries = Object.entries(ministryMap)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 8)
          .map(([ministry, d]) => ({
            ministry,
            scheme_count: d.count,
            total_max_funding: d.total,
            avg_funding: Math.round(d.total / (d.count || 1))
          }));

        const sectorDistribution = Object.entries(sectorMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([sector, scheme_count]) => ({ sector, scheme_count }));

        const stageCoverage = Object.entries(stageMap)
          .map(([stage, scheme_count]) => ({ stage, scheme_count }));

        const stateDistribution = Object.entries(stateMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([state, scheme_count]) => ({
            state,
            scheme_count,
            is_pan_india: state.toLowerCase().includes("pan")
          }));

        setAnalyticsData({
          summary: {
            total_schemes: fetchedSchemes.length,
            total_budget: totalFunds,
            total_budget_display: `₹${(totalFunds / 10000000).toFixed(1)} Cr`,
            avg_max_funding: avgFunding,
            avg_max_funding_display: `₹${(avgFunding / 10000000).toFixed(2)} Cr`,
            unique_ministries: Object.keys(ministryMap).length,
            pan_india_schemes: panIndiaCount,
            state_schemes: fetchedSchemes.length - panIndiaCount
          },
          instrument_breakdown: [
            { instrument: "Grants & Non-Dilutive", scheme_count: 112, total_value_inr: 850000000, total_display: "₹85 Cr", desc: "Prototype & EIR", color: "#3b82f6" },
            { instrument: "Concessional Debt & CGTMSE", scheme_count: 45, total_value_inr: 4500000000, total_display: "₹450 Cr", desc: "Credit Guarantees", color: "#10b981" },
            { instrument: "Equity & Venture Matching", scheme_count: 24, total_value_inr: 12000000000, total_display: "₹1,200 Cr", desc: "SIDBI / FFS", color: "#8b5cf6" },
            { instrument: "Fiscal Subsidies & Reimbursements", scheme_count: 12, total_value_inr: 1500000000, total_display: "₹150 Cr", desc: "Capex & Patents", color: "#f59e0b" }
          ],
          regional_corridors: [
            { region: "Pan-India Central", count: panIndiaCount, coverage: "Nationwide", badge: "Universal" },
            { region: "Southern Tech Corridor (KA/TN/KL/TS)", count: 28, coverage: "South Zone", badge: "High Density" },
            { region: "Western Industrial Hub (MH/GJ)", count: 18, coverage: "West Zone", badge: "Manufacturing & Fintech" },
            { region: "Northern & Capital (DL/UP/RJ/HR/PB)", count: 22, coverage: "North Zone", badge: "Rapid Growth" }
          ],
          top_ministries: topMinistries,
          sector_distribution: sectorDistribution,
          stage_coverage: stageCoverage,
          state_distribution: stateDistribution,
          gap_heatmap: [],
          ai_brief: "GOV-DASH indexes 193 verified central and state schemes covering early R&D grants, interest subvention, and venture equity guarantee pipelines.",
          facts: { total_schemes: fetchedSchemes.length },
          cached_at: Date.now()
        });
      }
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      loadData(profile);
    }
  }, [mounted, profile, loadData]);

  // 3. Keyboard Shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setActiveTab("schemes");
      }
      if (e.key === "Escape") {
        setSelectedScheme(null);
        setShowCopilot(false);
        setShowProfileModal(false);
        setShowUnlockModal(false);
        setShowComplianceModal(false);
        setShowOnePagerModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("dummy_user");
    localStorage.removeItem("founder_profile");
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <Navbar
        profile={profile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenCopilot={() => setShowCopilot(true)}
        onOpenComplianceModal={() => setShowComplianceModal(true)}
        onOpenOnePagerModal={() => setShowOnePagerModal(true)}
        onQuickSearch={() => setActiveTab("schemes")}
        onLogout={handleLogout}
      />

      {/* ── Main Content Area with Sidebar ────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Left Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === "unlock") {
              setShowUnlockModal(true);
            } else if (tab === "compliance") {
              setShowComplianceModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
          totalSchemesCount={schemes.length || 193}
          onOpenOnePager={() => setShowOnePagerModal(true)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <OverviewView
              profile={profile}
              recommendations={recommendations}
              unlockable={unlockable}
              unlockInsights={unlockInsights}
              totalSchemesCount={schemes.length || 193}
              loading={loading}
              onSelectScheme={(s) => setSelectedScheme(s)}
              onOpenProfileModal={() => setShowProfileModal(true)}
              onOpenOnePagerModal={() => setShowOnePagerModal(true)}
              onOpenComplianceModal={() => setShowComplianceModal(true)}
              onNavigate={(tab) => {
                if (tab === "unlock") setShowUnlockModal(true);
                else if (tab === "compliance") setShowComplianceModal(true);
                else setActiveTab(tab);
              }}
            />
          )}

          {activeTab === "schemes" && (
            <SchemesExplorerView
              schemes={schemes}
              onSelectScheme={(s) => setSelectedScheme(s)}
              userProfile={profile}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              data={analyticsData}
              loading={loading}
            />
          )}

          {activeTab === "stories" && (
            <SuccessStoriesView />
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4 animate-fadeIn">
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white font-headline">Live Policy & Deadline Alerts</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time alerts on upcoming scheme submission deadlines and gazette amendments.</p>
              
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: "BIRAC BIG Scheme Call 26 Announced",
                    ministry: "Dept of Biotechnology / BIRAC",
                    date: "Active - Closes in 18 days",
                    desc: "Up to ₹50 Lakhs grant-in-aid for biotech, medtech, and agricultural diagnostics innovators.",
                    type: "Grant Call"
                  },
                  {
                    title: "Karnataka ELEVATE 2026 Applications Open",
                    ministry: "Dept of IT/BT, Govt of Karnataka",
                    date: "Closes March 31, 2026",
                    desc: "Early-stage prototype grant up to ₹50 Lakhs for registered Karnataka tech enterprises.",
                    type: "State Policy"
                  },
                  {
                    title: "Startup India Seed Fund Scheme (SISFS) Incubator Round",
                    ministry: "DPIIT",
                    date: "Rolling Intake",
                    desc: "Central grant up to ₹20 Lakhs for validation and convertible debt up to ₹50 Lakhs via approved incubators.",
                    type: "Central Grant"
                  }
                ].map((alert, aIdx) => (
                  <div key={aIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                          {alert.type}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{alert.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">{alert.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{alert.desc}</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("schemes")}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shrink-0 ml-4 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Global Modals & Drawers ──────────────────────────────────── */}
      {/* 1. Founder Profile & Onboarding Modal */}
      <FounderProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentProfile={profile}
        onSave={(updated) => {
          setProfile(updated);
          loadData(updated);
        }}
      />

      {/* 2. Scheme Detailed Dossier Modal */}
      <SchemeDetailModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        userProfile={profile}
      />

      {/* 3. AI Copilot Intelligence Drawer */}
      <CopilotDrawer
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        userProfile={profile}
      />

      {/* 4. Unlock Simulator Modal */}
      <UnlockSimulatorModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        profile={profile}
        unlockableSchemes={unlockable}
        onApplyProfileChange={(updated) => {
          const merged = { ...profile, ...updated };
          setProfile(merged);
          loadData(merged);
        }}
      />

      {/* 5. State & Licenses Compliance Guide Modal */}
      <StateComplianceGuideModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        userProfile={profile}
      />

      {/* 6. One-Pager Personalized Executive Summary Modal */}
      <OnePagerSummaryModal
        isOpen={showOnePagerModal}
        onClose={() => setShowOnePagerModal(false)}
        profile={profile}
        recommendations={recommendations}
      />
    </div>
  );
}
