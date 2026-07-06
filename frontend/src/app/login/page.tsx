'use client';

import React from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { Cpu, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const { loginAsGuest, loginAsGoogle } = useDashboard();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Background Grids */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
      />
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl relative z-10 flex flex-col items-center">
        {/* Brand */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center">NationTwin Portal</h2>
        <p className="text-xs text-neutral-400 text-center mt-2 max-w-[280px]">
          Living Digital Twin Operator Management Console
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3.5 mt-8">
          {/* Mock Google Login */}
          <button
            onClick={loginAsGoogle}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3s2.822-6.3 6.3-6.3c1.554 0 2.977.566 4.078 1.498l3.076-3.077C18.966 2.052 15.823 1 12.24 1A10.243 10.243 0 002 11.24a10.243 10.243 0 0010.24 10.24c5.795 0 10.24-4.113 10.24-10.24 0-.649-.078-1.285-.205-1.955H12.24z"
              />
            </svg>
            <span>Continue with Google Enterprise</span>
          </button>

          {/* Guest Login */}
          <button
            onClick={loginAsGuest}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            <span>Access in Guest Operator Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security Info */}
        <div className="w-full p-4 rounded-2xl bg-black/20 border border-white/5 mt-8 flex gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-white text-[11px]">Sandboxed Environment</h5>
            <p className="text-[10px] text-neutral-500 leading-normal mt-0.5">
              Sessions run inside local indexed storage. No remote database connection required to explore basic telemetry.
            </p>
          </div>
        </div>

        {/* Help Link */}
        <a 
          href="/"
          className="text-[10px] text-neutral-500 hover:text-white mt-6 flex items-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </a>
      </div>
    </div>
  );
}
