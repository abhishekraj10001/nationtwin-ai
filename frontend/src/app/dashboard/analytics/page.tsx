'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { api } from '@/lib/api';
import { BarChart3, TrendingUp, Cpu, DollarSign, Calendar, Clock } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Area
} from 'recharts';

export default function AnalyticsPage() {
  const { cityState } = useDashboard();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(24);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await api.getCityHistory(timeRange);
        // Map data for charts
        const mapped = data.map((d: any) => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: d.weather?.temperature || 24,
          congestion: d.traffic?.congestion_level || 15,
          icu: d.hospitals?.icu_occupancy || 60,
          grid: d.energy ? (d.energy.grid_load / d.energy.capacity) * 100 : 50,
          aqi: d.air_quality?.aqi || 40,
        }));
        setHistoryData(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [timeRange, cityState]); // Update when city state changes (meaning polling has updated data)

  // Mock prediction accuracy dataset (past 7 days)
  const accuracyData = [
    { day: 'Mon', predicted: 85, actual: 82 },
    { day: 'Tue', predicted: 88, actual: 89 },
    { day: 'Wed', predicted: 90, actual: 87 },
    { day: 'Thu', predicted: 94, actual: 95 },
    { day: 'Fri', predicted: 92, actual: 91 },
    { day: 'Sat', predicted: 87, actual: 88 },
    { day: 'Sun', predicted: 91, actual: 93 },
  ];

  // Mock economic saving summary (in Rupees)
  const resourceSavings = [
    { sector: 'Traffic Flow', cost: 15000, savings: 1200000 },
    { sector: 'Grid Load Shift', cost: 50000, savings: 4500000 },
    { sector: 'Water Release', cost: 120000, savings: 9000000 },
    { sector: 'Flood Shelters', cost: 95000, savings: 3000000 },
  ];

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="p-5 glass border rounded-2xl bg-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Operational Analytics Board</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Audit historical logs, compare prediction models with actual sensor telemetry, and check the cost efficiency ratios of active recommendations.
          </p>
        </div>
        <div className="flex gap-2">
          {[6, 12, 24, 48].map((hours) => (
            <button
              key={hours}
              onClick={() => setTimeRange(hours)}
              className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                timeRange === hours 
                  ? 'bg-emerald-400 border-emerald-400 text-slate-950 shadow-md' 
                  : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Last {hours}h
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: 24h Risk Trends */}
        <div className="glass border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 flex items-center justify-between">
            <span>Sector Threat Load Trends</span>
            <Clock className="w-4 h-4 text-neutral-500" />
          </h3>
          
          <div className="h-[250px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                Loading history arrays...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#888" fontSize={9} />
                  <YAxis stroke="#888" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.9)', borderColor: 'rgba(255,255,255,0.1)', fontSize: 10 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Line type="monotone" dataKey="congestion" name="Traffic Congestion %" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="icu" name="ICU Bed Load %" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="grid" name="Electrical Grid Load %" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="aqi" name="Air Pollution Index (AQI)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Prediction Accuracy */}
        <div className="glass border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 flex items-center justify-between">
            <span>Consensus Engine Accuracy Rating</span>
            <Cpu className="w-4 h-4 text-neutral-500" />
          </h3>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={accuracyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#888" fontSize={9} />
                <YAxis stroke="#888" fontSize={9} domain={[70, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.9)', borderColor: 'rgba(255,255,255,0.1)', fontSize: 10 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="actual" name="Actual Sensor Telemetry %" fill="rgba(16, 185, 129, 0.3)" stroke="#10b981" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="predicted" name="Agent Predicted Output %" stroke="#8b5cf6" strokeWidth={2.5} dot={{ stroke: '#8b5cf6', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Cost-Benefit Analysis of recommendations */}
        <div className="glass border rounded-2xl p-6 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 flex items-center justify-between">
            <span>Interventions Cost vs Savings Ratio</span>
            <span className="text-[10px] text-neutral-400 font-mono">Values in INR (₹)</span>
          </h3>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceSavings} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="sector" stroke="#888" fontSize={9} />
                <YAxis stroke="#888" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.9)', borderColor: 'rgba(255,255,255,0.1)', fontSize: 10 }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: any) => [val ? `₹${Number(val).toLocaleString()}` : '₹0']}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="cost" name="Mitigation Deployment Cost (₹)" fill="rgba(239, 68, 68, 0.35)" stroke="#ef4444" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Calculated Loss Prevention Savings (₹)" fill="rgba(16, 185, 129, 0.35)" stroke="#10b981" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
