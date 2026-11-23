"use client";

import React, { useState } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { FounderProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { MarkdownMessage } from "@/components/ui/MarkdownMessage";

export interface SuggestionChip {
  label: string;
  query?: string;
  intent?: string;
  sector?: string;
  state?: string;
  [key: string]: any;
}

export interface SchemeSource {
  id: string;
  name: string;
}

export interface CopilotMessage {
  role: "user" | "copilot";
  content: string;
  source?: "fast_path" | "grounded" | "llm" | "error";
  sources?: SchemeSource[];
  suggestions?: (string | SuggestionChip)[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: FounderProfile;
  onNavigateTab?: (tab: string) => void;
  onApplyFilter?: (filter: { sector?: string; state?: string; fundingType?: string; search?: string }) => void;
  onSelectScheme?: (schemeId: string) => void;
}

export function CopilotDrawer({ 
  isOpen, 
  onClose, 
  userProfile,
  onNavigateTab,
  onApplyFilter,
  onSelectScheme
}: Props) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: "copilot",
      content: `Hello! I'm your **Policy Radar Copilot**. I have indexed **193 verified central and state government schemes** across 132 ministries.\n\nAsk me about scheme eligibility, funding limits, state-specific incentives in **${userProfile.state}**, or how to unlock capital for your **${userProfile.sector}** venture.`,
      source: "fast_path",
      suggestions: [
        { label: `What schemes are active in ${userProfile.state}?`, query: `What schemes are active in ${userProfile.state}?` },
        { label: `Top grants for ${userProfile.sector}`, query: `Top grants for ${userProfile.sector}` },
        { label: "Which schemes do NOT require DPIIT?", query: "Which schemes do NOT require DPIIT?" },
        { label: "Top 5 early stage grants", query: "Top 5 early stage grants" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string, chipPayload?: SuggestionChip) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() && !chipPayload) return;
    if (loading) return;

    const displayUserText = chipPayload?.label || textToSend;
    const userMsg: CopilotMessage = { role: "user", content: displayUserText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const apiUrl = rawApiUrl.replace(/\/$/, "");

      // Send recent message history for contextual LLM fallback
      const recentHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${apiUrl}/copilot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          active_view: "copilot",
          user_profile: userProfile,
          chip_payload: chipPayload || null,
          history: recentHistory
        })
      });

      if (!res.ok) throw new Error("Copilot response error");
      const data = await res.json();

      // Apply UI action if returned
      if (data.ui_action) {
        if (data.ui_action.type === "filter_sector" && data.ui_action.sector) {
          onApplyFilter?.({ sector: data.ui_action.sector });
          onNavigateTab?.("schemes");
        } else if (data.ui_action.type === "filter_state" && data.ui_action.state) {
          onApplyFilter?.({ state: data.ui_action.state });
          onNavigateTab?.("schemes");
        } else if (data.ui_action.type === "filter_grants") {
          onApplyFilter?.({ fundingType: "grant" });
          onNavigateTab?.("schemes");
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "copilot",
          content: data.answer || "I couldn't locate specific verified information for that query.",
          source: data.source || "fast_path",
          sources: data.sources || [],
          suggestions: data.suggestions || [
            { label: "Top 5 early stage grants", query: "Top 5 early stage grants" },
            { label: "Which schemes do NOT require DPIIT?", query: "Which schemes do NOT require DPIIT?" }
          ]
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "copilot",
          content: "I'm having trouble connecting to the backend intelligence engine right now. Please check if the API server is active on port 8000.",
          source: "error"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (sug: string | SuggestionChip) => {
    if (typeof sug === "string") {
      handleSend(sug);
    } else {
      if (sug.intent) {
        handleSend(sug.label, sug);
      } else if (sug.query) {
        handleSend(sug.query, sug);
      } else {
        handleSend(sug.label);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 animate-fadeIn flex justify-end">
      <div className="w-full max-w-md h-full bg-surface border-l border-border flex flex-col shadow-xl text-text">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent text-accent-contrast flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text tracking-tight">Policy Radar Copilot</h3>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-ok/15 text-ok border border-ok/30 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Grounded
                </span>
              </div>
              <p className="text-xs text-muted font-medium">193 Verified Scheme Records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close copilot drawer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-text rounded-lg hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-xl leading-relaxed transition-colors ${
                  m.role === "user"
                    ? "bg-accent text-accent-contrast rounded-br-none whitespace-pre-wrap shadow-xs"
                    : "bg-surface-2 border border-border text-text rounded-bl-none shadow-xs"
                }`}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <div>
                    {/* Render message with minimal safe markdown renderer */}
                    <MarkdownMessage
                      content={m.content}
                      onSchemeClick={(name) => handleSend(name)}
                    />

                    {/* Grounding Source Badge & Clickable Sources */}
                    <div className="mt-2.5 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-muted">
                      <div className="flex items-center gap-1">
                        {m.source === "llm" ? (
                          <span className="inline-flex items-center gap-1 text-accent font-medium">
                            <Cpu className="w-3 h-3" /> AI-Assisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-ok font-medium">
                            <Zap className="w-3 h-3" /> Gazette Grounded
                          </span>
                        )}
                      </div>

                      {/* Clickable Sources */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.sources.map((src) => (
                            <button
                              key={src.id}
                              onClick={() => {
                                if (onSelectScheme) {
                                  onSelectScheme(src.id);
                                } else {
                                  handleSend(src.name);
                                }
                              }}
                              className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface-2 border border-border text-[10px] text-muted hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
                              title={`View ${src.name}`}
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="max-w-[120px] truncate">{src.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions chips for copilot response */}
              {m.role === "copilot" && m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.suggestions.map((sug, sIdx) => {
                    const label = typeof sug === "string" ? sug : sug.label;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => handleChipClick(sug)}
                        className="min-h-[36px] px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-border text-xs text-accent hover:text-text transition-colors flex items-center gap-1 text-left cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-accent shrink-0" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
              <span>Synthesizing verified policy facts...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-surface-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about schemes, funding caps, eligibility..."
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-border text-xs sm:text-sm text-text placeholder-muted focus:outline-none focus:border-accent"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              variant="primary"
              className="min-h-[44px] min-w-[44px] p-2.5"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
