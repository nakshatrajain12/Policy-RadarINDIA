"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";

export interface StateData {
  state: string;
  scheme_count: number;
  is_pan_india?: boolean;
  top_scheme?: string;
  top_cap?: string;
}

interface Props {
  data: StateData[];
  selectedState?: string | null;
  userState?: string;
  onSelectState?: (stateName: string) => void;
}

// 8x8 Grid of Indian States & UTs preserving relative geographic topology
interface StateTileConfig {
  code: string;
  name: string;
  col: number;
  row: number;
}

const INDIA_TILES: StateTileConfig[] = [
  // Row 0: Far North
  { code: "JK", name: "Jammu and Kashmir", col: 1, row: 0 },
  { code: "LA", name: "Ladakh", col: 2, row: 0 },

  // Row 1: North
  { code: "PB", name: "Punjab", col: 1, row: 1 },
  { code: "HP", name: "Himachal Pradesh", col: 2, row: 1 },
  { code: "UK", name: "Uttarakhand", col: 3, row: 1 },

  // Row 2: Upper Plains & Eastern Gateway
  { code: "HR", name: "Haryana", col: 1, row: 2 },
  { code: "DL", name: "Delhi", col: 2, row: 2 },
  { code: "UP", name: "Uttar Pradesh", col: 3, row: 2 },
  { code: "BR", name: "Bihar", col: 4, row: 2 },
  { code: "SK", name: "Sikkim", col: 5, row: 2 },
  { code: "AS", name: "Assam", col: 6, row: 2 },
  { code: "AR", name: "Arunachal Pradesh", col: 7, row: 2 },

  // Row 3: West-Central to North East
  { code: "RJ", name: "Rajasthan", col: 1, row: 3 },
  { code: "MP", name: "Madhya Pradesh", col: 2, row: 3 },
  { code: "JH", name: "Jharkhand", col: 3, row: 3 },
  { code: "WB", name: "West Bengal", col: 4, row: 3 },
  { code: "ML", name: "Meghalaya", col: 6, row: 3 },
  { code: "NL", name: "Nagaland", col: 7, row: 3 },

  // Row 4: Western & Central Corridors
  { code: "GJ", name: "Gujarat", col: 0, row: 4 },
  { code: "MH", name: "Maharashtra", col: 1, row: 4 },
  { code: "CG", name: "Chhattisgarh", col: 2, row: 4 },
  { code: "OD", name: "Odisha", col: 3, row: 4 },
  { code: "MN", name: "Manipur", col: 7, row: 4 },

  // Row 5: South-Central & Far East
  { code: "GA", name: "Goa", col: 0, row: 5 },
  { code: "TS", name: "Telangana", col: 2, row: 5 },
  { code: "AP", name: "Andhra Pradesh", col: 3, row: 5 },
  { code: "TR", name: "Tripura", col: 6, row: 5 },
  { code: "MZ", name: "Mizoram", col: 7, row: 5 },

  // Row 6: Deep South
  { code: "KA", name: "Karnataka", col: 1, row: 6 },
  { code: "TN", name: "Tamil Nadu", col: 2, row: 6 },
  { code: "PY", name: "Puducherry", col: 3, row: 6 },

  // Row 7: Southern Tip & Islands
  { code: "KL", name: "Kerala", col: 1, row: 7 },
  { code: "AN", name: "Andaman & Nicobar", col: 6, row: 7 }
];

