"use client";

import React from "react";
import { 
  Compass, 
  Search, 
  Bot, 
  SlidersHorizontal, 
  Bell, 
  Moon, 
  Sun, 
  LogOut,
  FileText,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { FounderProfile } from "@/types";
import { useTheme } from "@/context/ThemeProvider";

interface Props {
  profile: FounderProfile;
  onOpenProfileModal: () => void;
  onOpenCopilot: () => void;
  onOpenComplianceModal: () => void;
  onOpenOnePagerModal: () => void;
  onQuickSearch: () => void;
  onLogout: () => void;
  onOpenTour?: () => void;
  onOpenNotifications?: () => void;
  unreadAlertsCount?: number;
}

export function Navbar({
  profile,
  onOpenProfileModal,
  onOpenCopilot,
  onOpenComplianceModal,
  onOpenOnePagerModal,
  onQuickSearch, 
  onLogout,
  onOpenTour,
  onOpenNotifications,
  unreadAlertsCount = 2
}: Props) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-accent-contrast font-bold shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-text font-headline">
                GOV-DASH
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-warn/10 text-warn border border-warn/30">
                INDIA 🇮🇳
              </span>
            </div>
            <p className="text-xs text-muted font-medium hidden sm:block">
              Policy Radar India — Startup Policy & Scheme Intelligence
            </p>
          </div>
        </div>

        {/* Center: Dynamic Founder Profile Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <span className="w-2 h-2 rounded-full bg-ok" />
            <span className="font-semibold text-text">{profile.startupName || "Startup"}:</span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent font-semibold border border-accent/20">
            {profile.sector}
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-surface text-text font-medium border border-border">
            {profile.stage}
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-warn/10 text-warn font-medium border border-warn/20">
            {profile.state}
          </span>
          {profile.dpiitRegistered ? (
            <span className="px-1.5 py-0.5 rounded text-xs bg-ok/10 text-ok font-bold border border-ok/30">
              DPIIT ✓
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-xs bg-surface text-muted border border-border">
              Non-DPIIT
            </span>
          )}
          <button
            onClick={onOpenProfileModal}
            className="ml-1 text-xs font-bold text-accent hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[36px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Download One-Pager Summary Button */}
          <button
            onClick={onOpenOnePagerModal}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
            title="Download executive 1-page summary tailored to your active profile"
          >
            <FileText className="w-4 h-4 text-accent" />
            <span>One-Pager</span>
          </button>

          {/* State & Licenses Guide Button */}
          <button
            onClick={onOpenComplianceModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
            title="DPIIT, Tax Holiday, Udyam & State Startup Mission Guides"
          >
            <ShieldCheck className="w-4 h-4 text-ok" />
            <span>State & Licenses</span>
          </button>

          {/* Quick Search Shortcut */}
          <button
            onClick={onQuickSearch}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
            title="Search schemes (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-surface text-muted rounded border border-border">
              ⌘K
            </kbd>
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-accent-contrast hover:opacity-90 text-xs font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Platform Tour Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              title="Guided tour of GOV-DASH features"
            >
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>Tour</span>
            </button>
          )}

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text transition-colors relative focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Real-time policy alerts & deadlines"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-muted hover:text-text" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
              )}
            </button>
          )}

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-text" />}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors focus:outline-none focus:ring-2 focus:ring-danger min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
