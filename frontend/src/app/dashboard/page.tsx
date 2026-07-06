'use client';

import React from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { 
  Activity, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Percent,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const { cityState, predictions, agents, alerts, triggerAgent } = useDashboard();

  if (!cityState) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500 text-sm gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <span>Syncing telemetry from digital twin sensors...</span>
      </div>
    );
  }

  // Calculate some aggregate values
  const averageConfidence = agents.length > 0
    ? Math.round((agents.reduce((acc, a) => acc + a.confidence, 0) / agents.length) * 100)
    : 0;

  const criticalThreats = predictions.filter(p => p.probability > 0.4).length;

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: City Consolidated Risk */}
        <div className="p-5 glass rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Consolidated City Risk</span>
            <AlertTriangle className={`w-4 h-4 ${criticalThreats > 0 ? 'text-rose-400 animate-pulse' : 'text-neutral-500'}`} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {criticalThreats > 0 ? `${Math.round(criticalThreats * 15 + 10)}%` : '12%'}
            </span>
            <span className="text-[10px] text-neutral-400">Threat Factor</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 truncate">
            {criticalThreats > 0 ? `${criticalThreats} elevated sector warnings` : 'All sectors categorized nominal'}
          </p>
        </div>

        {/* Card 2: Consensus Confidence */}
        <div className="p-5 glass rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Agent Consensus Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{averageConfidence}%</span>
            <span className="text-[10px] text-neutral-400">Mean Agreement</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 truncate">
            Across {agents.length} autonomous sensor engines
          </p>
        </div>

        {/* Card 3: Grid Electrical Load */}
        <div className="p-5 glass rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Energy Load Reserve</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {Math.round((cityState.energy.grid_load / cityState.energy.capacity) * 100)}%
            </span>
            <span className="text-[10px] text-neutral-400">{Math.round(cityState.energy.grid_load)} MW Load</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 truncate">
            Renewable mix generation ratio: {cityState.energy.renewable_ratio}%
          </p>
        </div>

        {/* Card 4: ICU Capacity Reserves */}
        <div className="p-5 glass rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Hospital ICU Capacity</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{cityState.hospitals.icu_occupancy}%</span>
            <span className="text-[10px] text-neutral-400">ICU Bed Use</span>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 truncate">
            Ambulances operational standby: {cityState.hospitals.available_ambulances} units
          </p>
        </div>
      </div>

      {/* Main Sections: Telemetries & Active Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Live Sector Telemetries (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass border rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <h3 className="font-bold text-white text-sm">Active City Sector Telemetry</h3>
              <Link href="/dashboard/map" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors">
                <span>View Full digital map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Traffic Telemetry */}
              <div className="p-4 border border-white/5 rounded-xl bg-black/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400">Traffic Congestion</h4>
                  <div className="text-2xl font-bold text-white mt-2">{cityState.traffic.congestion_level}%</div>
                </div>
                <div className="text-[10px] text-neutral-500 mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span>Speed: {cityState.traffic.average_speed} km/h</span>
                  <span>Incidents: {cityState.traffic.active_incidents}</span>
                </div>
              </div>

              {/* Water Reserves */}
              <div className="p-4 border border-white/5 rounded-xl bg-black/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400">Water Reservoir Level</h4>
                  <div className="text-2xl font-bold text-white mt-2">{cityState.water.reservoir_level}%</div>
                </div>
                <div className="text-[10px] text-neutral-500 mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span>Consumption: {cityState.water.daily_consumption}MLD</span>
                  <span>Quality: {cityState.water.water_quality}/100</span>
                </div>
              </div>

              {/* Air Quality Index */}
              <div className="p-4 border border-white/5 rounded-xl bg-black/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400">Air Quality Index</h4>
                  <div className="text-2xl font-bold text-white mt-2">{cityState.air_quality.aqi} AQI</div>
                </div>
                <div className="text-[10px] text-neutral-500 mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span>Main Pollutant: {cityState.air_quality.main_pollutant}</span>
                  <span>PM2.5: {cityState.air_quality.pm25} ug/m3</span>
                </div>
              </div>

              {/* Public Transport */}
              <div className="p-4 border border-white/5 rounded-xl bg-black/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400">Public Transport load</h4>
                  <div className="text-2xl font-bold text-white mt-2">{cityState.transport.passenger_load}%</div>
                </div>
                <div className="text-[10px] text-neutral-500 mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span>Active Trains: {cityState.transport.trains_active}</span>
                  <span>Delays: {cityState.transport.metro_delay_minutes} min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Agent Actions Control */}
          <div className="glass border rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-4 mb-4">Manual Agent Sweep Trigger</h3>
            <div className="flex flex-wrap gap-3">
              {['BMC Disaster Agent', 'Traffic Police Agent', 'MahaVitaran Agent', 'BMC Health Agent', 'BEST Transit Agent'].map((agentName) => (
                <button
                  key={agentName}
                  onClick={() => triggerAgent(agentName)}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/20 hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  Trigger {agentName.split(' ')[0]} Sweep
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Active Threats and Alerts Panel (1/3 width) */}
        <div className="space-y-6">
          {/* Active Threats list */}
          <div className="glass border rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="font-bold text-white text-sm">Active Threat Projections</h3>
              <Link href="/dashboard/predictions" className="text-[10px] text-neutral-500 hover:text-white font-semibold transition-colors">
                All projections
              </Link>
            </div>
            
            <div className="space-y-3">
              {predictions.slice(0, 4).map((p, idx) => (
                <div key={idx} className="p-3 border border-white/5 rounded-xl bg-black/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs capitalize">{p.type.replace('_', ' ')}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeColor(p.severity)}`}>
                      {p.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{Math.round(p.probability * 100)}%</span>
                      <span className="text-[9px] text-neutral-500">probability</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{p.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="glass border rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-4 mb-4">Live Threat Feeds</h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500">
                  No active sector failures registered.
                </div>
              ) : (
                alerts.slice(0, 3).map((a) => (
                  <div 
                    key={a.id} 
                    className="p-3 rounded-xl border border-white/5 bg-white/5 flex gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5 animate-ping" />
                    <div>
                      <h5 className="font-bold text-white text-[11px] leading-snug">{a.title}</h5>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-normal">{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
