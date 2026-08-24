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
  LogOut,
  User,
  Crown,
  Bell,
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
    currentUser,
    currentRole,
    setCurrentRole,
    loginUser,
    logoutUser,
    activeNav,
    setActiveNav,
    toasts,
    removeToast,
    overtimeRequests,
  } = useRoster();

  const pendingOTCount = overtimeRequests.filter((r) => r.status === 'PENDING').length;

  // Navigation Items per Spec
  const navItems = [
    { id: 'dashboard', label: currentRole === 'DGM' ? '1. DGM Executive Command' : currentRole === 'AGM' ? '1. AGM Operations Command' : '1. Dashboard', icon: LayoutDashboard, roles: ['MANAGER', 'AGM', 'DGM', 'SUPERVISOR', 'SECURITY_GUARD'] },
    { id: 'deployment', label: '2. Master Deployment Board', icon: Layers, roles: ['MANAGER', 'SUPERVISOR', 'AGM', 'DGM'] },
    { id: 'matrix', label: '3. Guards & Duty Matrix (7-day)', icon: CalendarDays, roles: ['MANAGER', 'AGM', 'DGM', 'SUPERVISOR'] },
    { id: 'generate', label: '4. Generate Roster (Wizard)', icon: Wand2, roles: ['MANAGER', 'DGM'] },
    { id: 'health', label: '5. Roster Health / Validation', icon: ShieldCheck, roles: ['MANAGER', 'AGM', 'DGM'] },
    { id: 'leave', label: '6. Leave & Attendance', icon: CalendarCheck2, roles: ['MANAGER', 'SUPERVISOR', 'SECURITY_GUARD', 'AGM', 'DGM'] },
    { id: 'reports', label: '7. Reports & Muster Roll', icon: FileSpreadsheet, roles: ['MANAGER', 'AGM', 'DGM', 'SUPERVISOR'] },
    { id: 'settings', label: '8. Settings', icon: Settings, roles: ['MANAGER', 'DGM'] },
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
            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/60 font-bold">
              SECURITY v3.2
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Role Indicator & Switcher */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
            <span>Operating As:</span>
            <span className="text-sky-400">{currentRole}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
            <div className="truncate">
              <div className="font-bold text-white text-xs truncate flex items-center gap-1">
                {currentRole === 'DGM' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                <span>{currentUser?.name || 'Security Officer'}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser?.title || currentRole}</div>
            </div>
            <button
              onClick={logoutUser}
              title="Logout / Switch User"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar Header */}
        <header className="h-16 px-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={prevDay}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-white">
                {formatDisplayDate(currentDate)}
              </span>
              <button
                onClick={nextDay}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-bold text-sky-400 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/80 rounded-md transition"
            >
              Today
            </button>
          </div>

          {/* Right Controls: Role Switch Dropdown & Notifications */}
          <div className="flex items-center gap-3 text-xs">
            {/* OT Pending Alert for AGM / DGM */}
            {(currentRole === 'DGM' || currentRole === 'AGM') && pendingOTCount > 0 && (
              <button
                onClick={() => setActiveNav('dashboard')}
                className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-300 font-bold flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingOTCount} Pending OT Approvals</span>
              </button>
            )}

            {/* Quick Role Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
              <span className="text-[10px] text-slate-500 font-semibold">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => loginUser(e.target.value as RoleType)}
                className="bg-transparent text-xs font-bold text-sky-400 outline-none cursor-pointer"
              >
                <option value="DGM">👑 DGM (Top Executive)</option>
                <option value="AGM">🛡️ AGM (Executive)</option>
                <option value="MANAGER">📋 Operations Manager</option>
                <option value="SUPERVISOR">👮 Field Supervisor</option>
                <option value="SECURITY_GUARD">👤 Guard Portal</option>
              </select>
            </div>

            <button
              onClick={logoutUser}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 bg-slate-950">{children}</main>
      </div>
    </div>
  );
};
