"use client";

import React, { useState } from "react";
import { 
  Check, 
  ShieldCheck, 
  Cpu, 
  Sprout, 
  Zap, 
  HeartPulse, 
  Coins, 
  Shield, 
  Layers, 
  GraduationCap, 
  ShoppingBag, 
  Globe2 
} from "lucide-react";
import { FounderProfile } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Startup Profile"
      subtitle="Customize your domain, stage, and geography to receive pinpoint scheme matches and unlock recommendations."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-text">
        {/* Startup Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Startup or Project Name
          </label>
          <input 
            type="text"
            value={profile.startupName}
            onChange={(e) => setProfile({ ...profile, startupName: e.target.value })}
            placeholder="e.g. BharatAI, KisanTech, AgniSpace"
            className="w-full min-h-[44px] px-3.5 py-2 bg-surface-2 border border-border rounded-lg text-xs sm:text-sm font-semibold text-text placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Domain / Sector Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Technology Domain / Sector
            </label>
            <span className="text-xs text-accent font-medium">Selected: {profile.sector}</span>
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
                  className={`min-h-[44px] p-3 rounded-lg border text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-accent/15 border-accent text-accent font-semibold"
                      : "bg-surface-2 border-border text-muted hover:text-text hover:border-border/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-accent" : "text-muted"}`} />
                  <div>
                    <div className="text-xs font-bold text-text">{sec.label}</div>
                    <div className="text-xs text-muted line-clamp-1 mt-0.5">{sec.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
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
                  className={`min-h-[44px] p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-ok/15 border-ok text-ok font-semibold"
                      : "bg-surface-2 border-border text-muted hover:text-text hover:border-border/80"
                  }`}
                >
                  <div className="text-xs font-bold text-text">{st.label}</div>
                  <div className="text-xs text-muted mt-1 line-clamp-2">{st.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* State / Domicile & Legal Entity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              State / UT Jurisdiction
            </label>
            <select
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="w-full min-h-[44px] px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs sm:text-sm font-semibold text-text focus:outline-none focus:border-accent"
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Incorporation Structure
            </label>
            <select
              value={profile.entityType}
              onChange={(e) => setProfile({ ...profile, entityType: e.target.value })}
              className="w-full min-h-[44px] px-3 py-2 bg-surface-2 border border-border rounded-lg text-xs sm:text-sm font-semibold text-text focus:outline-none focus:border-accent"
            >
              {ENTITY_OPTIONS.map((ent) => (
                <option key={ent.id} value={ent.id}>{ent.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Attributes Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          {/* DPIIT Recognition Toggle */}
          <Card 
            onClick={() => setProfile({ ...profile, dpiitRegistered: !profile.dpiitRegistered })}
            className={`p-3.5 border flex items-center justify-between cursor-pointer transition-colors ${
              profile.dpiitRegistered 
                ? "bg-unlock/10 border-unlock" 
                : "bg-surface-2 border-border"
            }`}
          >
            <div>
              <div className="text-xs font-bold text-text flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 ${profile.dpiitRegistered ? "text-unlock" : "text-muted"}`} />
                DPIIT Startup Recognition
              </div>
              <div className="text-xs text-muted mt-0.5">
                {profile.dpiitRegistered ? "Recognized certificate held" : "Not yet registered / In-progress"}
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={profile.dpiitRegistered} 
              onChange={() => {}} 
              className="rounded text-unlock focus:ring-0 cursor-pointer" 
            />
          </Card>

          {/* Women-Led Toggle */}
          <Card 
            onClick={() => setProfile({ ...profile, womenLed: !profile.womenLed })}
            className={`p-3.5 border flex items-center justify-between cursor-pointer transition-colors ${
              profile.womenLed 
                ? "bg-accent/10 border-accent" 
                : "bg-surface-2 border-border"
            }`}
          >
            <div>
              <div className="text-xs font-bold text-text flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 ${profile.womenLed ? "text-accent" : "text-muted"}`} />
                Women-Led Enterprise
              </div>
              <div className="text-xs text-muted mt-0.5">
                &gt;51% equity held by woman founder
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={profile.womenLed} 
              onChange={() => {}} 
              className="rounded text-accent focus:ring-0 cursor-pointer" 
            />
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Check className="w-4 h-4 mr-1.5" />
            Apply Profile & Re-Score Schemes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
