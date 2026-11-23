"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Bell, ExternalLink, Clock, Filter } from "lucide-react";
import { Scheme } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import notificationsData from "@/data/notifications.json";
import { formatInrCapital } from "@/lib/roadmapEngine";

interface PolicyAlertItem {
  id: string;
  title: string;
  ministry: string;
  deadlineDisplay: string;
  deadlineDate?: Date | null;
  desc: string;
  type: string;
  portalUrl: string;
  isExpired: boolean;
  fundingDisplay?: string;
  geographicScope: string;
}

interface Props {
  schemes: Scheme[];
  onSelectScheme?: (scheme: Scheme) => void;
  onOpenNotificationDrawer?: () => void;
  onNavigateToSchemes?: () => void;
}

export function PolicyUpdatesView({
  schemes,
  onSelectScheme,
  onOpenNotificationDrawer,
  onNavigateToSchemes
}: Props) {
  const [remoteAlerts, setRemoteAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch /alerts/recent if backend is available
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
    if (!apiBase) return;

    let isMounted = true;
    setLoading(true);

    fetch(`${apiBase}/alerts/recent?days=30`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data && Array.isArray(data.alerts)) {
          setRemoteAlerts(data.alerts);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Synthesize alerts strictly from application_deadline, /alerts/recent, and notifications data
  // REMOVE all expired dates (e.g. any deadline prior to current time)
  const activeAlerts = useMemo<PolicyAlertItem[]>(() => {
    const now = new Date();
    const alertList: PolicyAlertItem[] = [];
    const seenTitles = new Set<string>();

    // Helper to check if a date string is expired
    const parseAndCheckExpired = (dateStr?: string | null): { isExpired: boolean; date: Date | null; display: string } => {
      if (!dateStr) return { isExpired: false, date: null, display: "Rolling Intake / Open" };
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        // e.g. "Rolling / Open All Year"
        return { isExpired: false, date: null, display: dateStr };
      }
      const isPast = parsed < now;
      const daysLeft = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const display = daysLeft > 0 ? `Closes in ${daysLeft} days (${parsed.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })})` : "Deadline passed";
      return { isExpired: isPast, date: parsed, display };
    };

    // 1. Ingest from real schemes data having application_deadline
    schemes.forEach(s => {
      if (s.application_deadline) {
        const { isExpired, date, display } = parseAndCheckExpired(s.application_deadline);
        if (!isExpired && !seenTitles.has(s.scheme_name.toLowerCase())) {
          seenTitles.add(s.scheme_name.toLowerCase());
          alertList.push({
            id: s.id || `scheme-alert-${s.scheme_name}`,
            title: s.scheme_name,
            ministry: s.ministry || "Government of India",
            deadlineDisplay: display,
            deadlineDate: date,
            desc: s.nlp_summary || "Active central grant call for verified Indian innovative enterprises.",
            type: s.funding_type || "Central Grant",
            portalUrl: s.application_portal || s.source_url || "https://www.startupindia.gov.in",
            isExpired: false,
            fundingDisplay: formatInrCapital(s.max_funding_amount),
            geographicScope: s.geographic_restriction || "Pan-India"
          });
        }
      }
    });

    // 2. Ingest from notifications.json (filter out expired deadlines)
    notificationsData.forEach(n => {
      const { isExpired, date, display } = parseAndCheckExpired(n.deadline);
      if (!isExpired && !seenTitles.has(n.title.toLowerCase())) {
        seenTitles.add(n.title.toLowerCase());
        alertList.push({
          id: n.id,
          title: n.title,
          ministry: n.state !== "Pan-India" ? `${n.state} State Innovation Mission` : "Central Department / Ministry",
          deadlineDisplay: display,
          deadlineDate: date,
          desc: n.message,
          type: n.category || "Policy Notice",
          portalUrl: n.link || "https://www.startupindia.gov.in",
          isExpired: false,
          geographicScope: n.state || "Pan-India"
        });
      }
    });

    // 3. Ingest remote alerts from /alerts/recent if present
    remoteAlerts.forEach((ra, rIdx) => {
      const title = ra.scheme_name || ra.title || "Policy Update";
      if (!seenTitles.has(title.toLowerCase())) {
        const { isExpired, date, display } = parseAndCheckExpired(ra.deadline);
        if (!isExpired) {
          seenTitles.add(title.toLowerCase());
          alertList.push({
            id: ra.id || `remote-${rIdx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            title,
            ministry: ra.ministry || "Ministry Notification",
            deadlineDisplay: display,
            deadlineDate: date,
            desc: ra.change_summary || ra.description || "Policy modification published in official gazette.",
            type: "Gazette Update",
            portalUrl: ra.source_url || "https://www.startupindia.gov.in",
            isExpired: false,
            geographicScope: ra.geographic_restriction || "Pan-India"
          });
        }
      }
    });

    // Sort: items with closest active deadline first, then rolling
    alertList.sort((a, b) => {
      if (a.deadlineDate && b.deadlineDate) {
        return a.deadlineDate.getTime() - b.deadlineDate.getTime();
      }
      if (a.deadlineDate) return -1;
      if (b.deadlineDate) return 1;
      return 0;
    });

    return alertList;
  }, [schemes, remoteAlerts]);

  // Filtered by selected type
  const filteredAlerts = useMemo(() => {
    if (filterType === "all") return activeAlerts;
    return activeAlerts.filter(a => a.type.toLowerCase().includes(filterType.toLowerCase()));
  }, [activeAlerts, filterType]);

  return (
    <div className="space-y-6 animate-fadeIn text-text">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight font-headline">
              Live Policy & Deadline Alerts
            </h1>
            <Chip variant="met" size="sm" label="Active Deadlines Only" />
          </div>
          <p className="text-xs text-muted">
            Continuously reconciled with official gazettes and portal intakes. Expired application deadlines are automatically pruned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNotificationDrawer && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenNotificationDrawer}
            >
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              <span>Open Alert Drawer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-muted font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3 text-accent" /> Filter:
        </span>
        {[
          { id: "all", label: "All Active Notices" },
          { id: "grant", label: "Grants & Calls" },
          { id: "state", label: "State Policies" },
          { id: "update", label: "Gazette Updates" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === tab.id
                ? "bg-accent text-accent-contrast border-accent"
                : "bg-surface text-muted border-border hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-5 bg-surface border-border space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          title="No active deadlines matching your filter"
          message="All past deadlines have been pruned. Check back for upcoming policy call announcements."
          action={{
            label: "Reset Filter",
            onClick: () => setFilterType("all")
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map(alert => (
            <Card
              key={alert.id}
              className="p-5 bg-surface border-border hover:border-accent transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Chip variant="info" size="sm" label={alert.type} />
                    <span className="text-[11px] text-muted font-medium">📍 {alert.geographicScope}</span>
                  </div>
                  <span className="text-xs font-bold text-ok flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.deadlineDisplay}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-text leading-snug">
                  {alert.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted leading-relaxed mt-1.5">
                  {alert.desc}
                </p>
              </div>

              {/* Bottom Details & Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="text-muted truncate max-w-[200px]">
                  {alert.ministry}
                </div>
                <div className="flex items-center gap-2">
                  {onSelectScheme && (() => {
                    const found = schemes.find(s => s.scheme_name.toLowerCase() === alert.title.toLowerCase() || s.id === alert.id);
                    if (found) {
                      return (
                        <button
                          onClick={() => onSelectScheme(found)}
                          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                        >
                          Dossier &rarr;
                        </button>
                      );
                    }
                    return null;
                  })()}
                  {onNavigateToSchemes && (
                    <button
                      onClick={onNavigateToSchemes}
                      className="text-xs font-semibold text-muted hover:text-text cursor-pointer"
                    >
                      Registry &rarr;
                    </button>
                  )}
                  <a
                    href={alert.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-md bg-surface-2 border border-border text-xs font-semibold text-text hover:bg-border transition-colors inline-flex items-center gap-1"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3 text-muted" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
