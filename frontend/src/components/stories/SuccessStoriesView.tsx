"use client";

import React, { useState, useMemo } from "react";
import { 
  Award, 
  Sparkles, 
  Building2, 
  Coins, 
  ExternalLink, 
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import successStoriesData from "@/data/success_stories.json";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

interface SuccessStory {
  id: string;
  venture_name: string;
  founders: string;
  scheme_name: string;
  ministry: string;
  funding_type: string;
  grant_amount_inr?: number;
  grant_amount_display: string;
  state: string;
  sector: string;
  impact_highlight: string;
  description: string;
  logo_icon: string;
  year: number;
}

interface Props {
  onSelectSchemeByName?: (schemeName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export function SuccessStoriesView({ onSelectSchemeByName, onNavigateTab }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedState, setSelectedState] = useState("All");

  const sectors = useMemo(() => {
    const set = new Set<string>();
    successStoriesData.forEach(s => {
      s.sector.split("&").forEach(sec => set.add(sec.trim()));
    });
    return ["All", "AgriTech", "CleanTech", "DeepTech", "HealthTech", "BioTech", "SpaceTech", "MSME", "SaaS"];
  }, []);

  const filteredStories = useMemo(() => {
    return (successStoriesData as SuccessStory[]).filter(story => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        story.venture_name.toLowerCase().includes(q) ||
        story.founders.toLowerCase().includes(q) ||
        story.scheme_name.toLowerCase().includes(q) ||
        story.ministry.toLowerCase().includes(q) ||
        story.impact_highlight.toLowerCase().includes(q);

      const matchesSector = selectedSector === "All" || 
        story.sector.toLowerCase().includes(selectedSector.toLowerCase());

      const matchesState = selectedState === "All" || 
        story.state.toLowerCase() === selectedState.toLowerCase();

      return matchesSearch && matchesSector && matchesState;
    });
  }, [searchQuery, selectedSector, selectedState]);

  return (
    <div className="space-y-6 animate-fadeIn text-text pb-12">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent border border-accent/20 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>36 Verified Government Venture Case Studies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Startup & MSME Success Stories
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-muted leading-relaxed">
            Real Indian founders who leveraged non-dilutive central and state schemes—from early ₹10L prototype grants to ₹10 Cr credit guarantees—to build category-defining ventures.
          </p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-surface-raised border border-border">
              <span className="text-xs text-text-muted block">Total Catalog</span>
              <span className="text-xl font-bold text-accent">36 Ventures</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-raised border border-border">
              <span className="text-xs text-text-muted block">Capital Unlocked</span>
              <span className="text-xl font-bold text-ok">₹450+ Cr</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-raised border border-border">
              <span className="text-xs text-text-muted block">Sectors Covered</span>
              <span className="text-xl font-bold text-text">9+ Domains</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-raised border border-border">
              <span className="text-xs text-text-muted block">States Represented</span>
              <span className="text-xl font-bold text-text">14 States</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by venture, founder, scheme (e.g. BIRAC, Skyroot, SISFS, PRAYAS)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg bg-surface-raised border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSector === sec
                  ? "bg-accent text-white"
                  : "bg-surface-raised text-text-muted hover:text-text border border-border"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col rounded-xl border border-border bg-surface hover:border-accent/40 transition-all p-5 shadow-sm group"
          >
            {/* Top row: Avatar & Scheme */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-xl shrink-0">
                  {story.logo_icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">
                    {story.venture_name}
                  </h3>
                  <p className="text-xs text-text-muted">{story.founders}</p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-md text-xs font-bold bg-ok-soft text-ok border border-ok/20 whitespace-nowrap">
                {story.grant_amount_display}
              </div>
            </div>

            {/* Impact Quote */}
            <div className="p-3 rounded-lg bg-surface-raised border border-border text-xs text-accent font-medium mb-3">
              "{story.impact_highlight}"
            </div>

            {/* Scheme utilized badge */}
            <div className="mb-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
                <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">{story.scheme_name}</span>
              </div>
              <p className="text-[11px] text-text-muted truncate">{story.ministry}</p>
            </div>

            {/* Narrative text */}
            <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4 flex-1">
              {story.description}
            </p>

            {/* Footer tags & action */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-auto text-xs">
              <div className="flex items-center gap-2 text-text-muted text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {story.state}
                </span>
                <span>•</span>
                <span>{story.year}</span>
              </div>

              {onSelectSchemeByName && (
                <button
                  onClick={() => onSelectSchemeByName(story.scheme_name)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  <span>View Scheme</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border p-8">
          <p className="text-sm text-text-muted">No success stories match "{searchQuery}" in {selectedSector}.</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedSector("All"); }}
            className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
