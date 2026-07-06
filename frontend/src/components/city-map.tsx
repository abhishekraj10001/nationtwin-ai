'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from './dashboard-context';
import { Activity, ShieldAlert, Zap, Thermometer, Wind, Droplet } from 'lucide-react';

// Setup Map Center: Mumbai coordinates
const CENTER_LAT = 19.0330;
const CENTER_LNG = 72.8540;

// Custom Leaflet hook to invalidate size when container size changes
function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

export default function CityMap() {
  const { cityState, predictions } = useDashboard();
  const [activeLayer, setActiveLayer] = useState<'none' | 'traffic' | 'pollution' | 'energy' | 'heatmap'>('none');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !cityState) return null;

  // Custom DivIcon creator to bypass static asset issues and render modern radar dots
  const createGlowingIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Mumbai-based Infrastructure nodes coordinates
  const mapEntities = [
    {
      id: "weather_node",
      name: "Colaba Weather Observatory",
      position: [18.9067, 72.8147] as [number, number],
      color: "#3b82f6",
      type: "weather",
      details: `Temp: ${cityState.weather.temperature}°C, Condition: ${cityState.weather.condition}`
    },
    {
      id: "traffic_grid",
      name: "Western Express Highway Grid",
      position: [19.0645, 72.8480] as [number, number],
      color: cityState.traffic.congestion_level > 50 ? "#ef4444" : "#10b981",
      type: "traffic",
      details: `Congestion: ${cityState.traffic.congestion_level}%, Speed: ${cityState.traffic.average_speed} km/h`
    },
    {
      id: "city_hospital",
      name: "KEM Sion Public Hospital",
      position: [19.0350, 72.8600] as [number, number],
      color: cityState.hospitals.icu_occupancy > 80 ? "#f59e0b" : "#10b981",
      type: "hospital",
      details: `ICU occupancy: ${cityState.hospitals.icu_occupancy}%, Beds: ${cityState.hospitals.occupied_beds}/${cityState.hospitals.total_beds}`
    },
    {
      id: "power_station",
      name: "Trombay Energy Hub",
      position: [19.0020, 72.9150] as [number, number],
      color: cityState.energy.outages.length > 0 ? "#ef4444" : "#f59e0b",
      type: "power",
      details: `Grid Load: ${cityState.energy.grid_load}MW / Capacity: ${cityState.energy.capacity}MW`
    },
    {
      id: "water_supply",
      name: "Bhatsa Lake Reservoir",
      position: [19.1450, 72.8310] as [number, number],
      color: "#06b6d4",
      type: "water",
      details: `Reservoir level: ${cityState.water.reservoir_level}%, Water Quality: ${cityState.water.water_quality}/100`
    },
    {
      id: "central_school",
      name: "BKC International School",
      position: [19.0600, 72.8650] as [number, number],
      color: "#8b5cf6",
      type: "school",
      details: "Facility Status: Nominal. Evacuation drills set."
    },
    {
      id: "population_center",
      name: "Dharavi Residential Grid",
      position: [19.0380, 72.8538] as [number, number],
      color: "#6366f1",
      type: "population",
      details: `Density: ${cityState.population.density} people/km2, Active Citizens: ${cityState.population.active_citizens}`
    }
  ];

  // Route connections representing Sea Link and WEH links
  const highwayLines = [
    [[18.9067, 72.8147], [19.0645, 72.8480]], // Colaba to WEH
    [[19.0645, 72.8480], [19.0350, 72.8600]], // WEH to Sion Hospital
    [[19.0350, 72.8600], [19.0380, 72.8538]], // Sion to Dharavi
    [[19.0020, 72.9150], [19.0380, 72.8538]], // Trombay Power to Dharavi
    [[19.1450, 72.8310], [19.0645, 72.8480]]  // Bhatsa to WEH
  ] as [number, number][][];

  // Get color for overlay layers based on stats
  const getTrafficColor = () => {
    const cong = cityState.traffic.congestion_level;
    return cong > 70 ? '#ef4444' : (cong > 40 ? '#f59e0b' : '#10b981');
  };

  const getPollutionColor = () => {
    const aqi = cityState.air_quality.aqi;
    return aqi > 150 ? '#ef4444' : (aqi > 100 ? '#f59e0b' : '#10b981');
  };

  return (
    <div className="h-[75vh] w-full relative border border-white/10 rounded-2xl overflow-hidden glass shadow-xl">
      {/* Map Instance */}
      <MapContainer 
        center={[CENTER_LAT, CENTER_LNG]} 
        zoom={12} 
        zoomControl={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Helper sizing hook */}
        <ResizeMap />

        {/* Render lines for highways */}
        {highwayLines.map((line, idx) => (
          <Polyline 
            key={idx}
            positions={line}
            color={activeLayer === 'traffic' ? getTrafficColor() : 'rgba(255, 255, 255, 0.15)'}
            weight={activeLayer === 'traffic' ? 6 : 3}
            opacity={0.8}
          />
        ))}

        {/* Overlays / Heatmap rendering */}
        {activeLayer === 'pollution' && (
          <Circle 
            center={[19.0645, 72.8480]}
            radius={3200}
            pathOptions={{ fillColor: getPollutionColor(), color: 'transparent', fillOpacity: 0.18 }}
          />
        )}

        {activeLayer === 'energy' && cityState.energy.outages.length > 0 && (
          <Circle 
            center={[19.0020, 72.9150]}
            radius={2200}
            pathOptions={{ fillColor: '#ef4444', color: 'transparent', fillOpacity: 0.22 }}
          />
        )}

        {activeLayer === 'heatmap' && predictions.some(p => p.probability > 0.5) && (
          <Circle 
            center={[19.0380, 72.8538]}
            radius={4000}
            pathOptions={{ fillColor: '#ef4444', color: 'transparent', fillOpacity: 0.15 }}
          />
        )}

        {/* Standard Markers */}
        {mapEntities.map((entity) => (
          <Marker 
            key={entity.id}
            position={entity.position}
            icon={createGlowingIcon(entity.color)}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-slate-950">
                <h4 className="font-bold text-xs border-b pb-1 mb-1">{entity.name}</h4>
                <p className="text-[10px] leading-relaxed font-medium">{entity.details}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer Control Panel */}
      <div className="absolute bottom-4 left-4 z-10 glass border p-3.5 rounded-2xl flex flex-col gap-2 bg-slate-950/75 max-w-[200px]">
        <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">
          Command Overlays
        </h4>
        <button
          onClick={() => setActiveLayer(activeLayer === 'traffic' ? 'none' : 'traffic')}
          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold text-left transition-all ${
            activeLayer === 'traffic' 
              ? 'bg-emerald-400 border-emerald-400 text-slate-950' 
              : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Traffic Congestion
        </button>
        <button
          onClick={() => setActiveLayer(activeLayer === 'pollution' ? 'none' : 'pollution')}
          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold text-left transition-all ${
            activeLayer === 'pollution' 
              ? 'bg-blue-400 border-blue-400 text-slate-950' 
              : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Air Pollution AQI
        </button>
        <button
          onClick={() => setActiveLayer(activeLayer === 'energy' ? 'none' : 'energy')}
          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold text-left transition-all ${
            activeLayer === 'energy' 
              ? 'bg-amber-400 border-amber-400 text-slate-950' 
              : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Energy Grid Outages
        </button>
        <button
          onClick={() => setActiveLayer(activeLayer === 'heatmap' ? 'none' : 'heatmap')}
          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold text-left transition-all ${
            activeLayer === 'heatmap' 
              ? 'bg-rose-400 border-rose-400 text-slate-950' 
              : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Integrated Risk Heatmap
        </button>
      </div>
    </div>
  );
}
