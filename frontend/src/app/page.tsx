'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Cpu, 
  Map, 
  TrendingUp, 
  Play, 
  ShieldCheck, 
  Database,
  Layers,
  ChevronRight,
  Sparkles,
  GitFork
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard-context';

export default function LandingPage() {
  const router = useRouter();
  const { loginAsGuest } = useDashboard();

  const features = [
    {
      icon: Cpu,
      title: "12-Agent Core Orchestration",
      description: "Weather, Traffic, Hospital, and Energy agents run in background loops, communicating findings to risk assessments."
    },
    {
      icon: TrendingUp,
      title: "Predictive Intelligence",
      description: "Calculates flood hazards, grid lockups, and power overloads hours ahead, detailing confidence levels."
    },
    {
      icon: Play,
      title: "Simulative Sandbox",
      description: "Inject rain surges, road closures, or power plant downs. Chart system recovery curves, financial costs, and lives affected."
    },
    {
      icon: GitFork,
      title: "World Model Graph",
      description: "City elements (hospitals, schools, substations) are mapped onto an interactive React Flow network representing dependencies."
    },
    {
      icon: Layers,
      title: "Decision Command Center",
      description: "Recommends optimized interventions like reservoir releases or emergency detours alongside expected cost-benefit matrices."
    },
    {
      icon: Database,
      title: "Pluggable Architecture",
      description: "Built on clean FastAPI hooks. Toggle from mock data arrays to real Postgres, Redis, and Neo4j telemetry feeds."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-neutral-200">
      {/* Animated City-Grid Background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-move pointer-events-none"
      />
      
      {/* Decorative Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">NationTwin AI</span>
              <span className="text-[9px] block text-emerald-400 font-semibold tracking-wider -mt-1 uppercase">Living Digital Twin</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Core Engine</a>
            <a href="#architecture" className="hover:text-white transition-colors">Data Model</a>
            <a href="#pricing" className="hover:text-white transition-colors">Licensing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-xs font-semibold text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <button 
              onClick={loginAsGuest}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <span>Instant Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-[11px] font-semibold text-violet-300 mb-8 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>V2.4 Active Digital Twin Agent Grid</span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          The Living <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-violet-500 bg-clip-text text-transparent">
            Digital Twin
          </span> of Mumbai
        </h1>
        <p className="mt-6 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Monitor, simulate, and recommend municipal responses for Mumbai. NationTwin AI orchestrates 12 independent agent blocks (BMC Disaster, Traffic Police, BEST Transit) to model monsoon rainfall, hospital beds, and grid loads in a cohesive World Graph.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={loginAsGuest}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <span>Launch Operator Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link 
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-semibold text-sm transition-all"
          >
            Sign In with Portal
          </Link>
        </div>

        {/* Hero Mockup Dashboard */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-white/10 p-2 bg-slate-900/50 backdrop-blur-md shadow-2xl">
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-white/5 relative flex flex-col items-center justify-center group">
            {/* Synthetic Dashboard Preview Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950 flex flex-col p-6 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="px-3 py-1 rounded bg-white/5 text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                  SYS_ONLINE: 12 AGENTS SYNCED
                </div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-6 pt-6 opacity-80">
                <div className="border border-white/5 rounded-lg p-4 bg-white/5 space-y-3">
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                  <div className="h-8 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
                <div className="border border-white/5 rounded-lg p-4 bg-white/5 space-y-3">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-8 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
                <div className="border border-white/5 rounded-lg p-4 bg-white/5 space-y-3">
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-8 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            </div>
            
            {/* Play Button Overlay */}
            <button 
              onClick={loginAsGuest}
              className="relative z-10 w-16 h-16 rounded-full bg-emerald-400 hover:bg-emerald-300 flex items-center justify-center shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all text-slate-950 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current pl-1" />
            </button>
            <span className="relative z-10 text-[11px] font-semibold text-neutral-400 mt-4 group-hover:text-white transition-colors">
              Click to view and interact with the Live Console
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Multi-Sector Decision Intelligence
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              NationTwin AI simulates connections between infrastructure, weather sensors, health channels, and transit systems to predict risk cascade chains.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl border border-white/5 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-500/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Consensus Section */}
      <section id="architecture" className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              How the Agent Consensus Works
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Our core orchestrator feeds sensor logs to agents, compiling consensus weights to drive intervention models.
            </p>
          </div>

          {/* Diagram */}
          <div className="glass border rounded-2xl p-6 sm:p-8 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative">
            <div className="flex flex-col items-center p-4 border border-white/5 rounded-xl bg-white/5 w-full md:w-1/4">
              <Database className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-semibold text-xs text-white">1. City Telemetry</h4>
              <p className="text-[10px] text-neutral-500 text-center mt-1">Hospitals, Traffiic, Energy Load</p>
            </div>
            
            <div className="text-neutral-600 hidden md:block"><ChevronRight className="w-5 h-5" /></div>
            
            <div className="flex flex-col items-center p-4 border border-white/5 rounded-xl bg-white/5 w-full md:w-1/4">
              <Cpu className="w-6 h-6 text-violet-400 mb-2" />
              <h4 className="font-semibold text-xs text-white">2. Agent Grid Consensus</h4>
              <p className="text-[10px] text-neutral-500 text-center mt-1">12 Autonomous Analyser blocks</p>
            </div>

            <div className="text-neutral-600 hidden md:block"><ChevronRight className="w-5 h-5" /></div>

            <div className="flex flex-col items-center p-4 border border-white/5 rounded-xl bg-white/5 w-full md:w-1/4">
              <TrendingUp className="w-6 h-6 text-teal-400 mb-2" />
              <h4 className="font-semibold text-xs text-white">3. Risk Prediction</h4>
              <p className="text-[10px] text-neutral-500 text-center mt-1">Flood, Congestion, Power Outages</p>
            </div>

            <div className="text-neutral-600 hidden md:block"><ChevronRight className="w-5 h-5" /></div>

            <div className="flex flex-col items-center p-4 border border-white/5 rounded-xl bg-white/5 w-full md:w-1/4">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mb-2" />
              <h4 className="font-semibold text-xs text-white">4. Intervention Recommendation</h4>
              <p className="text-[10px] text-neutral-500 text-center mt-1">Optimize mitigation pathways</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Licensing and Deployment
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Run NationTwin locally using mock telemetry, or scale up to live database connections.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-white/5 bg-slate-950/60 hover:border-white/10 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Developer Edition</h3>
                <p className="text-xs text-neutral-500 mt-2">Perfect for local testing and mock deployments</p>
                <div className="mt-6 flex items-baseline text-white">
                  <span className="text-3xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-xs text-neutral-500">/ forever</span>
                </div>
                <ul className="mt-6 space-y-3.5 text-xs text-neutral-400">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>All 12 simulation agents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Stateful simulation sandbox</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Client-side mock stateful API fallback</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={loginAsGuest}
                className="mt-8 w-full py-3 rounded-xl border border-white/10 text-white font-semibold text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Launch Developer Console
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between relative">
              <div className="absolute top-4 right-4 bg-emerald-400/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                Enterprise
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Production Cluster</h3>
                <p className="text-xs text-neutral-500 mt-2">Connects directly to live city sensor databases</p>
                <div className="mt-6 flex items-baseline text-white">
                  <span className="text-3xl font-extrabold tracking-tight">Custom</span>
                  <span className="ml-1 text-xs text-neutral-500">/ municipal billing</span>
                </div>
                <ul className="mt-6 space-y-3.5 text-xs text-neutral-400">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Active Postgres, Redis & Neo4j graph hooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live Mapbox GL overlays with GIS data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Enterprise Gemini API consensus models</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="mt-8 w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
              >
                Contact Sales Architect
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center">
              <Cpu className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-white">NationTwin AI</span>
          </div>
          <span className="text-[10px] text-neutral-600">
            © {new Date().getFullYear()} NationTwin AI Technologies Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