export function IndiaStateTileMap({ data, selectedState, userState, onSelectState }: Props) {
  const [hoveredTile, setHoveredTile] = useState<{
    tile: StateTileConfig;
    count: number;
    topScheme: string;
    topCap: string;
    x: number;
    y: number;
  } | null>(null);

  // Map state name to record
  const stateMap = new Map<string, StateData>();
  data.forEach((d) => {
    stateMap.set(d.state.toLowerCase().trim(), d);
  });

  // Calculate maximum count for scaling (exclude Pan-India from map tiles)
  const regionalCounts = data.filter((d) => !d.is_pan_india).map((d) => d.scheme_count);
  const maxCount = Math.max(...regionalCounts, 1);

  // 5-Step sequential token color palette (light/dark accessible)
  const getTileStyles = (count: number, isUser: boolean, isSelected: boolean) => {
    let bg = "bg-surface-2 text-muted border-border";
    if (count > 0) {
      const ratio = count / maxCount;
      if (ratio > 0.7) {
        bg = "bg-accent text-accent-contrast border-accent font-bold";
      } else if (ratio > 0.45) {
        bg = "bg-accent/80 text-accent-contrast border-accent/80 font-bold";
      } else if (ratio > 0.25) {
        bg = "bg-accent/40 text-text border-accent/50 font-semibold";
      } else {
        bg = "bg-accent/15 text-text border-accent/30 font-medium";
      }
    }

    const ring = isSelected
      ? "ring-2 ring-accent ring-offset-1 ring-offset-surface scale-105 z-10"
      : isUser
      ? "ring-2 ring-ok ring-offset-1 ring-offset-surface z-10"
      : "";

    return `${bg} ${ring}`;
  };

  return (
    <div className="relative w-full">
      {/* Pan-India Banner */}
      {(() => {
        const panIndia = data.find((d) => d.is_pan_india);
        if (!panIndia) return null;
        return (
          <div className="mb-3 px-3 py-2 rounded-lg bg-surface-2 border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>Pan-India Programs (Central Ministries)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-accent font-mono">{panIndia.scheme_count} Schemes</span>
              <span className="text-[11px] text-muted">Accessible nationwide</span>
            </div>
          </div>
        );
      })()}

      {/* 8x8 State Grid */}
      <div className="grid grid-cols-8 gap-1.5 p-2 bg-surface rounded-xl border border-border">
        {Array.from({ length: 64 }).map((_, index) => {
          const col = index % 8;
          const row = Math.floor(index / 8);
          const tile = INDIA_TILES.find((t) => t.col === col && t.row === row);

          if (!tile) {
            return <div key={`empty-${index}`} className="h-10 sm:h-12 opacity-0 pointer-events-none" />;
          }

          const stateRecord = stateMap.get(tile.name.toLowerCase().trim());
          const count = stateRecord?.scheme_count || 0;
          const isUser = userState?.toLowerCase().trim() === tile.name.toLowerCase().trim();
          const isSelected = selectedState?.toLowerCase().trim() === tile.name.toLowerCase().trim();

          return (
            <button
              key={tile.code}
              type="button"
              onClick={() => onSelectState?.(tile.name)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTile({
                  tile,
                  count,
                  topScheme: stateRecord?.top_scheme || "Central Mission Programs",
                  topCap: stateRecord?.top_cap || "Variable",
                  x: rect.left + rect.width / 2,
                  y: rect.top
                });
              }}
              onMouseLeave={() => setHoveredTile(null)}
              className={`h-10 sm:h-12 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer p-0.5 text-center select-none ${getTileStyles(
                count,
                isUser,
                isSelected
              )}`}
              title={`${tile.name}: ${count} schemes`}
              aria-label={`${tile.name}: ${count} schemes`}
            >
              <span className="text-[10px] sm:text-xs tracking-wider leading-none">{tile.code}</span>
              <span className="text-[9px] sm:text-[10px] mt-0.5 opacity-90 leading-none">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Sequential Color Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted px-1">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-xs ring-2 ring-ok" />
          <span>Your Registered State</span>
        </span>

        <div className="flex items-center gap-1.5">
          <span>Density:</span>
          <span className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[10px]">0</span>
          <span className="px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-[10px]">1-5</span>
          <span className="px-1.5 py-0.5 rounded bg-accent/40 border border-accent/50 text-[10px]">6-10</span>
          <span className="px-1.5 py-0.5 rounded bg-accent/80 text-accent-contrast text-[10px]">11-18</span>
          <span className="px-1.5 py-0.5 rounded bg-accent text-accent-contrast text-[10px]">19+</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredTile && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-2 rounded-lg bg-surface border border-border shadow-lg text-xs space-y-1 text-text min-w-[180px] max-w-[260px] animate-fadeIn"
          style={{ left: hoveredTile.x, top: hoveredTile.y - 6 }}
        >
          <div className="font-bold text-accent flex items-center justify-between">
            <span>{hoveredTile.tile.name}</span>
            <span className="text-muted font-mono">{hoveredTile.count} Schemes</span>
          </div>
          <div className="text-[11px] text-muted border-t border-border pt-1">
            <span className="font-semibold text-text">Top Scheme:</span> {hoveredTile.topScheme}
          </div>
          <div className="text-[10px] text-ok font-semibold">Max Cap: {hoveredTile.topCap}</div>
        </div>
      )}
    </div>
  );
}
