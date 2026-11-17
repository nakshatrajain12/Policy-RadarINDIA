"use client";

import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Check, 
  X, 
  ShieldCheck, 
  HelpCircle,
  Cpu,
  Sprout,
  Zap,
  HeartPulse,
  Coins,
  Shield,
  Layers,
  GraduationCap,
  ShoppingBag,
  Rocket,
  Globe2
} from "lucide-react";
import { FounderProfile } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: FounderProfile;
  onSave: (updated: FounderProfile) => void;
}

const SECTOR_OPTIONS = [
  { id: "All Sectors", label: "Sector Agnostic / All", icon: Globe2, desc: "Open to innovations across all industries" },
  { id: "AI / Machine Learning", label: "AI & Machine Learning", icon: Cpu, desc: "GenAI, LLMs, Computer Vision, Robotics" },
  { id: "AgriTech", label: "AgriTech & Rural", icon: Sprout, desc: "Precision farming, supply chain, dairy, biotech" },
  { id: "CleanTech & Renewable", label: "CleanTech & EV", icon: Zap, desc: "Green hydrogen, solar, batteries, mobility" },
  { id: "HealthTech & MedTech", label: "HealthTech & Bio", icon: HeartPulse, desc: "Diagnostics, pharma, clinical devices, digital health" },
  { id: "FinTech & InsurTech", label: "FinTech & Payments", icon: Coins, desc: "Lending, payments, regtech, blockchain" },
  { id: "DeepTech & Hardware", label: "DeepTech & Hardware", icon: Cpu, desc: "Semiconductors, quantum, materials science" },
  { id: "Defence & Aerospace", label: "Defence & SpaceTech", icon: Shield, desc: "Drones, avionics, tactical systems, satellite" },
  { id: "SaaS & Enterprise", label: "SaaS & Enterprise", icon: Layers, desc: "B2B software, cloud tools, developer platforms" },
  { id: "EdTech & Learning", label: "EdTech & Skills", icon: GraduationCap, desc: "Skill training, digital learning, LMS" },
  { id: "E-Commerce & D2C", label: "Consumer & D2C", icon: ShoppingBag, desc: "Direct to consumer, retail tech, logistics" },
];

const STAGE_OPTIONS = [
  { id: "Idea", label: "Idea / Concept", desc: "Formulating business model or conducting initial research" },
  { id: "Prototype/MVP", label: "Prototype / MVP", desc: "Building or validating working proof-of-concept" },
  { id: "Early Revenue", label: "Early Revenue", desc: "First paying customers and commercial traction" },
  { id: "Growth/Scale-up", label: "Growth / Scaling", desc: "Scaling operations, institutional VC or series funding" },
];

const STATE_OPTIONS = [
  "Pan-India", "Karnataka", "Maharashtra", "Telangana", "Tamil Nadu", "Kerala", 
  "Delhi", "Gujarat", "Uttar Pradesh", "Rajasthan", "Odisha", "Haryana", 
  "Punjab", "Andhra Pradesh", "Madhya Pradesh", "West Bengal", "Bihar", 
  "Assam", "Goa", "Uttarakhand", "Himachal Pradesh", "Chhattisgarh", 
  "Jharkhand", "Jammu and Kashmir", "Meghalaya", "Manipur", "Nagaland", 
  "Mizoram", "Tripura", "Sikkim", "Arunachal Pradesh", "Ladakh", "Puducherry"
];

const ENTITY_OPTIONS = [
  { id: "pvt_ltd", label: "Private Limited (Pvt Ltd)", desc: "Standard corporate entity" },
  { id: "llp", label: "Limited Liability Partnership (LLP)", desc: "Formal partnership" },
  { id: "partnership", label: "Registered Partnership", desc: "Traditional partnership deed" },
  { id: "unregistered_idea", label: "Early Stage / Pre-Incorporation", desc: "Individual founder / student innovator" },
];

export function FounderProfileModal({ isOpen, onClose, currentProfile, onSave }: Props) {
  const [profile, setProfile] = useState<FounderProfile>(currentProfile);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("founder_profile", JSON.stringify(profile));
    localStorage.setItem("profile_customized", "true");
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                Configure Startup Profile
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Customize your domain, stage, and geography to receive pinpoint scheme matches and unlock recommendations.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-300">
          {/* Startup Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Startup or Project Name
            </label>
            <input 
              type="text"
              value={profile.startupName}
              onChange={(e) => setProfile({ ...profile, startupName: e.target.value })}
              placeholder="e.g. BharatAI, KisanTech, AgniSpace"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Domain / Sector Selection (11 Core Verticals) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Technology Domain / Sector
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Selected: {profile.sector}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SECTOR_OPTIONS.map((sec) => {
                const Icon = sec.icon;
                const isSelected = profile.sector === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, sector: sec.id })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-950 dark:text-white">{sec.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{sec.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Development Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STAGE_OPTIONS.map((st) => {
                const isSelected = profile.stage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, stage: st.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-950 dark:text-white">{st.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{st.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* State / Domicile & Legal Entity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                State / UT Jurisdiction
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {STATE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Incorporation Structure
              </label>
              <select
                value={profile.entityType}
                onChange={(e) => setProfile({ ...profile, entityType: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-950 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {ENTITY_OPTIONS.map((ent) => (
                  <option key={ent.id} value={ent.id}>{ent.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Attributes Toggles (DPIIT & Women Led) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* DPIIT Recognition Toggle */}
            <div 
              onClick={() => setProfile({ ...profile, dpiitRegistered: !profile.dpiitRegistered })}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                profile.dpiitRegistered 
                  ? "bg-purple-500/10 border-purple-500/40 text-purple-700 dark:text-purple-300"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  DPIIT Startup Recognition
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.dpiitRegistered ? "Recognized certificate held" : "Not yet registered / In-progress"}
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.dpiitRegistered} 
                onChange={() => {}} 
                className="rounded text-purple-600 focus:ring-0" 
              />
            </div>

            {/* Women-Led Toggle */}
            <div 
              onClick={() => setProfile({ ...profile, womenLed: !profile.womenLed })}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                profile.womenLed 
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Women-Led Enterprise
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  &gt;51% equity held by woman founder
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.womenLed} 
                onChange={() => {}} 
                className="rounded text-rose-600 focus:ring-0" 
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Apply Profile & Re-Score Schemes
          </button>
        </div>
      </div>
    </div>
  );
}
