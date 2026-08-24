'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Crown,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Flame,
  Printer,
  Sparkles,
  Lock,
  Activity,
  History,
  Check,
} from 'lucide-react';

export const DGMDashboard: React.FC = () => {
  const {
    guards,
    locations,
    assignments,
    overtimeRequests,
    approveOvertime,
    rejectOvertime,
    showToast,
    refreshData,
    setActiveNav,
  } = useRoster();

  const [isEmergencyLockdown, setIsEmergencyLockdown] = useState(false);
  const pendingOTs = overtimeRequests.filter((r) => r.status === 'PENDING');
  const approvedOTs = overtimeRequests.filter((r) => r.status === 'APPROVED');

  const allPostsCount = locations.reduce((sum, l) => sum + l.posts.length, 0);
  const totalAssigned = assignments.length;
  const offDutyCount = Math.max(0, guards.length - totalAssigned);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. DGM Executive Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-xl">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/50 text-[11px] font-black uppercase tracking-wider">
                  Top Executive Authority
                </span>
                <span className="text-xs text-slate-400 font-mono">• Chief Security Officer</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-wide mt-1">
                DGM COMMAND & CONTROL CENTER
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive Oversight • Overtime Approvals • Global Workforce Audit
              </p>
            </div>
          </div>

          {/* DGM Special Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setIsEmergencyLockdown(!isEmergencyLockdown);
                showToast(
                  !isEmergencyLockdown
                    ? '🚨 DGM SPECIAL POWER: High-Alert Emergency Protocol Activated!'
                    : 'Standard Security Protocol Restored.'
                );
              }}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition shadow-lg cursor-pointer ${
                isEmergencyLockdown
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300'
              }`}
            >
              <Flame className="w-4 h-4" />
              {isEmergencyLockdown ? '🚨 EMERGENCY LOCKDOWN ACTIVE' : '⚡ [ DGM High-Alert Mode ]'}
            </button>

            <button
              onClick={() => setActiveNav('reports')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg"
            >
              <Printer className="w-4 h-4" /> [ 🖨️ Muster Roll Sign-off ]
            </button>
          </div>
        </div>

        {/* Global Executive Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-500/20 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">Total Force Strength:</div>
            <div className="text-xl font-black text-white mt-0.5">{guards.length} Guards</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">100% Verified Profile</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">Deployed On-Duty:</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{totalAssigned} Personnel</div>
            <div className="text-[10px] text-slate-400 mt-1">Across {allPostsCount} Posts</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">Weekly Rest / Leave:</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{offDutyCount} Guards</div>
            <div className="text-[10px] text-amber-300 mt-1">6/1 Rotation Cycle</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">Pending OT Approvals:</div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{pendingOTs.length} Requests</div>
            <div className="text-[10px] text-rose-300 mt-1">Requires DGM/AGM Action</div>
          </div>
        </div>
      </div>

      {/* 2. Executive Overtime Approval Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Executive Overtime (OT) Approval Queue</span>
                {pendingOTs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-slate-950 font-black text-[10px]">
                    {pendingOTs.length} Action Needed
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Off-day emergency guard assignments submitted by Field Managers & Supervisors
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono">Policy: DGM/AGM Sole Authorization</span>
        </div>

        {pendingOTs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-white text-sm">All Overtime Requests Cleared!</div>
            <p>No pending off-day overtime deployments awaiting executive authorization.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOTs.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 border border-amber-500/40 hover:border-amber-500 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 transition shadow-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-sm">{req.guardName}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                      🏖️ Off-Day OT ({req.hours}h)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      Shift: {req.shift}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Reason: <strong className="text-slate-200">{req.reason || 'Staffing shortage'}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Requested by: {req.requestedBy} • Date: {req.date}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rejectOvertime(req.id)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => approveOvertime(req.id)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" /> [ ✅ Authorize & Deploy OT ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. DGM Special Executive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <h3>Master Policy & Overrides</h3>
          </div>
          <p className="text-xs text-slate-400">
            DGM holds supreme authority to override standard 6/1 cycles during factory audits and emergency drills.
          </p>
          <button
            onClick={() => showToast('DGM Override Logged in Audit Trail.')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700"
          >
            Manage Global Constraints
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Activity className="w-4 h-4" />
            <h3>Live Deployment Audit</h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time compliance checks across all 5 locations. Verify zero-standby policy and 100% post fulfillment.
          </p>
          <button
            onClick={() => setActiveNav('health')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700"
          >
            Inspect Roster Health
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <History className="w-4 h-4" />
            <h3>Approved Overtime History</h3>
          </div>
          <p className="text-xs text-slate-400">
            {approvedOTs.length} overtime deployments authorized this cycle. Hours credited to monthly payroll muster.
          </p>
          <button
            onClick={() => setActiveNav('reports')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-slate-700"
          >
            Export Payroll OT Report
          </button>
        </div>
      </div>
    </div>
  );
};
