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
  FileText 
} from "lucide-react";

export type NavTab = "dashboard" | "roadmap" | "schemes" | "analytics" | "stories" | "compliance" | "unlock" | "alerts";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalSchemesCount: number;
  onOpenOnePager?: () => void;
}

export function Sidebar({ activeTab, onTabChange, totalSchemesCount, onOpenOnePager }: Props) {
  const navItems = [
    { id: "dashboard" as NavTab, label: "Overview", icon: LayoutDashboard, badge: "Matches" },
    { id: "roadmap" as NavTab, label: "Action Roadmap", icon: Sparkles, badge: "Now/Next" },
    { id: "schemes" as NavTab, label: "Schemes Explorer", icon: Layers, badge: String(totalSchemesCount || 193) },
    { id: "analytics" as NavTab, label: "Analytics 2.0", icon: BarChart3, badge: "AI Brief" },
    { id: "stories" as NavTab, label: "Success Stories", icon: Award, badge: "Alumni" },
    { id: "compliance" as NavTab, label: "State & Licenses", icon: ShieldCheck, badge: "DPIIT" },
    { id: "unlock" as NavTab, label: "Unlock Simulator", icon: Unlock, badge: "Simulate" },
    { id: "alerts" as NavTab, label: "Policy Updates", icon: Bell, badge: "Live" },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-border bg-surface p-4 transition-colors">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted">
          Intelligence Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent ${
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
                  className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                    isActive
                      ? "bg-accent/20 text-accent"
                      : "bg-surface-2 text-muted border border-border"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Download One-Pager Shortcut */}
        {onOpenOnePager && (
          <div className="pt-2">
            <button
              onClick={onOpenOnePager}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-ok bg-ok/10 hover:bg-ok/20 border border-ok/20 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ok"
            >
              <FileText className="w-4 h-4 text-ok" />
              <span>Download One-Pager</span>
            </button>
          </div>
        )}
      </div>

      {/* Database & System Health Widget */}
      <div className="p-3.5 rounded-xl border border-border bg-surface-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
            <span className="text-xs font-bold text-text">Registry Synced</span>
          </div>
          <span className="text-xs font-mono text-ok font-semibold">100% Verified</span>
        </div>
        <div className="text-xs text-muted leading-relaxed">
          Central & 28 State Startup Missions with live source grounding and gazette references.
        </div>
        <div className="pt-1.5 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>Latency: ~38ms</span>
          <span className="font-mono text-muted">v2.4-BTP</span>
        </div>
      </div>
    </aside>
  );
}
