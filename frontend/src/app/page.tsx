'use client';

import React from 'react';
import { RosterProvider, useRoster } from '../context/RosterContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../components/auth/LoginPage';
import { MasterRosterBoard } from '../components/roster/MasterRosterBoard';
import { DGMDashboard } from '../components/dashboard/DGMDashboard';
import { AGMDashboard } from '../components/dashboard/AGMDashboard';
import { GuardMatrixAndDirectoryPage } from '../components/pages/GuardMatrixAndDirectoryPage';
import { GenerateWizardPage } from '../components/pages/GenerateWizardPage';
import { RosterHealthPage } from '../components/pages/RosterHealthPage';
import { LeaveAttendancePage } from '../components/pages/LeaveAttendancePage';
import { ReportsPage } from '../components/pages/ReportsPage';
import { SettingsPage } from '../components/pages/SettingsPage';
import { GuardMobilePortal } from '../components/guard/GuardMobilePortal';

function RouterView() {
  const { activeNav, currentRole, currentUser } = useRoster();

  // If user logged out, show Login Screen
  if (!currentUser) {
    return <LoginPage />;
  }

  // Role-specific Landing Dashboards
  if (activeNav === 'dashboard') {
    if (currentRole === 'DGM') return <DGMDashboard />;
    if (currentRole === 'AGM') return <AGMDashboard />;
    if (currentRole === 'SECURITY_GUARD') return <GuardMobilePortal />;
    return <MasterRosterBoard />;
  }

  switch (activeNav) {
    case 'deployment':
      return <MasterRosterBoard />;
    case 'matrix':
    case 'guards':
      return <GuardMatrixAndDirectoryPage />;
    case 'generate':
      return <GenerateWizardPage />;
    case 'health':
      return <RosterHealthPage />;
    case 'leave':
      return <LeaveAttendancePage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <MasterRosterBoard />;
  }
}

export default function SecurityRosterApp() {
  return (
    <RosterProvider>
      <AppLayout>
        <RouterView />
      </AppLayout>
    </RosterProvider>
  );
}
