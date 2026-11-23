"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, NavTab, MobileBottomNav } from "@/components/layout/Sidebar";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { SchemesExplorerView } from "@/components/schemes/SchemesExplorerView";
import { SchemeDetailModal } from "@/components/schemes/SchemeDetailModal";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { SuccessStoriesView } from "@/components/stories/SuccessStoriesView";
import { PolicyUpdatesView } from "@/components/alerts/PolicyUpdatesView";
import { CopilotDrawer } from "@/components/copilot/CopilotDrawer";
import { FounderProfileModal } from "@/components/profile/FounderProfileModal";
import { UnlockSimulatorModal } from "@/components/unlock/UnlockSimulatorModal";
import { StateComplianceGuideModal } from "@/components/compliance/StateComplianceGuideModal";
import { OnePagerSummaryModal } from "@/components/export/OnePagerSummaryModal";
import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { RoadmapWizardModal } from "@/components/roadmap/RoadmapWizardModal";
import { PlatformTourModal } from "@/components/tour/PlatformTourModal";
import { NotificationDrawer, FloatingNotificationToast } from "@/components/notifications/NotificationDrawer";
import notificationsData from "@/data/notifications.json";
import { DEMO_PERSONAS } from "@/components/demo/DemoPersonaSelector";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Dynamic unread count based on notifications data and read IDs in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("govdash_read_notifs");
      if (saved) setReadNotifIds(new Set(JSON.parse(saved)));
    } catch {}
  }, [showNotificationDrawer]);

  const unreadAlertsCount = useMemo(() => {
    return notificationsData.filter(n => !readNotifIds.has(n.id)).length;
  }, [readNotifIds]);

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

      // Load saved step statuses from localStorage first
      try {
        const savedStatuses = localStorage.getItem("govdash_step_statuses");
        if (savedStatuses) {
          const parsed = JSON.parse(savedStatuses);
          setStepStatuses(parsed);
        }
      } catch {}

      // If Supabase authenticated user, sync remote step statuses
      if (supabase) {
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data, error } = await supabase
                .from("user_roadmap_steps")
                .select("step_key, status")
                .eq("user_id", user.id);
              if (data && !error && data.length > 0) {
                const remoteMap: Record<string, RoadmapStepStatus> = {};
                data.forEach((r: { step_key: string; status: RoadmapStepStatus }) => {
                  if (r.step_key && r.status) remoteMap[r.step_key] = r.status;
                });
                setStepStatuses(prev => {
                  const merged = { ...prev, ...remoteMap };
                  try {
                    localStorage.setItem("govdash_step_statuses", JSON.stringify(merged));
                  } catch {}
                  return merged;
                });
              }
            }
          } catch {}
        })();
      }

      // Load saved profile
      const savedProfile = localStorage.getItem("founder_profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
          setIntakeAnswers(prev => ({
            ...prev,
            startupName: parsed.startupName || prev.startupName,
            sector: parsed.sector || prev.sector,
            stage: parsed.stage || prev.stage,
            state: parsed.state || prev.state,
            womenLed: parsed.womenLed ?? prev.womenLed,
            documentsHeld: [
              ...(parsed.dpiitRegistered ? ["dpiit_cert"] : []),
              ...(parsed.entityType === "private_limited" ? ["incorporation"] : []),
              ...prev.documentsHeld.filter(d => d !== "dpiit_cert" && d !== "incorporation")
            ]
          }));
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

  // 5. Update Step Status & Persist (Supabase with RLS for auth, localStorage for guests)
  const handleUpdateStepStatus = (stepId: string, status: RoadmapStepStatus) => {
    const updated = { ...stepStatuses, [stepId]: status };
    setStepStatuses(updated);
    
    // Always persist to localStorage for instant local/guest availability
    try {
      localStorage.setItem("govdash_step_statuses", JSON.stringify(updated));
    } catch {}

    // Persist to Supabase if authenticated
    if (supabase) {
      (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("user_roadmap_steps")
              .upsert({
                user_id: user.id,
                scheme_id: stepId,
                step_key: stepId,
                status: status,
                updated_at: new Date().toISOString()
              }, { onConflict: "user_id,step_key" });
          }
        } catch {}
      })();
    }
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
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text font-sans selection:bg-accent selection:text-white transition-colors overflow-x-hidden">
      
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <Navbar
        profile={profile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenCopilot={() => setShowCopilot(true)}
        onOpenOnePagerModal={() => setShowOnePagerModal(true)}
        onQuickSearch={() => setActiveTab("schemes")}
        onLogout={handleLogout}
        onOpenTour={() => setShowTourModal(true)}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        unreadAlertsCount={unreadAlertsCount}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* ── Offline Mode Banner (Dismissible) ─────────────────────────── */}
      {isOffline && showOfflineBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium">Using bundled data (offline mode)</span>
          </div>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white rounded transition-colors cursor-pointer"
            aria-label="Dismiss offline banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Main Content Area with Sidebar ────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Left Desktop & Mobile Drawer Sidebar */}
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
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW & DASHBOARD */}
          {activeTab === "dashboard" && (
            <ErrorBoundary tabName="Overview & Matches">
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
                activePersonaSlug={activePersonaSlug}
                onSelectPersona={handleSelectDemoPersona}
              />
            </ErrorBoundary>
          )}

          {/* TAB 2: PERSONALIZED ACTIONABLE ROADMAP */}
          {activeTab === "roadmap" && (
            <ErrorBoundary tabName="My Action Roadmap">
              <div className="space-y-6">
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
            </ErrorBoundary>
          )}

          {/* TAB 3: SCHEMES EXPLORER */}
          {activeTab === "schemes" && (
            <ErrorBoundary tabName="Schemes Explorer">
              <SchemesExplorerView
                schemes={schemes}
                onSelectScheme={(s) => setSelectedScheme(s)}
                userProfile={profile}
              />
            </ErrorBoundary>
          )}

          {/* TAB 4: POLICY ANALYTICS 2.0 */}
          {activeTab === "analytics" && (
            <ErrorBoundary tabName="Policy Analytics">
              <AnalyticsView
                data={analyticsData}
                status={analyticsState.status}
                error={analyticsState.error}
                isLocalFallback={analyticsState.isLocalFallback}
                onRetry={() => retryResource("analytics")}
              />
            </ErrorBoundary>
          )}

          {/* TAB 5: SUCCESS STORIES */}
          {activeTab === "stories" && (
            <ErrorBoundary tabName="Success Stories">
              <SuccessStoriesView />
            </ErrorBoundary>
          )}

          {/* TAB 6: POLICY UPDATES & DEADLINES */}
          {activeTab === "alerts" && (
            <ErrorBoundary tabName="Policy Updates & Deadlines">
              <PolicyUpdatesView
                schemes={schemes}
                onSelectScheme={(s) => setSelectedScheme(s)}
                onOpenNotificationDrawer={() => setShowNotificationDrawer(true)}
                onNavigateToSchemes={() => setActiveTab("schemes")}
              />
            </ErrorBoundary>
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
          setIntakeAnswers(prev => ({
            ...prev,
            startupName: updated.startupName || prev.startupName,
            sector: updated.sector || prev.sector,
            stage: updated.stage || prev.stage,
            state: updated.state || prev.state,
            womenLed: updated.womenLed ?? prev.womenLed,
            documentsHeld: [
              ...(updated.dpiitRegistered ? ["dpiit_cert"] : []),
              ...(updated.entityType === "private_limited" ? ["incorporation"] : []),
              ...prev.documentsHeld.filter(d => d !== "dpiit_cert" && d !== "incorporation")
            ]
          }));
          try {
            localStorage.setItem("founder_profile", JSON.stringify(updated));
          } catch {}
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
          const nextProf = { ...profile, ...updated };
          setProfile(nextProf);
          setIntakeAnswers(prev => ({
            ...prev,
            startupName: nextProf.startupName || prev.startupName,
            sector: nextProf.sector || prev.sector,
            stage: nextProf.stage || prev.stage,
            state: nextProf.state || prev.state,
            womenLed: nextProf.womenLed ?? prev.womenLed,
            documentsHeld: [
              ...(nextProf.dpiitRegistered ? ["dpiit_cert"] : []),
              ...(nextProf.entityType === "private_limited" ? ["incorporation"] : []),
              ...prev.documentsHeld.filter(d => d !== "dpiit_cert" && d !== "incorporation")
            ]
          }));
          try {
            localStorage.setItem("founder_profile", JSON.stringify(nextProf));
          } catch {}
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
        roadmap={roadmap}
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

      {/* 11. Mobile Bottom Tab Bar */}
      <MobileBottomNav
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
        onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
      />

    </div>
  );
}
