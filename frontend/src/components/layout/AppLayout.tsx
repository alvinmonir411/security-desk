'use client';

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  Users,
  Wand2,
  ShieldCheck,
  CalendarCheck2,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useRoster, RoleType } from '../../context/RosterContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    currentDate,
    prevDay,
    nextDay,
    goToToday,
    currentRole,
    setCurrentRole,
    activeNav,
    setActiveNav,
    toasts,
    removeToast,
  } = useRoster();

  // Navigation Items per Spec
  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'AGM', 'DGM', 'SUPERVISOR', 'SECURITY_GUARD'] },
    { id: 'deployment', label: '2. Deployment Board', icon: Layers, roles: ['MANAGER', 'SUPERVISOR', 'AGM', 'DGM'] },
    { id: 'matrix', label: '3. Guard Matrix (7-day)', icon: CalendarDays, roles: ['MANAGER', 'AGM', 'DGM'] },
    { id: 'guards', label: '4. Guards Directory', icon: Users, roles: ['MANAGER', 'SUPERVISOR', 'AGM', 'DGM'] },
    { id: 'generate', label: '5. Generate Roster (Wizard)', icon: Wand2, roles: ['MANAGER'] },
    { id: 'health', label: '6. Roster Health / Validation', icon: ShieldCheck, roles: ['MANAGER', 'AGM', 'DGM'] },
    { id: 'leave', label: '7. Leave & Attendance', icon: CalendarCheck2, roles: ['MANAGER', 'SUPERVISOR', 'SECURITY_GUARD'] },
    { id: 'reports', label: '8. Reports', icon: FileSpreadsheet, roles: ['MANAGER', 'AGM', 'DGM'] },
    { id: 'settings', label: '9. Settings', icon: Settings, roles: ['MANAGER'] },
  ];

  // Filtered by active role
  const visibleNavs = navItems.filter((item) => item.roles.includes(currentRole));

  const formatDisplayDate = (dStr: string) => {
    const d = new Date(dStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* 5-Second Undo Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 border border-sky-500 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 min-w-[320px] animate-slide-in"
          >
            <span>{toast.message}</span>
            <div className="flex items-center gap-2">
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction!();
                    removeToast(toast.id);
                  }}
                  className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Undo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-40">
        <div className="h-16 px-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wider">
              SHIELD<span className="text-sky-400">OPS</span>
            </h1>
            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/60">
              ROSTER SYSTEM v3.2
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-2">
            Navigation Menu
          </div>
          {visibleNavs.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Role Indicator */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Perspective:</div>
          <div className="font-bold text-slate-200 mt-0.5">{currentRole}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar Header per Spec */}
        <header className="h-16 px-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={prevDay}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
              >
                Today
              </button>
              <button
                onClick={nextDay}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-bold text-slate-200">
              {formatDisplayDate(currentDate)}
            </span>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveNav('reports')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 shadow transition"
              title="Print Daily Roster Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> 🖨️ Print / Export
            </button>

            {/* Role Dropdown Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as RoleType)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="MANAGER">🏢 Security Manager</option>
                <option value="SUPERVISOR">👮 Supervisor</option>
                <option value="DGM">🏛️ DGM (Executive View)</option>
                <option value="AGM">🎖️ AGM (Audit View)</option>
                <option value="SECURITY_GUARD">🛡️ Security Guard</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
