"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import notificationsData from "@/data/notifications.json";

export interface SchemeNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  tag: string;
  sector: string;
  state: string;
  date: string;
  deadline: string;
  link: string;
  isNew: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userSector?: string;
  userState?: string;
  suppressPopups?: boolean;
}

export function NotificationDrawer({ isOpen, onClose, userSector, userState }: Props) {
  const [notifications, setNotifications] = useState<SchemeNotification[]>(notificationsData);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("govdash_read_notifs");
      if (saved) setReadIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const markAsRead = (id: string) => {
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    try {
      localStorage.setItem("govdash_read_notifs", JSON.stringify(Array.from(updated)));
    } catch {}
  };

  const markAllAsRead = () => {
    const all = new Set(notifications.map(n => n.id));
    setReadIds(all);
    try {
      localStorage.setItem("govdash_read_notifs", JSON.stringify(Array.from(all)));
    } catch {}
  };

  // Sort: matching sector/state first
  const sortedNotifs = [...notifications].sort((a, b) => {
    const aMatch = (userSector && a.sector.toLowerCase().includes(userSector.toLowerCase())) || (userState && a.state.toLowerCase().includes(userState.toLowerCase()));
    const bMatch = (userSector && b.sector.toLowerCase().includes(userSector.toLowerCase())) || (userState && b.state.toLowerCase().includes(userState.toLowerCase()));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const unreadCount = sortedNotifs.filter(n => !readIds.has(n.id)).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Policy Alerts & Deadlines
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time scheme openings & Gazette updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {sortedNotifs.map((n) => {
              const isRead = readIds.has(n.id);
              const isRelevant = (userSector && n.sector.toLowerCase().includes(userSector.toLowerCase())) || (userState && n.state.toLowerCase().includes(userState.toLowerCase()));

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isRead
                      ? "bg-slate-900/40 border-slate-800/80 opacity-75"
                      : "bg-slate-800/60 border-slate-700/80 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {n.category}
                    </span>
                    {isRelevant && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ⚡ Highly Relevant
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">{n.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Clock className="w-3 h-3" /> Deadline: {n.deadline}
                    </span>
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-800 text-center text-[10px] text-slate-500 bg-slate-900/80">
            Automated alerts synced daily with the official Gazette of India at 09:00 AM IST.
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Non-Intrusive Floating Toast Component ─────────────────────────────────────
export function FloatingNotificationToast({
  suppress = false,
  userSector,
  onOpenDrawer
}: {
  suppress?: boolean;
  userSector?: string;
  onOpenDrawer: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [topAlert, setTopAlert] = useState<SchemeNotification | null>(null);

  useEffect(() => {
    if (suppress) return;
    const dismissed = sessionStorage.getItem("govdash_toast_dismissed");
    if (dismissed) return;

    // Pick top relevant notification
    const matched = notificationsData.find(n => n.isNew && (!userSector || n.sector.toLowerCase().includes(userSector.toLowerCase()))) || notificationsData[0];
    setTopAlert(matched);

    const timer = setTimeout(() => {
      setVisible(true);
    }, 2500); // Wait 2.5s after load so user is not bombarded

    return () => clearTimeout(timer);
  }, [suppress, userSector]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("govdash_toast_dismissed", "true");
  };

  if (!visible || !topAlert || suppress) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full p-4 rounded-2xl bg-slate-900/95 border border-blue-500/30 text-white shadow-2xl backdrop-blur-xl animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              New Scheme Call Live
            </span>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-xs font-bold leading-snug">{topAlert.title}</h4>
          <p className="text-[11px] text-slate-300 leading-tight line-clamp-2">
            {topAlert.message}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                handleDismiss();
                onOpenDrawer();
              }}
              className="text-blue-400 font-bold hover:underline"
            >
              View all policy updates &rarr;
            </button>
            <a
              href={topAlert.link}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-colors"
            >
              Apply
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
