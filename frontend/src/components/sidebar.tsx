'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Cpu, 
  TrendingUp, 
  Play, 
  BarChart3, 
  GitFork, 
  Settings, 
  LogOut, 
  AlertTriangle,
  User,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: any;
  onLogout: () => void;
  activeAlertsCount: number;
}

export function Sidebar({ user, onLogout, activeAlertsCount }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Digital Twin Map', path: '/dashboard/map', icon: Map },
    { name: 'Multi-Agent Hub', path: '/dashboard/agents', icon: Cpu },
    { name: 'World Model Graph', path: '/dashboard/world-model', icon: GitFork },
    { name: 'Risk Predictions', path: '/dashboard/predictions', icon: TrendingUp },
    { name: 'Simulation Sandbox', path: '/dashboard/simulation', icon: Play },
    { name: 'Analytics Board', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'System Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass border-r h-screen fixed top-0 left-0 flex flex-col z-30 transition-transform duration-300 -translate-x-full md:translate-x-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            NationTwin AI
          </h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">
            Digital City Twin
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-white/10 text-white shadow-sm border border-white/15" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-emerald-400"
                )} />
                <span>{item.name}</span>
              </div>
              {item.path === '/dashboard/predictions' && activeAlertsCount > 0 && (
                <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile details at bottom */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-xl border border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 flex items-center justify-center border border-violet-500/20">
              <User className="w-5 h-5 text-violet-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{user?.name || 'Operator'}</h4>
            <p className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              {user?.role || 'Guest Mode'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 text-xs font-semibold transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}
