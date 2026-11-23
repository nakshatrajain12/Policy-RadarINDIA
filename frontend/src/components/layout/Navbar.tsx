"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Compass, 
  Search, 
  Bot, 
  Bell, 
  Moon, 
  Sun, 
  LogOut,
  FileText,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  User
} from "lucide-react";
import { FounderProfile } from "@/types";
import { useTheme } from "@/context/ThemeProvider";

interface Props {
  profile: FounderProfile;
  onOpenProfileModal: () => void;
  onOpenCopilot: () => void;
  onOpenOnePagerModal: () => void;
  onQuickSearch: () => void;
  onLogout: () => void;
  onOpenTour?: () => void;
  onOpenNotifications?: () => void;
  unreadAlertsCount?: number;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({
  profile,
  onOpenProfileModal,
  onOpenCopilot,
  onOpenOnePagerModal,
  onQuickSearch, 
  onLogout,
  onOpenTour,
  onOpenNotifications,
  unreadAlertsCount = 0,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}: Props) {
  const { isDark, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside listener for overflow menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface text-text transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Brand: Logo + Name only (tagline removed) */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-contrast font-bold shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-text font-headline">
                GOV-DASH
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-warn/15 text-warn border border-warn/30">
                INDIA 🇮🇳
              </span>
            </div>
          </div>
        </div>

        {/* Center: Compact Profile Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={onOpenProfileModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-xs font-semibold text-text transition-colors min-h-[44px] cursor-pointer"
            aria-label="Open startup profile"
            title="Configure active venture targeting"
          >
            <span className="w-2 h-2 rounded-full bg-ok shrink-0" />
            <span className="truncate max-w-[220px]">
              {profile.startupName || "Startup"} · {profile.sector}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
          </button>
        </div>

        {/* Right Actions: Search (⌘K), Copilot, Bell, Overflow Menu */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut */}
          <button
            onClick={onQuickSearch}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px] cursor-pointer"
            title="Search schemes (Ctrl+K / ⌘K)"
            aria-label="Quick Search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-surface text-muted rounded border border-border">
              ⌘K
            </kbd>
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-contrast hover:opacity-90 text-xs font-semibold shadow-xs transition-opacity min-h-[44px] cursor-pointer"
            aria-label="Open Policy Copilot"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Notification Bell (No pulse animation; dot hidden when unreadCount === 0) */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface border border-border text-text transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Real-time policy alerts & deadlines"
              aria-label={`View notifications (${unreadAlertsCount} unread)`}
            >
              <Bell className="w-4 h-4 text-muted hover:text-text" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent" />
              )}
            </button>
          )}

          {/* Overflow / Avatar Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
              aria-label="User and platform settings menu"
              aria-expanded={showMenu}
            >
              <User className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 ml-1 text-muted" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border shadow-xl py-1.5 z-50 text-xs animate-fadeIn">
                {/* Profile Mobile Shortcut */}
                <div className="px-3.5 py-2 border-b border-border md:hidden">
                  <div className="font-semibold text-text truncate">
                    {profile.startupName || "Startup"}
                  </div>
                  <div className="text-muted text-xs truncate">
                    {profile.sector} • {profile.state}
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenProfileModal();
                    }}
                    className="mt-1.5 text-accent hover:underline font-semibold block"
                  >
                    Edit Profile &rarr;
                  </button>
                </div>

                {/* Tour */}
                {onOpenTour && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenTour();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-text hover:bg-surface-2 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-accent" />
                    <span>Take Platform Tour</span>
                  </button>
                )}

                {/* One-Pager */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenOnePagerModal();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-text hover:bg-surface-2 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-accent" />
                  <span>Download One-Pager</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-text hover:bg-surface-2 flex items-center justify-between min-h-[44px] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-accent" />}
                    <span>Theme</span>
                  </div>
                  <span className="text-muted capitalize">{isDark ? "Dark" : "Light"}</span>
                </button>

                <div className="my-1 border-t border-border" />

                {/* Sign Out */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-danger hover:bg-danger/10 flex items-center gap-2.5 min-h-[44px] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
