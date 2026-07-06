'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboard } from '@/components/dashboard-context';
import { Sidebar } from '@/components/sidebar';
import { NotificationsPanel } from '@/components/notifications-panel';
import { CommandPalette } from '@/components/command-palette';
import { Search, Terminal, Menu, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    user, 
    logout, 
    alerts, 
    markAllAlertsAsRead, 
    dismissAlert,
    triggerAgent,
    runSimulation,
    loading 
  } = useDashboard();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !user) {
      const savedUser = localStorage.getItem('nt_user');
      if (!savedUser) {
        router.push('/login');
      }
    }
  }, [user, mounted, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sm font-semibold text-neutral-500">
        Authenticating operator credentials...
      </div>
    );
  }

  // Get Page Title from path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview Control';
    if (pathname === '/dashboard/map') return 'City Digital Twin Map';
    if (pathname === '/dashboard/agents') return 'Multi-Agent Command Hub';
    if (pathname === '/dashboard/world-model') return 'World Model Graph Network';
    if (pathname === '/dashboard/predictions') return 'Predictive Threat Analysis';
    if (pathname === '/dashboard/simulation') return 'Simulative Crisis Sandbox';
    if (pathname === '/dashboard/analytics') return 'Statistical Analytics';
    if (pathname === '/dashboard/settings') return 'System Settings';
    return 'Operator Panel';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-neutral-200 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user} 
        onLogout={logout} 
        activeAlertsCount={alerts.filter(a => !a.read).length} 
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative z-10">
        {/* Top Header Bar */}
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-slate-950/45 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 md:hidden">
              <Menu className="w-4.5 h-4.5" />
            </button>
            <h2 className="font-bold text-white text-sm tracking-tight md:text-base">
              {getPageTitle()}
            </h2>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Command shortcut prompt */}
            <button 
              onClick={() => {
                // Dispatch command palette keyboard event to open
                const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                document.dispatchEvent(e);
              }}
              className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-xs text-neutral-400 font-medium transition-all"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <span>Search command palette...</span>
              <kbd className="h-4 select-none items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1 font-mono text-[9px] font-medium text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {/* Notifications panel dropdown */}
            <NotificationsPanel 
              alerts={alerts} 
              onMarkAllAsRead={markAllAlertsAsRead} 
              onDismissAlert={dismissAlert} 
            />

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 border border-white/10 bg-emerald-500/10 px-3 py-1.5 rounded-xl border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Syncing live</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Command Palette Overlay */}
      <CommandPalette 
        onTriggerAgent={triggerAgent} 
        onTriggerSimulation={runSimulation} 
      />
    </div>
  );
}
