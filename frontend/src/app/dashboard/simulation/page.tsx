'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { api } from '@/lib/api';
import { Play, TrendingUp, DollarSign, Heart, ShieldAlert, Calendar, History, Trash } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

export default function SimulationPage() {
  const { runSimulation } = useDashboard();
  const [selectedScenario, setSelectedScenario] = useState<string>('increase_rainfall_40');
  const [intensity, setIntensity] = useState<number>(1.0);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const scenariosList = [
    { value: 'increase_rainfall_40', label: 'Monsoon Deluge Precipitation (+40%)', desc: 'Models drainage capacities, Kurla/Hindmata floods, and road access issues.' },
    { value: 'road_closure_major', label: 'Sea Link Closed (Gridlock)', desc: 'Models Western Express Highway traffic redirections, commute delay multipliers, and emission AQI spikes.' },
    { value: 'power_plant_failure', label: 'Trombay Grid Outage (Transformer Down)', desc: 'Models blackout segments, backup power cutovers, and emergency hospital diversions.' },
    { value: 'hospital_shutdown', label: 'Hospital IT Cyberattack / Lockout', desc: 'Models bed shortages, ICU emergency diversions, and ambulance route overflows.' },
    { value: 'festival_crowd', label: 'Ganesh Chaturthi Transit Surge', desc: 'Models local train load spikes, localized commercial gridload, and minor heat advisories.' },
    { value: 'pandemic_outbreak', label: 'Epidemiological Infectious Outbreak', desc: 'Models progressive quarantine measures, inpatient overflows, and long-term economic shifts.' }
  ];

  const fetchHistory = async () => {
    try {
      const data = await api.getSimulationsHistory();
      setHistory(data);
      if (data.length > 0 && !activeResult) {
        setActiveResult(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await runSimulation(selectedScenario, intensity);
      // Wait briefly for simulation completion
      setTimeout(async () => {
        const updatedHistory = await api.getSimulationsHistory();
        setHistory(updatedHistory);
        if (updatedHistory.length > 0) {
          setActiveResult(updatedHistory[0]);
        }
        setRunning(false);
      }, 800);
    } catch (e) {
      console.error(e);
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario Selector Panel (1/3 width) */}
        <div className="glass border rounded-2xl p-6 space-y-5">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-4 mb-2 flex items-center gap-2">
            <Play className="w-4.5 h-4.5 text-emerald-400" />
            <span>Configure Scenario Sandbox</span>
          </h3>

          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              Select Scenario Preset
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500/30"
            >
              {scenariosList.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-400 mt-2 italic leading-relaxed">
              {scenariosList.find(s => s.value === selectedScenario)?.desc}
            </p>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              <span>Severity Intensity</span>
              <span className="text-white font-mono">{intensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-neutral-500 font-semibold uppercase">
              <span>0.5x Mild</span>
              <span>1.0x Nominal</span>
              <span>2.0x Catastrophic</span>
            </div>
          </div>

          {/* Fire Button */}
          <button
            onClick={handleRun}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {running ? (
              <span>Injecting parameters...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Inject Scenario Model</span>
              </>
            )}
          </button>
        </div>

        {/* Live Simulation Results Panel (2/3 width) */}
        <div className="lg:col-span-2 glass border rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                <span>Computed Scenario Impact</span>
              </span>
              {activeResult && (
                <span className="text-[10px] text-neutral-400 font-mono capitalize">
                  ID: {activeResult.id} • {activeResult.scenario.replace(/_/g, ' ')}
                </span>
              )}
            </h3>

            {activeResult ? (
              <div className="space-y-6">
                {/* Stats Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 border border-white/5 rounded-xl bg-black/10 text-center">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Economic Cost</div>
                    <div className="text-base font-extrabold text-white mt-1 flex items-center justify-center">
                      <span className="text-rose-400 mr-0.5 font-bold">₹</span>
                      <span>{activeResult.economic_impact_total}Cr</span>
                    </div>
                  </div>
                  <div className="p-3 border border-white/5 rounded-xl bg-black/10 text-center">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Lives Affected</div>
                    <div className="text-base font-extrabold text-white mt-1 flex items-center justify-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>{activeResult.lives_affected_total}</span>
                    </div>
                  </div>
                  <div className="p-3 border border-white/5 rounded-xl bg-black/10 text-center">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Property Damage</div>
                    <div className="text-base font-extrabold text-white mt-1 flex items-center justify-center">
                      <span className="text-rose-400 mr-0.5 font-bold">₹</span>
                      <span>{activeResult.infrastructure_damage_total}Cr</span>
                    </div>
                  </div>
                  <div className="p-3 border border-white/5 rounded-xl bg-black/10 text-center">
                    <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Recovery Cycle</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeResult.recovery_time_days} days</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Curve */}
                <div className="h-[220px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={activeResult.timeline}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="time_offset_hours" 
                        stroke="#888" 
                        fontSize={9} 
                        tickFormatter={(v) => `+${v}h`} 
                      />
                      <YAxis stroke="#888" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.9)', borderColor: 'rgba(255,255,255,0.1)', fontSize: 10 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Area 
                        type="monotone" 
                        dataKey="severity_level" 
                        name="Severity Index" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorSeverity)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="recovery_progress" 
                        name="Recovery Progress %" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorRecovery)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-neutral-500 text-xs">
                No active simulation models run yet. Click 'Inject Scenario' to calculate curves.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Historical Runs Comparisons */}
      <div className="glass border rounded-2xl p-6">
        <h3 className="font-bold text-white text-sm border-b border-white/5 pb-4 mb-4 flex items-center gap-2">
          <History className="w-4.5 h-4.5 text-emerald-400" />
          <span>Scenario Injection History Log</span>
        </h3>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-neutral-400 font-medium">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Scenario Presets</th>
                <th className="py-3 px-4 text-right">Econ Cost</th>
                <th className="py-3 px-4 text-right">Lives Impacted</th>
                <th className="py-3 px-4 text-right">Damage Impact</th>
                <th className="py-3 px-4 text-right">Recovery Cycle</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-neutral-500">
                    No historical logs compiled.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr 
                    key={h.id} 
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                      activeResult?.id === h.id ? 'bg-white/5 font-semibold text-white' : 'text-neutral-400'
                    }`}
                    onClick={() => setActiveResult(h)}
                  >
                    <td className="py-3 px-4">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 capitalize">{h.scenario.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-right">₹{h.economic_impact_total}Cr</td>
                    <td className="py-3 px-4 text-right">{h.lives_affected_total}</td>
                    <td className="py-3 px-4 text-right">₹{h.infrastructure_damage_total}Cr</td>
                    <td className="py-3 px-4 text-right">{h.recovery_time_days} days</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveResult(h);
                        }}
                        className="text-[10px] text-emerald-400 hover:underline font-semibold"
                      >
                        Load Graph
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
