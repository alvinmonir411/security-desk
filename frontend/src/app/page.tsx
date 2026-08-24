'use client';

import React from 'react';
import { RosterProvider, useRoster } from '../context/RosterContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../components/auth/LoginPage';
import { MasterRosterBoard } from '../components/roster/MasterRosterBoard';
import { DashboardPage } from '../components/pages/DashboardPage';
import { DGMDashboard } from '../components/dashboard/DGMDashboard';
import { AGMDashboard } from '../components/dashboard/AGMDashboard';
import { GuardMatrixAndDirectoryPage } from '../components/pages/GuardMatrixAndDirectoryPage';
import { LeaveAttendancePage } from '../components/pages/LeaveAttendancePage';
import { ReportsPage } from '../components/pages/ReportsPage';
import { SettingsPage } from '../components/pages/SettingsPage';
import { GuardMobilePortal } from '../components/guard/GuardMobilePortal';
import { MyProfilePage } from '../components/pages/MyProfilePage';
import { ShieldAlert } from 'lucide-react';

const ROLE_ALLOWED_PAGES: Record<string, string[]> = {
  DGM: ['dashboard', 'deployment', 'matrix', 'guards', 'leave', 'reports', 'settings'],
  AGM: ['dashboard', 'deployment', 'matrix', 'guards', 'leave', 'reports'],
  MANAGER: ['dashboard', 'deployment', 'matrix', 'guards', 'leave', 'reports', 'settings'],
  SUPERVISOR: ['dashboard', 'deployment', 'matrix', 'guards', 'leave', 'reports'],
  SECURITY_GUARD: ['dashboard', 'profile', 'leave'],
};

function RouterView() {
  const { activeNav, setActiveNav, currentRole, currentUser } = useRoster();

  // If user logged out, show Login Screen
  if (!currentUser) {
    return <LoginPage />;
  }

  // Strict Role-Based Access Control (RBAC) Enforcement
  const allowed = ROLE_ALLOWED_PAGES[currentRole] || ['dashboard'];
  if (!allowed.includes(activeNav)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your active role (<span className="text-amber-400 font-bold">{currentRole}</span>) does not have authorization to view this operational module.
          </p>
        </div>
        <button
          onClick={() => setActiveNav('dashboard')}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
        >
          Return to My Workspace
        </button>
      </div>
    );
  }

  // Role-specific Landing Dashboards
  if (activeNav === 'dashboard') {
    if (currentRole === 'DGM') return <DGMDashboard />;
    if (currentRole === 'AGM') return <AGMDashboard />;
    if (currentRole === 'SECURITY_GUARD') return <GuardMobilePortal />;
    return <DashboardPage />;
  }

  switch (activeNav) {
    case 'profile':
      return <MyProfilePage />;
    case 'deployment':
      return <MasterRosterBoard />;
    case 'matrix':
    case 'guards':
      return <GuardMatrixAndDirectoryPage />;
    case 'leave':
      return <LeaveAttendancePage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

export default function SecurityRosterApp() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading ShieldOps Workspace...
      </div>
    );
  }

  return (
    <RosterProvider>
      <AuthenticatedApp />
    </RosterProvider>
  );
}

function AuthenticatedApp() {
  const { currentUser } = useRoster();
  if (!currentUser) return <LoginPage />;
  return <AppLayout><RouterView /></AppLayout>;
}
