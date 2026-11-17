'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { loginWithOAuth } from '@/app/auth/actions';

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = React.use(searchParams);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startupName, setStartupName] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(params.message || '');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key'
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName || !sector || !stage || !location) {
      setError('Please provide all your Startup details.');
      return;
    }
    setLoading(true);
    setError('');

    // BYPASS SUPABASE AUTH FOR NOW
    // Save to localStorage so dashboard can read it
    localStorage.setItem('dummy_user', JSON.stringify({
      startup_name: startupName,
      sector: sector,
      stage: stage,
      location: location,
      email: email
    }));

    router.push('/');
    router.refresh();
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');
    localStorage.removeItem('profile_customized');
    localStorage.setItem('dummy_user', JSON.stringify({
      startup_name: "Founder",
      sector: "All Sectors",
      stage: "Idea",
      location: "Pan-India",
      email: "founder@example.com"
    }));
    router.push('/');
    router.refresh();
  };

  const inputStyle = {
    borderRadius: '12px', padding: '12px 16px',
    background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)',
    outline: 'none', color: '#fff', fontSize: '14px', transition: 'border-color 0.2s'
  };

  const selectStyle = {
    ...inputStyle, cursor: 'pointer' as const
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0a0d17', color: '#cbd5e1', fontFamily: '"Inter", sans-serif' }}>
      <div
        className="fixed inset-0 z-[-2]"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3cHhcT1XpjTAdTSMljXTOpg14NMqPr8j9F40sTj9ozfGSyHfosNZPUHoAxcLQoEYxaB9I0eopd4vyc2EWTEQNdgS34MdM9Qc1WsUAysSoDJEn8ouQ-HhoNXw6LrZTyil2SVhxynYPtwRjdZz1iEGp-9cNUTs5depFX2bPKnXuVve5xm_Ab5qJNRqEPYv3QfIiOB9zQcnOIZbAu9U4WNV8sKYOw6Hn1v4hpjSrKuHUL_cirhMGX7RWAiyEDHeB8XbFX5bntNdJzxo')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="absolute inset-0 z-[-1]" style={{ background: 'rgba(6,10,24,0.88)', backdropFilter: 'blur(40px)' }}></div>

      {/* Animated gradient orbs */}
      <div style={{ position: 'fixed', top: '10%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)', animation: 'floatOrb 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      <div className="w-full max-w-md p-8 relative" style={{ background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', animation: 'authCardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', filter: 'blur(40px)' }}></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full" style={{ background: 'rgba(168,85,247,0.2)', filter: 'blur(40px)' }}></div>

        <div className="relative z-10 flex flex-col items-center mb-6">
          <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <svg className="w-8 h-8" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M4 4l16 16M4 20L20 4" strokeLinecap="round"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', textTransform: 'uppercase', fontFamily: '"Manrope", sans-serif' }}>GOV-DASH</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>Create your Policy Intelligence account</p>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '14px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', cursor: googleLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.03em'
            }}
            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '2px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>or create with email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email/Password Form */}
          <form className="flex flex-col gap-3" onSubmit={handleSignup}>
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Startup Name</label>
              <input type="text" value={startupName} onChange={(e) => setStartupName(e.target.value)} placeholder="Your Startup Inc." required style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sector</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} required style={selectStyle}>
                <option value="" disabled>Select your sector</option>
                <option value="Deeptech">Deeptech</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthtech">Healthtech</option>
                <option value="Edtech">Edtech</option>
                <option value="Agritech">Agritech</option>
                <option value="SaaS">SaaS</option>
                <option value="Defense">Defense</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} required style={selectStyle}>
                <option value="" disabled>Select startup stage</option>
                <option value="idea">Idea</option>
                <option value="prototype">Prototype</option>
                <option value="early_revenue">Early Revenue</option>
                <option value="scale_up">Scale Up</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location / State</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} required style={selectStyle}>
                <option value="" disabled>Select location</option>
                <option value="Pan-India">Pan-India</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Odisha">Odisha</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'} />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#f87171', fontSize: '13px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', color: '#4ade80', fontSize: '13px', textAlign: 'center' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: '8px', background: loading ? '#334155' : '#1e293b', color: '#fff', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#60a5fa', fontWeight: 700 }}>Sign in</a>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes authCardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

