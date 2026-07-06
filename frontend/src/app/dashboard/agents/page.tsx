'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Eye, Sparkles } from 'lucide-react';

export default function AgentsPage() {
  const { agents, triggerAgent } = useDashboard();
  const [triggering, setTriggering] = useState<string | null>(null);

  const handleTrigger = async (name: string) => {
    setTriggering(name);
    try {
      await triggerAgent(name);
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'working':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Analyzing</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Error</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span>Synced</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header info */}
      <div className="p-6 glass border rounded-2xl bg-black/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Multi-Agent Consensus Network</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-xl leading-relaxed">
            12 specialized AI agent modules run parallel monitoring loops. They cross-correlate environmental, hospital, and traffic telemetry, forming predictions through consensus weight matrices.
          </p>
        </div>
        <div className="flex gap-4 border border-white/5 bg-white/5 rounded-2xl px-5 py-4 shrink-0 text-center text-xs">
          <div>
            <div className="font-extrabold text-white text-base">{agents.length}</div>
            <div className="text-[10px] text-neutral-500 uppercase mt-0.5 font-semibold">Active Agents</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="font-extrabold text-emerald-400 text-base">
              {agents.filter(a => a.status === 'idle').length}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase mt-0.5 font-semibold">Synced</div>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <div className="font-extrabold text-white text-base">
              {agents.length > 0 ? `${Math.round(agents.reduce((acc, a) => acc + a.confidence, 0) / agents.length * 100)}%` : '0%'}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase mt-0.5 font-semibold">Mean Conf</div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <div 
            key={agent.name} 
            className="glass border rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-slate-900/60 transition-all flex flex-col justify-between"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs leading-none">{agent.name}</h4>
                    <span className="text-[9px] text-neutral-500 mt-1 block">Confidence: {Math.round(agent.confidence * 100)}%</span>
                  </div>
                </div>
                {getStatusBadge(agent.status)}
              </div>
              
              <p className="text-[11px] text-neutral-400 leading-relaxed min-h-[44px]">
                {agent.role}
              </p>

              {/* Observations Log */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <h5 className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2.5 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Observation Stream</span>
                </h5>
                <ul className="space-y-1.5">
                  {agent.observations.slice(0, 3).map((obs: string, idx: number) => (
                    <li key={idx} className="text-[10px] text-neutral-400 leading-normal flex gap-1.5">
                      <span className="text-emerald-400 shrink-0 select-none">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-neutral-500">
                Last: {new Date(agent.last_execution).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <button
                onClick={() => handleTrigger(agent.name)}
                disabled={triggering === agent.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-emerald-500/20 hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {triggering === agent.name ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Cpu className="w-3 h-3" />
                )}
                <span>Sweep Agent</span>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
