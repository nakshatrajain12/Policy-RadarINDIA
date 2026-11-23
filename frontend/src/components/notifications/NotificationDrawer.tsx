"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  ExternalLink, 
  Clock, 
  Sparkles
} from "lucide-react";
import notificationsData from "@/data/notifications.json";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";

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
  const [notifications] = useState<SchemeNotification[]>(notificationsData);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border shadow-xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  Policy Alerts & Deadlines
                  {unreadCount > 0 && (
                    <Chip variant="info" size="sm">
                      {unreadCount} New
                    </Chip>
                  )}
                </h3>
                <p className="text-xs text-muted">
                  Real-time scheme openings & Gazette updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="min-h-[44px] px-2 text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close notification drawer"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-text rounded-lg hover:bg-surface transition-colors cursor-pointer"
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
                <Card
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 border transition-all cursor-pointer ${
                    isRead
                      ? "bg-surface-2/60 border-border opacity-70"
                      : "bg-surface border-border shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Chip variant="info" size="sm">{n.category}</Chip>
                    {isRelevant && (
                      <Chip variant="met" size="sm">⚡ Highly Relevant</Chip>
                    )}
                    <span className="text-xs text-muted">{n.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-text mb-1 leading-snug">
                    {n.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed mb-2.5">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted">
                    <span className="flex items-center gap-1 text-warn font-medium">
                      <Clock className="w-3.5 h-3.5" /> Deadline: {n.deadline}
                    </span>
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[44px] px-2 inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="p-3 border-t border-border text-center text-xs text-muted bg-surface-2">
            Automated alerts synced daily with the official Gazette of India.
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

    const matched = notificationsData.find(n => n.isNew && (!userSector || n.sector.toLowerCase().includes(userSector.toLowerCase()))) || notificationsData[0];
    setTopAlert(matched);

    const timer = setTimeout(() => {
      setVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [suppress, userSector]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("govdash_toast_dismissed", "true");
  };

  if (!visible || !topAlert || suppress) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full p-4 rounded-xl bg-surface border border-accent/40 text-text shadow-xl animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-warn">
              New Scheme Call Live
            </span>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-text cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-xs font-bold leading-snug">{topAlert.title}</h4>
          <p className="text-xs text-muted leading-tight line-clamp-2">
            {topAlert.message}
          </p>
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                handleDismiss();
                onOpenDrawer();
              }}
              className="text-accent font-semibold hover:underline cursor-pointer"
            >
              View all policy updates &rarr;
            </button>
            <a
              href={topAlert.link}
              target="_blank"
              rel="noreferrer"
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-accent text-accent-contrast text-xs font-semibold inline-flex items-center"
            >
              Apply
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
