"use client";

import React, { useState } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  HelpCircle, 
  CornerDownLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  RefreshCw
} from "lucide-react";
import { FounderProfile } from "@/types";

interface Message {
  role: "user" | "copilot";
  content: string;
  source?: string;
  suggestions?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: FounderProfile;
}

export function CopilotDrawer({ isOpen, onClose, userProfile }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "copilot",
      content: `Hello! I'm your **Policy Radar Copilot**. I have indexed 193 verified central and state government schemes across 132 ministries.\n\nAsk me about scheme eligibility, funding limits, state-specific incentives in ${userProfile.state}, or how to unlock capital for your ${userProfile.sector} venture.`,
      source: "fast_path",
      suggestions: [
        `What schemes are active in ${userProfile.state}?`,
        `Top grants for ${userProfile.sector}`,
        "Which schemes do NOT require DPIIT?",
        "What is the highest funding grant?"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/copilot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          active_view: "copilot",
          user_profile: userProfile
        })
      });

      if (!res.ok) throw new Error("Copilot response error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "copilot",
          content: data.answer || "I couldn't locate specific information for that query.",
          source: data.source || "fast_path",
          suggestions: data.suggestions || ["Show all schemes", "How to apply for DPIIT?"]
        }
      ]);
    } catch (err) {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn flex justify-end">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Policy Radar Copilot</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> 0.04ms
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Grounded in 193 Verified Scheme Records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm"
                }`}
              >
                {m.content}
              </div>

              {/* Suggestions chips for copilot response */}
              {m.role === "copilot" && m.suggestions && m.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-blue-300 hover:text-white transition-colors flex items-center gap-1 text-left"
                    >
                      <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Synthesizing verified policy facts...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
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
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
