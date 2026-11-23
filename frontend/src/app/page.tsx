"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { X } from "lucide-react";
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
import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { RoadmapWizardModal } from "@/components/roadmap/RoadmapWizardModal";
import { PlatformTourModal } from "@/components/tour/PlatformTourModal";
import { NotificationDrawer, FloatingNotificationToast } from "@/components/notifications/NotificationDrawer";
import { DemoPersonaSelector, DEMO_PERSONAS } from "@/components/demo/DemoPersonaSelector";
import { generatePersonalizedRoadmap } from "@/lib/roadmapEngine";
import { useAppData } from "@/hooks/useAppData";
import { 
  FounderProfile, 
  Scheme, 
  RoadmapStepStatus, 
  IntakeAnswers, 
  DemoPersona 
} from "@/types";

const DEFAULT_PROFILE: FounderProfile = {
  startupName: "KisanAI Soil Health",
  sector: "AgriTech",
  stage: "Idea",
  state: "Karnataka",
  dpiitRegistered: false,
  womenLed: false,
  entityType: "unregistered_idea"
};

const DEFAULT_ANSWERS: IntakeAnswers = {
  startupName: "KisanAI Soil Health",
  sector: "AgriTech",
  stage: "Idea",
  state: "Karnataka",
  primaryGoal: "Idea Validation / Prototype",
  turnoverBand: "< ₹10 Lakhs (Pre-revenue)",
  documentsHeld: ["aadhaar_pan", "pitch_deck"],
  womenLed: false
};

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  
  // Profile & Answers State
  const [profile, setProfile] = useState<FounderProfile>(DEFAULT_PROFILE);
  const [intakeAnswers, setIntakeAnswers] = useState<IntakeAnswers>(DEFAULT_ANSWERS);
  const [stepStatuses, setStepStatuses] = useState<Record<string, RoadmapStepStatus>>({});
  const [activePersonaSlug, setActivePersonaSlug] = useState<string>("student_agri");

  // Modals & Drawers
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showOnePagerModal, setShowOnePagerModal] = useState(false);
  const [showRoadmapWizard, setShowRoadmapWizard] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // 1. Data Loading via Hook (Parallel fetches, fetchJson, abort timeout, retry)
  const {
    schemesState,
    recommendationsState,
    analyticsState,
    isOffline,
    retryResource,
  } = useAppData(profile);

  const schemes = schemesState.data;
  const recommendations = recommendationsState.data.matches;
  const unlockable = recommendationsState.data.unlockable;
  const unlockInsights = recommendationsState.data.unlockInsights;
  const analyticsData = analyticsState.data;
  const loading = schemesState.status === "loading" || recommendationsState.status === "loading";

  // 2. Derive Roadmap in useMemo (Synchronous, depends on intakeAnswers, schemes, stepStatuses)
  const roadmap = useMemo(() => {
    return generatePersonalizedRoadmap(intakeAnswers, schemes, stepStatuses);
  }, [intakeAnswers, schemes, stepStatuses]);

  // Safe Supabase client (no placeholder fallback)
  const isSbConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const supabase = useMemo(() => {
    return isSbConfigured
      ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      : null;
  }, [isSbConfigured]);

  // 3. Initialize Profile, URL Query Demo Personas & Tour on Mount
  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const demoParam = params.get("demo");
      if (demoParam) {
        const foundPersona = DEMO_PERSONAS.find(p => p.slug === demoParam);
        if (foundPersona) {
          setActivePersonaSlug(foundPersona.slug);
          setIntakeAnswers(foundPersona.answers);
          const pProf: FounderProfile = {
            startupName: foundPersona.answers.startupName,
            sector: foundPersona.answers.sector,
            stage: foundPersona.answers.stage,
            state: foundPersona.answers.state,
            dpiitRegistered: foundPersona.answers.documentsHeld.includes("dpiit_cert"),
            womenLed: !!foundPersona.answers.womenLed,
            entityType: foundPersona.answers.documentsHeld.includes("incorporation") ? "private_limited" : "unregistered_idea"
          };
          setProfile(pProf);
        }
      }

      // Check first-time tour visit
      const tourDone = localStorage.getItem("govdash_tour_completed");
      if (!tourDone && !demoParam) {
        setTimeout(() => setShowTourModal(true), 1200);
      }

      // Load saved step statuses
      try {
        const savedStatuses = localStorage.getItem("govdash_step_statuses");
        if (savedStatuses) {
          const parsed = JSON.parse(savedStatuses);
          setStepStatuses(parsed);
        }
      } catch {}

      // Load saved profile
      const savedProfile = localStorage.getItem("founder_profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
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
          } catch {}
        }
      }
    }
  }, []);

  // 4. Demo Persona Switcher
  const handleSelectDemoPersona = (persona: DemoPersona) => {
    setActivePersonaSlug(persona.slug);
    setIntakeAnswers(persona.answers);
    const newProf: FounderProfile = {
      startupName: persona.answers.startupName,
      sector: persona.answers.sector,
      stage: persona.answers.stage,
      state: persona.answers.state,
      dpiitRegistered: persona.answers.documentsHeld.includes("dpiit_cert"),
      womenLed: !!persona.answers.womenLed,
      entityType: persona.answers.documentsHeld.includes("incorporation") ? "private_limited" : "unregistered_idea"
    };
    setProfile(newProf);
    try {
      localStorage.setItem("founder_profile", JSON.stringify(newProf));
    } catch {}
  };

  // 5. Update Step Status & Persist
  const handleUpdateStepStatus = (stepId: string, status: RoadmapStepStatus) => {
    const updated = { ...stepStatuses, [stepId]: status };
    setStepStatuses(updated);
    try {
      localStorage.setItem("govdash_step_statuses", JSON.stringify(updated));
    } catch {}
  };

  // 6. Complete Intake Wizard
  const handleCompleteWizard = (answers: IntakeAnswers) => {
    setIntakeAnswers(answers);
    const updatedProf: FounderProfile = {
      startupName: answers.startupName || profile.startupName,
      sector: answers.sector,
      stage: answers.stage,
      state: answers.state,
      dpiitRegistered: answers.documentsHeld.includes("dpiit_cert"),
      womenLed: !!answers.womenLed,
      entityType: answers.documentsHeld.includes("incorporation") ? "private_limited" : "unregistered_idea"
    };
    setProfile(updatedProf);
    try {
      localStorage.setItem("founder_profile", JSON.stringify(updatedProf));
    } catch {}
    setActiveTab("roadmap");
  };

  // 7. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
        setShowRoadmapWizard(false);
        setShowTourModal(false);
        setShowNotificationDrawer(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("dummy_user");
    localStorage.removeItem("founder_profile");
    localStorage.removeItem("profile_customized");
    document.cookie = "govdash_session=; path=/; max-age=0; SameSite=Lax";
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
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
        onOpenTour={() => setShowTourModal(true)}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        unreadAlertsCount={2}
      />

      {/* ── Offline Mode Banner (Dismissible) ─────────────────────────── */}
      {isOffline && showOfflineBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">Using bundled data (offline mode)</span>
          </div>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white rounded transition-colors"
            aria-label="Dismiss offline banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          
          {/* TAB 1: OVERVIEW & DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <DemoPersonaSelector
                activePersonaSlug={activePersonaSlug}
                onSelectPersona={handleSelectDemoPersona}
              />

              <OverviewView
                profile={profile}
                recommendations={recommendations}
                unlockable={unlockable}
                unlockInsights={unlockInsights}
                totalSchemesCount={schemes.length || 193}
                loading={loading}
                recommendationsStatus={recommendationsState.status}
                recommendationsError={recommendationsState.error}
                onRetryRecommendations={() => retryResource("recommendations")}
                onSelectScheme={(s) => setSelectedScheme(s)}
                onOpenProfileModal={() => setShowProfileModal(true)}
                onOpenOnePagerModal={() => setShowOnePagerModal(true)}
                onOpenComplianceModal={() => setShowComplianceModal(true)}
                onNavigate={(tab) => {
                  if (tab === "unlock") setShowUnlockModal(true);
                  else if (tab === "compliance") setShowComplianceModal(true);
                  else setActiveTab(tab);
                }}
                onBuildRoadmap={() => setActiveTab("roadmap")}
                onOpenTour={() => setShowTourModal(true)}
              />
            </div>
          )}

          {/* TAB 2: PERSONALIZED ACTIONABLE ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <DemoPersonaSelector
                activePersonaSlug={activePersonaSlug}
                onSelectPersona={handleSelectDemoPersona}
                compact
              />
              <RoadmapView
                roadmap={roadmap}
                onUpdateStepStatus={handleUpdateStepStatus}
                onOpenWizard={() => setShowRoadmapWizard(true)}
                onSelectSchemeDetail={(sName) => {
                  const found = schemes.find(s => s.scheme_name.toLowerCase() === sName.toLowerCase());
                  if (found) setSelectedScheme(found);
                }}
              />
            </div>
          )}

          {/* TAB 3: SCHEMES EXPLORER */}
          {activeTab === "schemes" && (
            <SchemesExplorerView
              schemes={schemes}
              onSelectScheme={(s) => setSelectedScheme(s)}
              userProfile={profile}
            />
          )}

          {/* TAB 4: POLICY ANALYTICS 2.0 */}
          {activeTab === "analytics" && (
            <AnalyticsView
              data={analyticsData}
              status={analyticsState.status}
              error={analyticsState.error}
              isLocalFallback={analyticsState.isLocalFallback}
              onRetry={() => retryResource("analytics")}
            />
          )}

          {/* TAB 5: SUCCESS STORIES */}
          {activeTab === "stories" && (
            <SuccessStoriesView />
          )}

          {/* TAB 6: POLICY UPDATES & DEADLINES */}
          {activeTab === "alerts" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white font-headline">
                    Live Policy & Deadline Alerts
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time alerts synced daily with the official Gazette of India at 09:00 AM IST.
                  </p>
                </div>
                <button
                  onClick={() => setShowNotificationDrawer(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                >
                  Open Alert Drawer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                  },
                  {
                    title: "Credit Guarantee Scheme (CGSS) Expansion",
                    ministry: "Ministry of Commerce & Industry",
                    date: "Permanent Gazette",
                    desc: "Collateral-free debt guarantees up to ₹10 Crore for revenue-generating DPIIT registered startups.",
                    type: "Debt Guarantee"
                  }
                ].map((alert, aIdx) => (
                  <div key={aIdx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                          {alert.type}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{alert.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white">{alert.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{alert.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{alert.ministry}</span>
                      <button 
                        onClick={() => setActiveTab("schemes")}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Explore in Registry &rarr;
                      </button>
                    </div>
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
          setProfile(prev => ({ ...prev, ...updated }));
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

      {/* 7. Roadmap Intake Wizard Modal */}
      <RoadmapWizardModal
        isOpen={showRoadmapWizard}
        onClose={() => setShowRoadmapWizard(false)}
        initialAnswers={intakeAnswers}
        onComplete={handleCompleteWizard}
      />

      {/* 8. Guided Platform Tour Modal */}
      <PlatformTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
      />

      {/* 9. Policy Alerts & Deadlines Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        userSector={profile.sector}
        userState={profile.state}
      />

      {/* 10. Non-Intrusive Floating Toast */}
      <FloatingNotificationToast
        suppress={showRoadmapWizard || showTourModal}
        userSector={profile.sector}
        onOpenDrawer={() => setShowNotificationDrawer(true)}
      />

    </div>
  );
}
