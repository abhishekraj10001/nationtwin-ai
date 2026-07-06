'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, X, AlertTriangle, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertMessage {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  alerts: AlertMessage[];
  onMarkAllAsRead: () => void;
  onDismissAlert: (id: string) => void;
}

export function NotificationsPanel({ alerts, onMarkAllAsRead, onDismissAlert }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = alerts.filter(a => !a.read).length;

  // Close notifications panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#notifications-dropdown-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  const getAlertIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div id="notifications-dropdown-container" className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl border transition-all duration-200",
          isOpen
            ? "bg-white/10 border-white/20 text-white"
            : "border-white/10 hover:border-white/20 text-neutral-400 hover:text-white hover:bg-white/5"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass border rounded-2xl shadow-xl z-50 flex flex-col max-h-[450px]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Crisis Command Alerts</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {alerts.length === 0 ? (
              <div className="py-8 px-4 text-center text-neutral-500 text-xs">
                No active threats or alerts detected.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-xl border transition-all flex gap-3 relative group",
                    alert.read 
                      ? "bg-transparent border-transparent opacity-60" 
                      : "bg-white/5 border-white/10 hover:bg-white/8"
                  )}
                >
                  <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h5 className="font-medium text-white text-xs leading-normal">{alert.title}</h5>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{alert.message}</p>
                    <span className="text-[9px] text-neutral-500 mt-2 block">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="absolute top-2 right-2 p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 text-center bg-black/10 rounded-b-2xl">
            <span className="text-[10px] text-neutral-500">
              City sensors update automatically every 5s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
