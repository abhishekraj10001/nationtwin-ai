'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AlertMessage } from '@/components/notifications-panel';

interface DashboardContextType {
  user: any;
  cityState: any;
  agents: any[];
  predictions: any[];
  interventions: any[];
  alerts: AlertMessage[];
  theme: 'light' | 'dark';
  loading: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  triggerAgent: (name: string) => Promise<void>;
  runSimulation: (scenario: string, intensity?: number) => Promise<void>;
  executeIntervention: (id: string, action: 'approve' | 'reject' | 'execute') => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginAsGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  markAllAlertsAsRead: () => void;
  dismissAlert: (id: string) => void;
  triggerRefresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cityState, setCityState] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);

  // Theme support
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', newTheme);
    }
  };

  // Hydrate auth/theme on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('nt_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme('dark'); // default dark
      }
    }
  }, []);

  const triggerRefresh = async () => {
    try {
      const [stateData, agentsData, predictionsData, recData] = await Promise.all([
        api.getCityState(),
        api.getAgents(),
        api.getPredictions(),
        api.getRecommendations()
      ]);
      setCityState(stateData);
      setAgents(agentsData);
      setPredictions(predictionsData);
      setInterventions(recData);
      
      // Calculate/Generate Alerts based on predictions & state data
      generateAlertsFromTelemetry(predictionsData, stateData);
    } catch (error) {
      console.error("Failed to refresh dashboard telemetry:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate alerts dynamically from data
  const generateAlertsFromTelemetry = (preds: any[], state: any) => {
    const newAlerts: AlertMessage[] = [...alerts];
    
    // Check predictions
    preds.forEach(p => {
      if (p.probability > 0.4) {
        const id = `alert_${p.type}_${Math.floor(p.probability * 100)}`;
        // Check if alert already exists
        if (!newAlerts.some(a => a.id.startsWith(`alert_${p.type}`))) {
          newAlerts.unshift({
            id,
            title: `Elevated ${p.type.replace('_', ' ')} Warning`,
            message: p.description,
            severity: p.probability > 0.8 ? 'critical' : 'warning',
            timestamp: new Date(),
            read: false
          });
        }
      }
    });

    // Check specific state thresholds
    if (state?.energy?.outages?.length > 0) {
      if (!newAlerts.some(a => a.id === 'alert_grid_outage')) {
        newAlerts.unshift({
          id: 'alert_grid_outage',
          title: 'Power Grid Outages Active',
          message: `Blackouts registered in: ${state.energy.outages.join(', ')}`,
          severity: 'critical',
          timestamp: new Date(),
          read: false
        });
      }
    }

    if (state?.hospitals?.icu_occupancy > 85.0) {
      if (!newAlerts.some(a => a.id === 'alert_hospital_icu')) {
        newAlerts.unshift({
          id: 'alert_hospital_icu',
          title: 'ICU Capacity Saturation Alert',
          message: `ICU occupancy exceeded safe threshold: ${state.hospitals.icu_occupancy}%`,
          severity: 'critical',
          timestamp: new Date(),
          read: false
        });
      }
    }

    // Cap alerts at 15
    setAlerts(newAlerts.slice(0, 15));
  };

  // Polling loop
  useEffect(() => {
    triggerRefresh();
    const interval = setInterval(triggerRefresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerAgent = async (name: string) => {
    try {
      await api.triggerAgent(name);
      await triggerRefresh();
      
      // Push check alert
      setAlerts(prev => [
        {
          id: `agent_trigger_${Date.now()}`,
          title: `${name} Executed`,
          message: `Agent consensus cycle successfully triggered. Observations updated.`,
          severity: 'info',
          timestamp: new Date(),
          read: false
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Agent trigger failed:", error);
    }
  };

  const runSimulation = async (scenario: string, intensity = 1.0) => {
    setLoading(true);
    try {
      await api.runSimulation(scenario, intensity);
      await triggerRefresh();
      
      setAlerts(prev => [
        {
          id: `sim_run_${Date.now()}`,
          title: 'Simulation Sandbox Fired',
          message: `Scenario '${scenario.replace(/_/g, ' ')}' successfully injected into digital twin.`,
          severity: 'warning',
          timestamp: new Date(),
          read: false
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Simulation run failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeIntervention = async (id: string, action: 'approve' | 'reject' | 'execute') => {
    try {
      await api.executeRecommendation(id, action);
      await triggerRefresh();
      
      const interv = interventions.find(i => i.id === id);
      setAlerts(prev => [
        {
          id: `interv_${action}_${Date.now()}`,
          title: `Intervention ${action === 'execute' ? 'Executed' : (action === 'approve' ? 'Approved' : 'Rejected')}`,
          message: `'${interv?.title || 'Action'}' status updated successfully.`,
          severity: action === 'execute' ? 'info' : 'info',
          timestamp: new Date(),
          read: false
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Intervention update failed:", error);
    }
  };

  const loginAsGuest = async () => {
    try {
      const res = await api.loginGuest();
      if (res.status === 'success') {
        setUser(res.user);
        localStorage.setItem('nt_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Guest login failed:", error);
    }
  };

  const loginAsGoogle = async () => {
    try {
      const res = await api.loginGoogle();
      if (res.status === 'success') {
        setUser(res.user);
        localStorage.setItem('nt_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      localStorage.removeItem('nt_user');
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DashboardContext.Provider value={{
      user,
      cityState,
      agents,
      predictions,
      interventions,
      alerts,
      theme,
      loading,
      setTheme,
      triggerAgent,
      runSimulation,
      executeIntervention,
      loginAsGuest,
      loginAsGoogle,
      logout,
      markAllAlertsAsRead,
      dismissAlert,
      triggerRefresh
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
