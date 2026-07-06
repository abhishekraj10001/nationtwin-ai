'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Terminal, ArrowRight, Settings, Navigation, Zap, Cpu, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface CommandPaletteProps {
  onTriggerAgent: (name: string) => void;
  onTriggerSimulation: (scenario: string) => void;
}

export function CommandPalette({ onTriggerAgent, onTriggerSimulation }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Command palette listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  const navigationCommands = [
    { label: 'Go to Overview', path: '/dashboard', category: 'Navigation' },
    { label: 'Go to Digital Twin Map', path: '/dashboard/map', category: 'Navigation' },
    { label: 'Go to Multi-Agent Hub', path: '/dashboard/agents', category: 'Navigation' },
    { label: 'Go to World Model Graph', path: '/dashboard/world-model', category: 'Navigation' },
    { label: 'Go to Risk Predictions', path: '/dashboard/predictions', category: 'Navigation' },
    { label: 'Go to Simulation Sandbox', path: '/dashboard/simulation', category: 'Navigation' },
    { label: 'Go to Analytics Board', path: '/dashboard/analytics', category: 'Navigation' },
    { label: 'Go to System Settings', path: '/dashboard/settings', category: 'Navigation' },
  ];

  const agentCommands = [
    { label: 'Trigger Weather Agent Consensus', action: () => onTriggerAgent('Weather Agent'), category: 'Agents' },
    { label: 'Trigger Traffic Agent Analytics', action: () => onTriggerAgent('Traffic Agent'), category: 'Agents' },
    { label: 'Trigger Hospital Resource Sweep', action: () => onTriggerAgent('Hospital Agent'), category: 'Agents' },
    { label: 'Trigger Energy Grid Safety Sweep', action: () => onTriggerAgent('Energy Agent'), category: 'Agents' },
  ];

  const simulationCommands = [
    { label: 'Run 40% Increased Rainfall Scenario', action: () => onTriggerSimulation('increase_rainfall_40'), category: 'Simulations' },
    { label: 'Run Major Arterial Road Closure Scenario', action: () => onTriggerSimulation('road_closure_major'), category: 'Simulations' },
    { label: 'Run Power Substation Transformer Outage', action: () => onTriggerSimulation('power_plant_failure'), category: 'Simulations' },
  ];

  const allCommands = [
    ...navigationCommands.map(c => ({ ...c, type: 'nav' })),
    ...agentCommands.map(c => ({ ...c, type: 'agent' })),
    ...simulationCommands.map(c => ({ ...c, type: 'sim' })),
  ];

  const filteredCommands = allCommands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: any) => {
    setIsOpen(false);
    if (cmd.type === 'nav' && cmd.path) {
      router.push(cmd.path);
    } else if (cmd.action) {
      cmd.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop close click area */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      {/* Palette Box */}
      <div className="w-full max-w-xl glass border rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[400px]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10 py-3 bg-black/25">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search panels... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 text-white text-sm focus:outline-none focus:ring-0 placeholder:text-neutral-500"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[9px] font-medium text-neutral-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching commands or actions found.
            </div>
          ) : (
            // Grouped results
            ['Navigation', 'Agents', 'Simulations'].map(cat => {
              const catCmds = filteredCommands.filter(c => c.category === cat);
              if (catCmds.length === 0) return null;
              return (
                <div key={cat} className="space-y-1">
                  <h4 className="text-[10px] uppercase font-bold text-neutral-500 px-3 py-1.5 tracking-wider">
                    {cat}
                  </h4>
                  {catCmds.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(cmd)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 text-xs text-left group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {cmd.type === 'nav' && <Navigation className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400" />}
                        {cmd.type === 'agent' && <Cpu className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400" />}
                        {cmd.type === 'sim' && <Play className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400" />}
                        <span>{cmd.label}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-black/10 flex justify-between items-center text-[10px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>NationTwin Command Line CLI</span>
          </div>
          <span>Use ⇅ to navigate, Enter to run</span>
        </div>
      </div>
    </div>
  );
}
