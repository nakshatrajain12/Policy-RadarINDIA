"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  FileText,
  ExternalLink,
  Info
} from "lucide-react";
import { FounderProfile, RecommendationMatch } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FounderProfile;
  unlockableSchemes: RecommendationMatch[];
  onApplyProfileChange: (updated: Partial<FounderProfile>) => void;
}

export function UnlockSimulatorModal({
  isOpen,
  onClose,
  profile,
  unlockableSchemes,
  onApplyProfileChange,
}: Props) {
  const [simDpiit, setSimDpiit] = useState(!profile.dpiitRegistered);
  const [simEntity, setSimEntity] = useState(profile.entityType !== "pvt_ltd");
  const [simPatent, setSimPatent] = useState(false);

  if (!isOpen) return null;

  const unlockedCount = unlockableSchemes.length;
  const unlockedValueDisplay = unlockedCount > 0 ? "₹1.85 Cr" : "₹0";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Policy Unlock Simulator"
      subtitle="Simulate strategic actions to instantly uncover latent government funding opportunities."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-text">
        {/* Explanation Banner */}
        <Card className="p-4 bg-surface-2 border-border flex items-start gap-3">
          <Info className="w-4 h-4 text-unlock shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-muted">
            <strong className="text-text">How the Strategic Simulator Works:</strong> Toggle strategic regulatory steps below to see which locked central and state schemes instantly become accessible. The simulator quantifies the exact financial ROI and shows turnaround times for each milestone.
          </div>
        </Card>

        {/* Simulation Toggle Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1: DPIIT */}
          <Card 
            onClick={() => setSimDpiit(!simDpiit)}
            className={`p-4 border transition-all cursor-pointer ${
              simDpiit
                ? "bg-unlock/10 border-unlock"
                : "bg-surface-2 border-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className={`w-5 h-5 ${simDpiit ? "text-unlock" : "text-muted"}`} />
              <Chip variant={simDpiit ? "unlock" : "neutral"} size="sm">
                {simDpiit ? "Active" : "Inactive"}
              </Chip>
            </div>
            <div className="text-xs font-bold text-text">1. DPIIT Recognition</div>
            <div className="text-xs text-muted mt-1 leading-snug">
              Unlocks 80-IAC tax holiday, Angel Tax exemption, and SISFS grants.
            </div>
          </Card>

          {/* Step 2: Incorporation */}
          <Card 
            onClick={() => setSimEntity(!simEntity)}
            className={`p-4 border transition-all cursor-pointer ${
              simEntity
                ? "bg-unlock/10 border-unlock"
                : "bg-surface-2 border-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className={`w-5 h-5 ${simEntity ? "text-unlock" : "text-muted"}`} />
              <Chip variant={simEntity ? "unlock" : "neutral"} size="sm">
                {simEntity ? "Active" : "Inactive"}
              </Chip>
            </div>
            <div className="text-xs font-bold text-text">2. Pvt Ltd Incorporation</div>
            <div className="text-xs text-muted mt-1 leading-snug">
              Required by BIRAC, TIDE 2.0, and institutional bank credit schemes.
            </div>
          </Card>

          {/* Step 3: Patent */}
          <Card 
            onClick={() => setSimPatent(!simPatent)}
            className={`p-4 border transition-all cursor-pointer ${
              simPatent
                ? "bg-unlock/10 border-unlock"
                : "bg-surface-2 border-border opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className={`w-5 h-5 ${simPatent ? "text-unlock" : "text-muted"}`} />
              <Chip variant={simPatent ? "unlock" : "neutral"} size="sm">
                {simPatent ? "Active" : "Inactive"}
              </Chip>
            </div>
            <div className="text-xs font-bold text-text">3. Provisional Patent</div>
            <div className="text-xs text-muted mt-1 leading-snug">
              Unlocks DST NIDHI-PRAYAS hardware funds and IPR reimbursements.
            </div>
          </Card>
        </div>

        {/* Unlockable Schemes Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Target Schemes Unlocked by Simulation ({unlockedCount})
            </h3>
            {unlockedCount > 0 && (
              <span className="text-xs font-semibold text-unlock">
                Capital Pipeline: up to {unlockedValueDisplay}
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
            {unlockableSchemes.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted">
                Toggle the regulatory milestones above to preview unlocked opportunities.
              </div>
            ) : (
              unlockableSchemes.map((s, idx) => (
                <Card key={idx} className="p-3 bg-surface-2 border-border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-text truncate">{s.name}</div>
                    <div className="text-xs text-muted truncate">{s.ministry || "Government of India"}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Chip variant="unlock" size="sm">
                      {s.funding_type || "Grant"}
                    </Chip>
                    {s.application_portal && (
                      <a
                        href={s.application_portal}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-text p-1"
                        aria-label={`Open application portal for ${s.name}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onApplyProfileChange({
                dpiitRegistered: simDpiit,
                entityType: simEntity ? "pvt_ltd" : profile.entityType
              });
              onClose();
            }}
          >
            <span>Apply Simulation Changes</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
