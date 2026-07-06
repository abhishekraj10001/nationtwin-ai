'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/components/dashboard-context';
import { Settings, Shield, User, Bell, Sliders, Database, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, user } = useDashboard();
  const [operatorName, setOperatorName] = useState('');
  const [operatorRole, setOperatorRole] = useState('');
  
  // Database configurations
  const [geminiKey, setGeminiKey] = useState('');
  const [postgresUrl, setPostgresUrl] = useState('');
  const [redisUrl, setRedisUrl] = useState('');
  const [neo4jUrl, setNeo4jUrl] = useState('');
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (user) {
      setOperatorName(user.name || '');
      setOperatorRole(user.role || '');
    }
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('cfg_gemini_key') || '');
      setPostgresUrl(localStorage.getItem('cfg_postgres_url') || 'postgresql://postgres:postgres@localhost:5432/nationtwin');
      setRedisUrl(localStorage.getItem('cfg_redis_url') || 'redis://localhost:6379/0');
      setNeo4jUrl(localStorage.getItem('cfg_neo4j_url') || 'bolt://localhost:7687');
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cfg_gemini_key', geminiKey);
      localStorage.setItem('cfg_postgres_url', postgresUrl);
      localStorage.setItem('cfg_redis_url', redisUrl);
      localStorage.setItem('cfg_neo4j_url', neo4jUrl);
      
      // Update mocked user name/role in state if changed
      const updatedUser = { ...user, name: operatorName, role: operatorRole };
      localStorage.setItem('nt_user', JSON.stringify(updatedUser));
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Settings Panel layout */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="glass border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-emerald-400" />
            <span>Operator Identity Settings</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Full Operator Name
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Designated Command Role
              </label>
              <input
                type="text"
                value={operatorRole}
                onChange={(e) => setOperatorRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="glass border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-emerald-400" />
            <span>Display Options</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Theme selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Visual Palette Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400 shadow-sm' 
                      : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Enterprise Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                    theme === 'light' 
                      ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-400 shadow-sm' 
                      : 'border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Classic Light
                </button>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                System Sound Prompts
              </label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30">
                <option>Enable Audio Alarm on Critical Risks</option>
                <option>Silent mode (Visual indicators only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database & API Credentials */}
        <div className="glass border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-white/5 pb-3 flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-emerald-400" />
            <span>Infrastructure Credentials (Live Mode)</span>
          </h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Google Gemini API Key (LLM Consensus Models)
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30 font-mono"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                PostgreSQL Relational DB URL
              </label>
              <input
                type="text"
                value={postgresUrl}
                onChange={(e) => setPostgresUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Redis Key-Value Cache DB URL
                </label>
                <input
                  type="text"
                  value={redisUrl}
                  onChange={(e) => setRedisUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Neo4j Graph Database Bolt URI
                </label>
                <input
                  type="text"
                  value={neo4jUrl}
                  onChange={(e) => setNeo4jUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-emerald-500/30 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Config Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configurations</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
