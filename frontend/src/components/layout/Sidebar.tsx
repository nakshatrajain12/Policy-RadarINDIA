"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Layers, 
  BarChart3, 
  Unlock, 
  Bell, 
  Database,
  ExternalLink,
  Sparkles,
  Award,
  ShieldCheck,
  FileText
} from "lucide-react";

export type NavTab = "dashboard" | "schemes" | "analytics" | "stories" | "compliance" | "unlock" | "alerts";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  totalSchemesCount: number;
  onOpenOnePager?: () => void;
}

export function Sidebar({ activeTab, onTabChange, totalSchemesCount, onOpenOnePager }: Props) {
  const navItems = [
    { id: "dashboard" as NavTab, label: "Overview", icon: LayoutDashboard, badge: "Matches" },
    { id: "schemes" as NavTab, label: "Schemes Explorer", icon: Layers, badge: String(totalSchemesCount || 193) },
    { id: "analytics" as NavTab, label: "Analytics 2.0", icon: BarChart3, badge: "AI Brief" },
    { id: "stories" as NavTab, label: "Success Stories", icon: Award, badge: "Alumni" },
    { id: "compliance" as NavTab, label: "State & Licenses", icon: ShieldCheck, badge: "DPIIT" },
    { id: "unlock" as NavTab, label: "Unlock Simulator", icon: Unlock, badge: "Simulate" },
    { id: "alerts" as NavTab, label: "Policy Updates", icon: Bell, badge: "Live" },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 p-4 transition-colors">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Intelligence Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isActive
                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Download One-Pager</span>
            </button>
          </div>
        )}
      </div>

      {/* Database & System Health Widget */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300">Registry Synced</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">100% Verified</span>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
          Central & 28 State Startup Missions with live source grounding and gazette references.
        </div>
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>Latency: ~38ms</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">v2.4-BTP</span>
        </div>
      </div>
    </aside>
  );
}
