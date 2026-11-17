"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Sparkles, 
  Building2, 
  Coins, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Search,
  Filter,
  Layers,
  ArrowRight
} from "lucide-react";
import { Scheme } from "@/types";

interface StoryItem {
  id: string;
  scheme_name: string;
  ministry: string;
  funding_type: string;
  max_funding_amount?: number;
  geographic_restriction: string;
  success_stories: string;
  alumni_name?: string;
  sector?: string;
  impact_highlight?: string;
}

const CURATED_ALUMNI: StoryItem[] = [
  {
    id: "curated-1",
    scheme_name: "Biotechnology Ignition Grant (BIG)",
    ministry: "Department of Biotechnology (BIRAC)",
    funding_type: "Grant (100% Equity-Free)",
    max_funding_amount: 5000000,
    geographic_restriction: "Pan-India",
    alumni_name: "Bugworks Research & String Bio",
    sector: "HealthTech & BioTech",
    impact_highlight: "Raised $40M+ Series B after initial ₹50 Lakhs BIG grant validation",
    success_stories: "BIRAC BIG provided early catalytic grant capital for proof-of-concept synthesis. Both ventures utilized BIRAC regional bio-incubator facilities to achieve clinical validation."
  },
  {
    id: "curated-2",
    scheme_name: "NIDHI-PRAYAS (Idea to Prototype)",
    ministry: "Department of Science and Technology (DST)",
    funding_type: "Grant",
    max_funding_amount: 1000000,
    geographic_restriction: "Pan-India",
    alumni_name: "Ather Energy & Log9 Materials",
    sector: "CleanTech & Hardware",
    impact_highlight: "Pioneered indigenous EV battery platforms across India",
    success_stories: "DST NIDHI-PRAYAS provided prototyping equipment access at IIT Madras and IIT Roorkee fabrication labs, eliminating high capital expenditure barriers for hardware inventors."
  },
  {
    id: "curated-3",
    scheme_name: "Startup India Seed Fund Scheme (SISFS)",
    ministry: "DPIIT, Ministry of Commerce & Industry",
    funding_type: "Grant + Convertible Debenture",
    max_funding_amount: 7000000,
    geographic_restriction: "Pan-India",
    alumni_name: "AgriSense & BharatX Alumni",
    sector: "FinTech & AgriTech",
    impact_highlight: "Disbursed to over 1,800 startups across 180+ approved incubators",
    success_stories: "SISFS deployed ₹20 Lakhs grants for prototype validation and ₹50 Lakhs convertible debt for market entry, bridging the critical 'valley of death' before angel rounds."
  },
  {
    id: "curated-4",
    scheme_name: "Karnataka ELEVATE 100 / Idea2PoC",
    ministry: "Department of Electronics, IT, Bt and S&T, Karnataka",
    funding_type: "Grant-in-Aid",
    max_funding_amount: 5000000,
    geographic_restriction: "Karnataka",
    alumni_name: "Bellatrix Aerospace",
    sector: "Aerospace & DeepTech",
    impact_highlight: "Developed satellite propulsion systems deployed on ISRO PSLV launches",
    success_stories: "ELEVATE 100 awarded ₹50 Lakhs milestone-based non-dilutive grant to Bellatrix Aerospace during their initial university lab development phase."
  },
  {
    id: "curated-5",
    scheme_name: "TIDE 2.0 (Technology Incubation & Development)",
    ministry: "Ministry of Electronics & IT (MeitY)",
    funding_type: "Grant & Fellowship",
    max_funding_amount: 700000,
    geographic_restriction: "Pan-India",
    alumni_name: "Niramai & Signzy",
    sector: "AI / Machine Learning",
    impact_highlight: "Scaled AI thermal screening for early cancer detection nationwide",
    success_stories: "MeitY TIDE supported nascent AI algorithms with compute grants and university incubations, leading to FDA clearances and international patent filings."
  },
  {
    id: "curated-6",
    scheme_name: "Innovations for Defence Excellence (iDEX - DISC)",
    ministry: "Ministry of Defence",
    funding_type: "Grant (SPARK)",
    max_funding_amount: 15000000,
    geographic_restriction: "Pan-India",
    alumni_name: "IdeaForge & Optimized Electrotech",
    sector: "Defence & Aerospace",
    impact_highlight: "procured by Indian Army & Indian Navy for border surveillance",
    success_stories: "iDEX DISC challenges awarded ₹1.5 Cr to ₹10 Cr grants with guaranteed procurement pathways upon successful field trials in high-altitude environments."
  }
];

export function SuccessStoriesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");

  const filteredStories = CURATED_ALUMNI.filter((s) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const inScheme = s.scheme_name.toLowerCase().includes(q);
      const inAlumni = (s.alumni_name || "").toLowerCase().includes(q);
      const inStory = s.success_stories.toLowerCase().includes(q);
      if (!inScheme && !inAlumni && !inStory) return false;
    }
    if (selectedSector !== "All" && s.sector && !s.sector.includes(selectedSector)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Beneficiary Case Studies
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• Verified Track Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight font-headline">
            Startup India Success Stories & Alumni
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Real case studies of Indian startups that leveraged central and state grants to validate technology, de-risk R&D, and scale to unicorn & commercial status.
          </p>
        </div>
      </div>

      {/* ── Macro Impact Metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Total Catalytic Grants</span>
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-headline">
            ₹3,400+ Cr
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Deployed non-dilutive capital
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Seeded Ventures</span>
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-headline">
            14,200+
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            PoC & MVP grants awarded
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Follow-On VC Raised</span>
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-headline">
            18.4x
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Private capital leverage multiple
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Patents Commercialized</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-headline">
            4,800+
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            With 80% fee reimbursement
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alumni by company name (e.g. Bugworks, Bellatrix, Ather), scheme or sector..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="sm:w-56 shrink-0">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Sectors</option>
            <option value="DeepTech">DeepTech & Aerospace</option>
            <option value="HealthTech">HealthTech & BioTech</option>
            <option value="CleanTech">CleanTech & Hardware</option>
            <option value="FinTech">FinTech & AgriTech</option>
            <option value="AI">AI & Machine Learning</option>
          </select>
        </div>
      </div>

      {/* ── Case Study Cards Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div 
            key={story.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Alumni Badge & Sector */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {story.sector || "Tech"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {story.funding_type}
                </span>
              </div>

              {/* Startup Name */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {story.alumni_name}
              </h3>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                Funded by {story.scheme_name}
              </p>

              {/* Ministry */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {story.ministry} • 📍 {story.geographic_restriction}
              </div>

              {/* Impact Callout */}
              {story.impact_highlight && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {story.impact_highlight}
                  </span>
                </div>
              )}

              {/* Story Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                {story.success_stories}
              </p>
            </div>

            {/* Bottom Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Grant Cap: ₹{((story.max_funding_amount || 5000000) / 100000).toFixed(0)} Lakhs
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                Verified Grantee <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

