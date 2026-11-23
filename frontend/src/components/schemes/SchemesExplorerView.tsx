"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  LayoutGrid, 
  List, 
  Download, 
  Scale, 
  Check, 
  X, 
  Info,
  ShieldCheck,
  Layers
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { SchemeComparisonModal } from "./SchemeComparisonModal";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

interface Props {
  schemes: Scheme[];
  onSelectScheme: (scheme: Scheme) => void;
  userProfile?: FounderProfile;
}

export function SchemesExplorerView({ schemes, onSelectScheme, userProfile }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedGeo, setSelectedGeo] = useState("All");
  const [selectedFundingType, setSelectedFundingType] = useState("All");
  const [dpiitFilter, setDpiitFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"funding_desc" | "funding_asc" | "name">("funding_desc");

  // Comparison State
  const [compareList, setCompareList] = useState<Scheme[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareWarning, setCompareWarning] = useState<string | null>(null);

  // Extract distinct sectors and states
  const sectorsList = useMemo(() => {
    return [
      "All", "AgriTech", "AI / Machine Learning", "CleanTech & Renewable", 
      "HealthTech & MedTech", "DeepTech & Hardware", "FinTech & InsurTech", 
      "Defence & Aerospace", "SaaS & Enterprise", "Semiconductors", "Food Processing"
    ];
  }, []);

  const stagesList = ["All", "Idea", "Prototype/MVP", "Early Revenue", "Growth/Scale-up"];

  const geosList = useMemo(() => {
    const geos = new Set<string>();
    geos.add("All");
    geos.add("Pan-India");
    schemes.forEach((s) => {
      const g = s.geographic_restriction;
      if (g && !g.toLowerCase().includes("pan")) {
        geos.add(g);
      }
    });
    return Array.from(geos);
  }, [schemes]);

  // Filtering Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const inName = s.scheme_name.toLowerCase().includes(query);
        const inMin = (s.ministry || "").toLowerCase().includes(query);
        const inDesc = (s.nlp_summary || "").toLowerCase().includes(query);
        if (!inName && !inMin && !inDesc) return false;
      }

      if (selectedSector !== "All") {
        const secStr = String(s.sector_eligibility || "").toLowerCase();
        const target = selectedSector.toLowerCase().split(" ")[0];
        if (!secStr.includes("all") && !secStr.includes(target)) return false;
      }

      if (selectedStage !== "All") {
        const stStr = String(s.startup_stage || "").toLowerCase();
        const target = selectedStage.toLowerCase();
        if (!stStr.includes(target) && !stStr.includes("all")) return false;
      }

      if (selectedGeo !== "All") {
        const geoStr = (s.geographic_restriction || "").toLowerCase();
        if (selectedGeo === "Pan-India") {
          if (!geoStr.includes("pan")) return false;
        } else {
          if (!geoStr.includes(selectedGeo.toLowerCase())) return false;
        }
      }

      if (selectedFundingType !== "All") {
        const ftype = (s.funding_type || "").toLowerCase();
        if (!ftype.includes(selectedFundingType.toLowerCase())) return false;
      }

      if (dpiitFilter === "required" && !s.dpiit_required) return false;
      if (dpiitFilter === "not_required" && s.dpiit_required) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "funding_desc") {
        return (b.max_funding_amount || 0) - (a.max_funding_amount || 0);
      }
      if (sortBy === "funding_asc") {
        return (a.max_funding_amount || 0) - (b.max_funding_amount || 0);
      }
      return a.scheme_name.localeCompare(b.scheme_name);
    });
  }, [schemes, searchTerm, selectedSector, selectedStage, selectedGeo, selectedFundingType, dpiitFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSector("All");
    setSelectedStage("All");
    setSelectedGeo("All");
    setSelectedFundingType("All");
    setDpiitFilter("All");
    setSortBy("funding_desc");
  };

  const toggleCompare = (scheme: Scheme, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareWarning(null);

    const exists = compareList.some((s) => s.id === scheme.id);
    if (exists) {
      setCompareList(compareList.filter((s) => s.id !== scheme.id));
    } else {
      if (compareList.length >= 3) {
        setCompareWarning("You can compare up to 3 schemes at a time. Remove one to add this scheme.");
        setTimeout(() => setCompareWarning(null), 4000);
        return;
      }
      setCompareList([...compareList, scheme]);
    }
  };

  const removeCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareList(compareList.filter((s) => s.id !== id));
  };

  const handleExportCSV = () => {
    const headers = [
      "Scheme Name",
      "Ministry / Agency",
      "Grant Type & Structure",
      "Individual Startup Grant / Ticket",
      "Program Macro Ceiling (INR)",
      "Sector Scope",
      "Target Startup Stage",
      "Geographic Scope",
      "DPIIT Required",
      "Official Application URL"
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredSchemes.map((s) => {
      const details = formatSchemeGrantDetails(s);
      return [
        escapeCsv(s.scheme_name),
        escapeCsv(s.ministry || "Government Department"),
        escapeCsv(details.grantTypeBadge),
        escapeCsv(details.individualTicket),
        s.max_funding_amount || 0,
        escapeCsv(Array.isArray(s.sector_eligibility) ? s.sector_eligibility.join(", ") : s.sector_eligibility || "All Sectors"),
        escapeCsv(Array.isArray(s.startup_stage) ? s.startup_stage.join(", ") : s.startup_stage || "All Stages"),
        escapeCsv(s.geographic_restriction || "Pan-India"),
        s.dpiit_required ? "Yes" : "No",
        escapeCsv(s.source_url || "")
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(",")].concat(rows.map(r => r.join(","))).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GOV-DASH_Indian_Startup_Schemes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const defaultProfile: FounderProfile = userProfile || {
    startupName: "Innovative Startup",
    sector: "AgriTech",
    stage: "Idea",
    state: "Karnataka",
    dpiitRegistered: false,
    womenLed: false,
    entityType: "unregistered_idea"
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 text-text">
      {/* ── Explorer Header & Search Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight font-headline">
            Central & State Schemes Explorer
          </h1>
          <p className="mt-1 text-xs text-muted">
            Comprehensive verified database of {schemes.length || 193} Indian government funding frameworks. Select any 2 or 3 schemes to compare side-by-side.
          </p>
        </div>

        {/* View Mode & Export Actions */}
        <div className="flex items-center gap-2.5">
          {compareList.length >= 2 && (
            <Button
              variant="primary"
              onClick={() => setShowCompareModal(true)}
            >
              <Scale className="w-4 h-4 mr-1.5" />
              Compare ({compareList.length})
            </Button>
          )}

          <div className="flex items-center bg-surface-2 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Card Grid View"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-accent text-accent-contrast shadow-sm" : "text-muted hover:text-text"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              aria-label="Table View"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-accent text-accent-contrast shadow-sm" : "text-muted hover:text-text"
              }`}
              title="Terminal Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={handleExportCSV}
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-accent" />
            Export CSV ({filteredSchemes.length})
          </Button>
        </div>
      </div>

      {/* ── Search & Filter Controls ───────────────── */}
      <Card className="p-4 sm:p-5 bg-surface border-border space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by scheme name, ministry, keywords (e.g. BIRAC, ELEVATE, drone, prototype)..."
              className="w-full min-h-[44px] pl-10 pr-10 py-2.5 bg-surface-2 border border-border rounded-lg text-xs sm:text-sm font-medium text-text placeholder-muted focus:outline-none focus:border-accent"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-60 shrink-0">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs sm:text-sm font-medium text-text focus:outline-none focus:border-accent"
            >
              <option value="funding_desc">Max Funding: High to Low</option>
              <option value="funding_asc">Max Funding: Low to High</option>
              <option value="name">Scheme Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
          {/* Sector Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full min-h-[44px] px-2.5 py-2 bg-surface-2 border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent"
            >
              {sectorsList.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full min-h-[44px] px-2.5 py-2 bg-surface-2 border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent"
            >
              {stagesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* State / UT Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              State / UT
            </label>
            <select
              value={selectedGeo}
              onChange={(e) => setSelectedGeo(e.target.value)}
              className="w-full min-h-[44px] px-2.5 py-2 bg-surface-2 border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent"
            >
              {geosList.map((geo) => (
                <option key={geo} value={geo}>{geo}</option>
              ))}
            </select>
          </div>

          {/* DPIIT Requirement */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              DPIIT Status
            </label>
            <select
              value={dpiitFilter}
              onChange={(e) => setDpiitFilter(e.target.value)}
              className="w-full min-h-[44px] px-2.5 py-2 bg-surface-2 border border-border rounded-lg text-xs text-text focus:outline-none focus:border-accent"
            >
              <option value="All">All Frameworks</option>
              <option value="not_required">No DPIIT Required (Open)</option>
              <option value="required">Requires DPIIT</option>
            </select>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
          <div className="text-xs font-medium">
            Showing <strong className="font-bold text-accent">{filteredSchemes.length}</strong> of <strong className="font-bold text-text">{schemes.length || 193}</strong> schemes
            {(selectedSector !== "All" || selectedStage !== "All" || selectedGeo !== "All" || searchTerm || dpiitFilter !== "All") && (
              <span className="text-warn ml-2 font-semibold">(filtered)</span>
            )}
          </div>
          {(selectedSector !== "All" || selectedStage !== "All" || selectedGeo !== "All" || searchTerm || dpiitFilter !== "All") && (
            <button
              onClick={resetFilters}
              className="min-h-[44px] px-2 text-xs font-semibold text-accent hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* ── Educational Banner ───────────── */}
      <Card className="p-3.5 bg-surface-2 border-border text-xs text-muted flex items-start gap-2.5">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-text">What is a Scheme Dossier?</strong> A verified government policy intelligence document containing full gazette rules, individual startup ticket sizes, required statutory documents, milestone tranches, and direct application links.
        </div>
      </Card>

      {/* ── Schemes Render: Grid or Table ────────────────────────────── */}
      {filteredSchemes.length === 0 ? (
        <Card className="p-12 text-center border-border bg-surface space-y-3">
          <Layers className="w-8 h-8 text-muted mx-auto" />
          <p className="text-xs text-muted">No schemes found matching the selected criteria.</p>
          <Button variant="primary" onClick={resetFilters}>
            Clear Filters
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme, idx) => {
            const details = formatSchemeGrantDetails(scheme);
            const isCompared = compareList.some((s) => s.id === scheme.id);

            return (
              <Card
                key={scheme.id || idx}
                onClick={() => onSelectScheme(scheme)}
                className={`group relative p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                  isCompared 
                    ? "border-accent bg-accent/5 ring-1 ring-accent" 
                    : "border-border bg-surface hover:border-accent"
                }`}
              >
                <div>
                  {/* Top Badges & Compare Toggle */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Chip variant="info" size="sm">
                        {details.grantTypeBadge}
                      </Chip>
                      {scheme.dpiit_required ? (
                        <Chip variant="warn" size="sm">
                          <ShieldCheck className="w-3 h-3 mr-1" /> DPIIT
                        </Chip>
                      ) : (
                        <Chip variant="met" size="sm">
                          Open
                        </Chip>
                      )}
                    </div>

                    {/* Compare Selection Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(scheme, e)}
                      className={`min-h-[44px] flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                        isCompared 
                          ? "bg-accent text-accent-contrast" 
                          : "bg-surface-2 border border-border text-muted hover:text-text"
                      }`}
                      title="Select for side-by-side comparison"
                    >
                      {isCompared ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-3.5 h-3.5" />
                          <span>Compare</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-accent transition-colors line-clamp-2 mb-1.5">
                    {scheme.scheme_name}
                  </h3>

                  {/* Ministry */}
                  <p className="text-xs text-muted line-clamp-1 mb-3">
                    {scheme.ministry || "Central Ministry / State Agency"}
                  </p>

                  {/* Detailed Funding Breakdown Box */}
                  <div className="p-3 rounded-lg bg-surface-2 border border-border mb-3 space-y-1">
                    <div className="text-xs uppercase font-semibold text-muted">
                      Individual Startup Grant
                    </div>
                    <div className="text-sm font-bold text-ok font-headline leading-tight">
                      {details.individualTicket}
                    </div>
                    {details.macroCeilingDisplay && (
                      <div className="text-xs text-muted pt-1 border-t border-border">
                        {details.macroCeilingDisplay}
                      </div>
                    )}
                  </div>

                  {/* Short Summary */}
                  <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
                    {scheme.nlp_summary || "Comprehensive central and state government financial assistance and support initiative."}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span className="truncate max-w-[140px]">
                    📍 {scheme.geographic_restriction || "Pan-India"}
                  </span>
                  <span className="font-semibold text-accent group-hover:underline flex items-center gap-1">
                    View Dossier →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text">
              <thead className="bg-surface-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-3 text-center w-16">Compare</th>
                  <th className="py-3 px-4">Scheme Name</th>
                  <th className="py-3 px-4">Ministry / Department</th>
                  <th className="py-3 px-4">Grant Type & Structure</th>
                  <th className="py-3 px-4 text-right">Individual Ticket</th>
                  <th className="py-3 px-4 text-center">Geography</th>
                  <th className="py-3 px-4 text-center">DPIIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-sans">
                {filteredSchemes.map((scheme, idx) => {
                  const details = formatSchemeGrantDetails(scheme);
                  const isCompared = compareList.some((s) => s.id === scheme.id);

                  return (
                    <tr
                      key={scheme.id || idx}
                      onClick={() => onSelectScheme(scheme)}
                      className={`hover:bg-surface-2/60 cursor-pointer transition-colors ${
                        isCompared ? "bg-accent/10" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(scheme)}
                          className="rounded text-accent focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-text max-w-xs truncate">
                        {scheme.scheme_name}
                      </td>
                      <td className="py-3 px-4 text-muted max-w-[200px] truncate">
                        {scheme.ministry || "Central Ministry"}
                      </td>
                      <td className="py-3 px-4">
                        <Chip variant="info" size="sm">{details.grantTypeBadge}</Chip>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-ok font-headline">
                        {details.individualTicket}
                      </td>
                      <td className="py-3 px-4 text-center text-muted text-xs">
                        {scheme.geographic_restriction || "Pan-India"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {scheme.dpiit_required ? (
                          <Chip variant="warn" size="sm">Required</Chip>
                        ) : (
                          <Chip variant="met" size="sm">Open</Chip>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Floating Comparison Dock (Sticky Bottom Bar, No Glass/Blur) ─────────────── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-full bg-surface border border-border p-3 sm:p-4 rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Selected Scheme Badges */}
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text shrink-0">
              <Scale className="w-4 h-4 text-accent" />
              <span>Compare ({compareList.length}/3):</span>
            </div>

            {compareList.map((s) => (
              <span 
                key={s.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 text-text border border-border text-xs font-medium max-w-[160px] truncate"
              >
                <span className="truncate">{s.scheme_name}</span>
                <button 
                  onClick={(e) => removeCompare(s.id, e)}
                  aria-label={`Remove ${s.scheme_name}`}
                  className="hover:text-danger p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {compareWarning && (
              <span className="text-xs font-medium text-danger ml-1">
                {compareWarning}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => setCompareList([])}
            >
              Clear
            </Button>

            <Button
              variant="primary"
              onClick={() => setShowCompareModal(true)}
              disabled={compareList.length < 2}
            >
              <Scale className="w-4 h-4 mr-1" />
              <span>{compareList.length < 2 ? "Select 1 more" : "Compare Now"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── Multiple Scheme Comparison Modal ─────────────────────────── */}
      <SchemeComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        schemes={compareList}
        userProfile={defaultProfile}
        onSelectScheme={(scheme) => onSelectScheme(scheme)}
      />
    </div>
  );
}
