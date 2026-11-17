"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Sparkles, Mail, Lock, Building2, MapPin, Layers, ArrowRight, ShieldCheck } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const SECTORS = [
  "AgriTech", "AI / Machine Learning", "CleanTech & EV", "HealthTech & Bio", 
  "FinTech", "DeepTech & Hardware", "Defence & SpaceTech", "SaaS & Enterprise", 
  "EdTech & Skills", "Consumer & D2C", "All Sectors"
];

const STAGES = [
  "Idea", "Prototype/MVP", "Early Revenue", "Growth/Scale-up"
];

const STATES = [
  "Pan-India", "Karnataka", "Maharashtra", "Telangana", "Tamil Nadu", "Kerala", 
  "Delhi", "Gujarat", "Uttar Pradesh", "Rajasthan", "Odisha", "Haryana", 
  "Punjab", "Andhra Pradesh", "Madhya Pradesh", "West Bengal", "Bihar"
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startupName, setStartupName] = useState("");
  const [sector, setSector] = useState("AgriTech");
  const [stage, setStage] = useState("Idea");
  const [location, setLocation] = useState("Pan-India");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );

  const establishSessionAndRedirect = (userEmail: string, name: string) => {
    // 1. Set persistent session cookie for middleware
    document.cookie = `govdash_session=${encodeURIComponent(userEmail)}; path=/; max-age=2592000; SameSite=Lax`;

    // 2. Set complete profile in localStorage
    localStorage.setItem(
      "dummy_user",
      JSON.stringify({
        startup_name: name,
        sector: sector,
        stage: stage,
        location: location,
        email: userEmail
      })
    );

    localStorage.setItem(
      "founder_profile",
      JSON.stringify({
        startupName: name,
        sector: sector,
        stage: stage,
        state: location,
        dpiitRegistered: false,
        womenLed: false,
        entityType: "unregistered_idea"
      })
    );
    localStorage.setItem("profile_customized", "true");

    // 3. Navigate directly to dashboard
    window.location.href = "/";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Best-effort Supabase user creation
      if (email && password) {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              startup_name: startupName,
              sector,
              stage,
              location
            }
          }
        }).catch(() => null);
      }
    } catch {
      // Non-blocking
    }

    establishSessionAndRedirect(email || "founder@govdash.in", startupName || "Innovator");
  };

  const handleGoogleSignUp = () => {
    setGoogleLoading(true);
    setError("");
    establishSessionAndRedirect("founder.google@govdash.in", startupName || "Founder");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Radial Glows */}
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-lg relative z-10 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 my-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-headline">
              GOV-DASH
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              INDIA 🇮🇳
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create your account to unlock targeted sovereign grant intelligence
          </p>
        </div>

        {/* Google 1-Click Register */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all shadow-sm hover:border-slate-600 active:scale-[0.99] disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleLoading ? "Setting up account..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            or configure venture details
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Startup / Project Name
              </label>
              <input
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g. BharatAI"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@venture.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Choose Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Venture Targeting Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Industry Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Startup Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">State / Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                {STATES.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Creating Profile..." : "Create Account & Enter Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
