"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  ExternalLink, 
  Coins, 
  Building2, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  X, 
  ArrowUpDown, 
  Download, 
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  Info,
  FileText
} from "lucide-react";
import { Scheme, FounderProfile } from "@/types";
import { SchemeComparisonModal } from "./SchemeComparisonModal";
import { formatSchemeGrantDetails } from "@/lib/schemeFormatters";

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
  const [dpiitFilter, setDpiitFilter] = useState("All"); // All | required | not_required
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
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const inName = s.scheme_name.toLowerCase().includes(query);
        const inMin = (s.ministry || "").toLowerCase().includes(query);
        const inDesc = (s.nlp_summary || "").toLowerCase().includes(query);
        if (!inName && !inMin && !inDesc) return false;
      }

      // Sector
      if (selectedSector !== "All") {
        const secStr = String(s.sector_eligibility || "").toLowerCase();
        const target = selectedSector.toLowerCase().split(" ")[0];
        if (!secStr.includes("all") && !secStr.includes(target)) return false;
      }

      // Stage
      if (selectedStage !== "All") {
        const stStr = String(s.startup_stage || "").toLowerCase();
        const target = selectedStage.toLowerCase();
        if (!stStr.includes(target) && !stStr.includes("all")) return false;
      }

      // Geo
      if (selectedGeo !== "All") {
        const geoStr = (s.geographic_restriction || "").toLowerCase();
        if (selectedGeo === "Pan-India") {
          if (!geoStr.includes("pan")) return false;
        } else {
          if (!geoStr.includes(selectedGeo.toLowerCase())) return false;
        }
      }

      // Funding Type
      if (selectedFundingType !== "All") {
        const ftype = (s.funding_type || "").toLowerCase();
        if (!ftype.includes(selectedFundingType.toLowerCase())) return false;
      }

      // DPIIT Filter
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

  // Compare Toggle Logic (2 to 3 schemes maximum)
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

  // Robust CSV Exporter with UTF-8 BOM
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
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* ── Explorer Header & Search Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight font-headline">
            Central & State Schemes Explorer
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Comprehensive verified database of {schemes.length || 193} Indian government funding frameworks. Select any 2 or 3 schemes to compare side-by-side.
          </p>
        </div>

        {/* View Mode & Export Actions */}
        <div className="flex items-center gap-2.5">
          {compareList.length >= 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all animate-bounce"
            >
              <Scale className="w-4 h-4" />
              Compare ({compareList.length})
            </button>
          )}

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
              title="Terminal Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Export CSV ({filteredSchemes.length})
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls (Font Size Fixed) ───────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by scheme name, ministry, keywords (e.g. BIRAC, ELEVATE, drone, prototype)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="funding_desc">Max Funding: High to Low</option>
              <option value="funding_asc">Max Funding: Low to High</option>
              <option value="name">Scheme Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid with Enhanced Font Sizes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
          {/* Sector Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {sectorsList.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {stagesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* State / UT Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              State / UT
            </label>
            <select
              value={selectedGeo}
              onChange={(e) => setSelectedGeo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {geosList.map((geo) => (
                <option key={geo} value={geo}>{geo}</option>
              ))}
            </select>
          </div>

          {/* DPIIT Requirement */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              DPIIT Status
            </label>
            <select
              value={dpiitFilter}
              onChange={(e) => setDpiitFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Frameworks</option>
              <option value="not_required">No DPIIT Required (Open)</option>
              <option value="required">Requires DPIIT</option>
            </select>
          </div>
        </div>

        {/* Filter Results Summary & Scheme Count Display */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-sm font-medium">
            Showing <strong className="font-extrabold text-blue-600 dark:text-blue-400">{filteredSchemes.length}</strong> of <strong className="font-extrabold text-slate-950 dark:text-white">{schemes.length || 193}</strong> schemes
            {(selectedSector !== "All" || selectedStage !== "All" || selectedGeo !== "All" || searchTerm || dpiitFilter !== "All") && (
              <span className="text-amber-600 dark:text-amber-400 ml-2 font-semibold">(filtered)</span>
            )}
          </div>
          {(selectedSector !== "All" || selectedStage !== "All" || selectedGeo !== "All" || searchTerm || dpiitFilter !== "All") && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-white underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Educational Banner: WHAT IS A SCHEME DOSSIER? ───────────── */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white">What is a Scheme Dossier?</strong> A verified government policy intelligence document containing full gazette rules, individual startup ticket sizes, required statutory documents, milestone tranches, and direct application links.
        </div>
      </div>

      {/* ── Schemes Render: Grid or Table ────────────────────────────── */}
      {filteredSchemes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-700 dark:text-slate-300">No schemes found matching the selected criteria.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme, idx) => {
            const details = formatSchemeGrantDetails(scheme);
            const isCompared = compareList.some((s) => s.id === scheme.id);

            return (
              <div
                key={scheme.id || idx}
                onClick={() => onSelectScheme(scheme)}
                className={`group relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCompared 
                    ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/40 shadow-lg" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
                }`}
              >
                <div>
                  {/* Top Badges & Compare Toggle Checkbox */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        {details.grantTypeBadge}
                      </span>
                      {scheme.dpiit_required ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> DPIIT
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Open
                        </span>
                      )}
                    </div>

                    {/* Compare Selection Checkbox / Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(scheme, e)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                        isCompared 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-500/10 hover:text-blue-600"
                      }`}
                      title="Select for side-by-side comparison (2-3 schemes)"
                    >
                      {isCompared ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-3 h-3" />
                          <span>Compare</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
                    {scheme.scheme_name}
                  </h3>

                  {/* Ministry */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                    {scheme.ministry || "Central Ministry / State Agency"}
                  </p>

                  {/* Detailed Funding Breakdown Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        Individual Startup Grant
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-headline leading-tight">
                      {details.individualTicket}
                    </div>
                    {details.macroCeilingDisplay && (
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        {details.macroCeilingDisplay}
                      </div>
                    )}
                  </div>

                  {/* Short Summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {scheme.nlp_summary || "Comprehensive central and state government financial assistance and support initiative."}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[140px] font-medium">
                    📍 {scheme.geographic_restriction || "Pan-India"}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                    View Scheme Dossier →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3 text-center w-16">Compare</th>
                  <th className="py-3 px-4">Scheme Name</th>
                  <th className="py-3 px-4">Ministry / Department</th>
                  <th className="py-3 px-4">Grant Type & Structure</th>
                  <th className="py-3 px-4 text-right">Individual Startup Ticket</th>
                  <th className="py-3 px-4 text-center">Geography</th>
                  <th className="py-3 px-4 text-center">DPIIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredSchemes.map((scheme, idx) => {
                  const details = formatSchemeGrantDetails(scheme);
                  const isCompared = compareList.some((s) => s.id === scheme.id);

                  return (
                    <tr
                      key={scheme.id || idx}
                      onClick={() => onSelectScheme(scheme)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-950/60 cursor-pointer transition-colors ${
                        isCompared ? "bg-blue-50/40 dark:bg-blue-950/30" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(scheme)}
                          className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-950 dark:text-white max-w-xs truncate">
                        {scheme.scheme_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                        {scheme.ministry || "Central Ministry"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          {details.grantTypeBadge}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-headline">
                        {details.individualTicket}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 text-[11px]">
                        {scheme.geographic_restriction || "Pan-India"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {scheme.dpiit_required ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300">
                            Required
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-emerald-700 dark:text-emerald-400">
                            Open
                          </span>
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

      {/* ── Floating Comparison Dock (Sticky Bottom Bar) ─────────────── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-300 dark:border-slate-700 p-3 sm:p-4 rounded-2xl shadow-2xl animate-fadeInUp flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Selected Scheme Badges */}
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white shrink-0">
              <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Compare ({compareList.length}/3):</span>
            </div>

            {compareList.map((s) => (
              <span 
                key={s.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-xs font-semibold max-w-[160px] truncate"
              >
                <span className="truncate">{s.scheme_name}</span>
                <button 
                  onClick={(e) => removeCompare(s.id, e)}
                  className="hover:text-rose-500 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {compareWarning && (
              <span className="text-[11px] font-semibold text-rose-500 ml-1">
                {compareWarning}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCompareList([])}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              Clear
            </button>

            <button
              onClick={() => setShowCompareModal(true)}
              disabled={compareList.length < 2}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                compareList.length >= 2
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 cursor-pointer animate-pulse"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{compareList.length < 2 ? "Select 1 more" : "Compare Now"}</span>
            </button>
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
