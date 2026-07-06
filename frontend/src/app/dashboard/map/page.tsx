'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/components/dashboard-context';
import { Landmark, Compass, Server, Info } from 'lucide-react';

// Dynamically import Leaflet CityMap to bypass SSR build failures
const CityMap = dynamic(() => import('@/components/city-map'), { 
  ssr: false,
  loading: () => (
    <div className="h-[75vh] w-full border border-white/10 rounded-2xl flex flex-col items-center justify-center text-neutral-500 text-sm gap-2 bg-slate-900/50 backdrop-blur-md">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      <span>Initializing Geographic GIS Assets...</span>
    </div>
  )
});

export default function MapPage() {
  const { cityState } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Geographic Canvas (3/4 width) */}
        <div className="lg:col-span-3">
          <CityMap />
        </div>

        {/* Infrastructure Nodes Summary (1/4 width) */}
        <div className="space-y-4">
          <div className="glass border rounded-2xl p-5 h-full flex flex-col">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-emerald-400" />
              <span>Asset Inventory</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 text-xs">
              <div className="p-3 border border-white/5 rounded-xl bg-black/10">
                <div className="font-semibold text-white">AquaPure Reservoir</div>
                <div className="text-neutral-500 mt-1">Sector 2 • Water Storage</div>
                <div className="mt-2 text-emerald-400 font-medium">
                  Volume Capacity: {cityState?.water.reservoir_level}%
                </div>
              </div>

              <div className="p-3 border border-white/5 rounded-xl bg-black/10">
                <div className="font-semibold text-white">GigaWatt Energy Hub</div>
                <div className="text-neutral-500 mt-1">Sector 6 • Substation Grid</div>
                <div className="mt-2 text-amber-400 font-medium">
                  Load status: {cityState ? Math.round(cityState.energy.grid_load) : 0} MW
                </div>
              </div>

              <div className="p-3 border border-white/5 rounded-xl bg-black/10">
                <div className="font-semibold text-white">Central Hospital</div>
                <div className="text-neutral-500 mt-1">Sector 3 • Medical Trauma</div>
                <div className="mt-2 text-rose-400 font-medium">
                  ICU Beds occupancy: {cityState?.hospitals.icu_occupancy}%
                </div>
              </div>

              <div className="p-3 border border-white/5 rounded-xl bg-black/10">
                <div className="font-semibold text-white">Metro Traffic Control</div>
                <div className="text-neutral-500 mt-1">Sector 1 • Arterial Road Flow</div>
                <div className="mt-2 text-emerald-400 font-medium">
                  Congestion: {cityState?.traffic.congestion_level}%
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 border border-white/5 rounded-xl bg-violet-600/5 flex gap-2">
              <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Click map nodes to open popups showing current telemetry logs and sensor attributes.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
