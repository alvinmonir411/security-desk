'use client';

import React from 'react';
import { RosterProvider, useRoster } from '../context/RosterContext';
import { AppLayout } from '../components/layout/AppLayout';
import { MasterRosterBoard } from '../components/roster/MasterRosterBoard';
import { DashboardPage } from '../components/pages/DashboardPage';
import { DeploymentBoardPage } from '../components/pages/DeploymentBoardPage';
import { GuardMatrixPage } from '../components/pages/GuardMatrixPage';
import { GuardsDirectoryPage } from '../components/pages/GuardsDirectoryPage';
import { GenerateWizardPage } from '../components/pages/GenerateWizardPage';
import { RosterHealthPage } from '../components/pages/RosterHealthPage';
import { LeaveAttendancePage } from '../components/pages/LeaveAttendancePage';
import { ReportsPage } from '../components/pages/ReportsPage';
import { SettingsPage } from '../components/pages/SettingsPage';

function RouterView() {
  const { activeNav } = useRoster();

  switch (activeNav) {
    case 'dashboard':
      return <MasterRosterBoard />;
    case 'deployment':
      return <MasterRosterBoard />;
    case 'matrix':
      return <GuardMatrixPage />;
    case 'guards':
      return <GuardsDirectoryPage />;
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
      return <DashboardPage />;
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
