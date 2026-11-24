"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Layers, 
  BarChart3, 
  Unlock, 
  Bell, 
  Sparkles, 
  Award, 
  ShieldCheck,
  X
} from "lucide-react";

export type NavTab = "dashboard" | "roadmap" | "schemes" | "analytics" | "stories" | "compliance" | "unlock" | "alerts";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalSchemesCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: any;
  badge?: string;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  totalSchemesCount,
  isOpenMobile = false,
  onCloseMobile
}: Props) {
  // 1. Workspace Group
  const workspaceItems: NavItemConfig[] = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "roadmap", label: "My Roadmap", icon: Sparkles },
    { id: "schemes", label: "Schemes Explorer", icon: Layers, badge: String(totalSchemesCount || 193) },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  // 2. More Group
  const moreItems: NavItemConfig[] = [
    { id: "stories", label: "Success Stories", icon: Award },
    { id: "compliance", label: "State & Licenses", icon: ShieldCheck },
    { id: "alerts", label: "Policy Updates", icon: Bell },
  ];

  const renderNavGroup = (title: string, items: NavItemConfig[]) => (
    <div className="space-y-1">
      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${
              isActive
                ? "bg-accent/10 text-accent border border-accent/30 font-bold"
                : "text-muted hover:text-text hover:bg-surface-2 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-muted"}`} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isActive
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-2 text-text border border-border"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-border bg-surface p-4 overflow-y-auto text-text transition-colors">
        <div className="space-y-5">
          {renderNavGroup("Workspace", workspaceItems)}
          <div className="border-t border-border pt-3">
            {renderNavGroup("More", moreItems)}
          </div>
        </div>

        {/* Database & System Health Widget */}
        <div className="p-3.5 rounded-xl border border-border bg-surface-2 space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ok" />
              <span className="text-xs font-bold text-text">Registry Synced</span>
            </div>
            <span className="text-xs font-mono text-ok font-semibold">100% Verified</span>
          </div>
          <div className="text-xs text-muted leading-relaxed">
            Central & 28 State Startup Missions with live source grounding and gazette references.
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Left Slide-Over) */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fadeIn">
          {/* Solid scrim overlay */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={onCloseMobile}
            aria-hidden="true" 
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-surface border-r border-border p-4 flex flex-col justify-between overflow-y-auto z-10 text-text">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-bold text-sm text-text font-headline">Navigation Menu</span>
                <button
                  onClick={onCloseMobile}
                  aria-label="Close menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavGroup("Workspace", workspaceItems)}
              <div className="border-t border-border pt-3">
                {renderNavGroup("More", moreItems)}
              </div>
            </div>

            <div className="pt-4 border-t border-border text-xs text-muted">
              Policy Radar India • v2.4-BTP
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Mobile Bottom Tab Bar Component (390px & 768px Viewports) ─────────────────
interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenMoreMenu: () => void;
}

export function MobileBottomNav({ activeTab, onTabChange, onOpenMoreMenu }: BottomNavProps) {
  const tabs = [
    { id: "dashboard" as NavTab, label: "Overview", icon: LayoutDashboard },
    { id: "roadmap" as NavTab, label: "Roadmap", icon: Sparkles },
    { id: "schemes" as NavTab, label: "Schemes", icon: Layers },
    { id: "analytics" as NavTab, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border flex items-center justify-around h-16 px-1 safe-area-pb"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer ${
              isActive ? "text-accent font-bold" : "text-muted hover:text-text"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1 leading-tight">{tab.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-lg text-muted hover:text-text transition-colors cursor-pointer"
        aria-label="More options"
      >
        <span className="w-5 h-5 flex items-center justify-center font-bold text-base leading-none">⋯</span>
        <span className="text-xs mt-1 leading-tight">More</span>
      </button>
    </nav>
  );
}
