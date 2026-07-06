'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { api } from '@/lib/api';
import { TrendingUp, AlertTriangle, Clock, HelpCircle, Eye, Info, RefreshCw } from 'lucide-react';

export default function PredictionsPage() {
  const { predictions } = useDashboard();
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Fetch explanation when a risk is selected
  useEffect(() => {
    if (!selectedRisk) {
      setExplanation(null);
      return;
    }
    
    const fetchExplanation = async () => {
      setLoadingExplain(true);
      try {
        const data = await api.getPredictionExplain(selectedRisk);
        setExplanation(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingExplain(false);
      }
    };
    
    fetchExplanation();
  }, [selectedRisk]);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Predictions List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass border rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-4 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
              <span>Risk Predictions Hub</span>
            </h3>

            <div className="space-y-3">
              {predictions.map((p) => (
                <div 
                  key={p.type}
                  onClick={() => setSelectedRisk(p.type)}
                  className={`p-4 border rounded-xl bg-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                    selectedRisk === p.type 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-white text-xs capitalize leading-none">
                        {p.type.replace(/_/g, ' ')}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeColor(p.severity)}`}>
                        {p.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal mt-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-xs">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{Math.round(p.probability * 100)}%</div>
                      <div className="text-[9px] text-neutral-500">Probability</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{Math.round(p.confidence * 100)}%</div>
                      <div className="text-[9px] text-neutral-500">Confidence</div>
                    </div>
                    <div className="text-right flex items-center gap-1.5 text-neutral-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{p.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explainability Side Panel (1/3 width) */}
        <div className="space-y-4">
          <div className="glass border rounded-2xl p-5 min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-emerald-400" />
                <span>Explainability Panel</span>
              </h3>

              {loadingExplain ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 text-xs gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>Fetching agent weights and reasoning chains...</span>
                </div>
              ) : explanation ? (
                <div className="space-y-4 text-xs">
                  {/* Data Used */}
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Sensor Data Inputs</span>
                    <div className="flex flex-wrap gap-1.5">
                      {explanation.data_used.map((data: string) => (
                        <span key={data} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-neutral-300">
                          {data}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning Chain */}
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Reasoning Chain</span>
                    <ul className="space-y-1.5">
                      {explanation.reasoning_steps.map((step: string, idx: number) => (
                        <li key={idx} className="text-[10px] text-neutral-400 leading-normal flex gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Agent Contributions */}
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Agent Contributions</span>
                    <div className="space-y-2">
                      {Object.entries(explanation.agent_contributions).map(([agent, weight]: any) => (
                        <div key={agent} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-medium text-neutral-400">
                            <span>{agent}</span>
                            <span>{weight}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                              style={{ width: `${weight}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uncertainty Factors */}
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-1.5">Uncertainty Factors</span>
                    <ul className="space-y-1">
                      {explanation.uncertainty_factors.map((factor: string) => (
                        <li key={factor} className="text-[10px] text-neutral-500 leading-normal flex gap-1.5">
                          <span className="text-rose-400 font-bold shrink-0">!</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-neutral-500 text-xs">
                  Select a threat prediction card to audit reasoning traces.
                </div>
              )}
            </div>

            <div className="p-3 border border-white/5 rounded-xl bg-violet-600/5 flex gap-2 text-xs mt-4">
              <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Explainability updates dynamically whenever a new consensus loop is executed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
