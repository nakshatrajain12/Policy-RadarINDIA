"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Bot, 
  LogOut, 
  ShieldCheck, 
  Building2,
  MapPin,
  TrendingUp,
  Compass,
  Sun,
  Moon,
  FileText,
  Bell,
  HelpCircle
} from "lucide-react";
import { FounderProfile } from "@/types";

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
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Sync initial theme
    const saved = localStorage.getItem("govdash_theme") || localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("govdash_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("govdash_theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-950 dark:text-white font-headline">
                GOV-DASH
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                INDIA 🇮🇳
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium hidden sm:block">
              Policy Radar India — Startup Policy & Scheme Intelligence
            </p>
          </div>
        </div>

        {/* Center: Dynamic Founder Profile Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.startupName || "Startup"}:</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/20">
            {profile.sector}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {profile.stage}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
            {profile.state}
          </span>
          {profile.dpiitRegistered ? (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
              DPIIT ✓
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px]">
              Non-DPIIT
            </span>
          )}
          <button
            onClick={onOpenProfileModal}
            className="ml-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-500/10 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
            Edit Profile
          </button>
        </div>

        {/* Right Actions: One-Pager, State Guide, Search, Copilot, Theme, Logout */}
        <div className="flex items-center gap-2">
          {/* Download One-Pager Summary Button */}
          <button
            onClick={onOpenOnePagerModal}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Download executive 1-page summary tailored to your active profile"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>One-Pager</span>
          </button>

          {/* State & Licenses Guide Button */}
          <button
            onClick={onOpenComplianceModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="DPIIT, Tax Holiday, Udyam & State Startup Mission Guides"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>State & Licenses</span>
          </button>

          {/* Quick Search Shortcut */}
          <button
            onClick={onQuickSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs transition-colors"
            title="Search schemes (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-800">
              ⌘K
            </kbd>
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping ml-0.5" />
          </button>

          {/* Platform Tour Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              title="Guided tour of GOV-DASH features"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Tour</span>
            </button>
          )}

          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors relative"
              title="Real-time policy alerts & deadlines"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          )}

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
