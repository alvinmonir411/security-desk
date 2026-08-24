'use client';

import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { Shield, CheckCircle2, XCircle, Users, Activity, Printer, Layers, Clock } from 'lucide-react';

export const AGMDashboard: React.FC = () => {
  const {
    guards,
    locations,
    assignments,
    overtimeRequests,
    approveOvertime,
    rejectOvertime,
    setActiveNav,
  } = useRoster();

  const pendingOTs = overtimeRequests.filter((r) => r.status === 'PENDING');
  const allPostsCount = locations.reduce((sum, l) => sum + l.posts.length, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* AGM Banner */}
      <div className="bg-gradient-to-r from-sky-950/50 via-slate-900 to-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/50 text-[11px] font-black uppercase tracking-wider">
                  AGM Operations Command
                </span>
                <span className="text-xs text-slate-400">• Field Operations Oversight</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-wide mt-1">
                AGM OPERATIONAL DASHBOARD
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Regional Security Management • Overtime Approvals • Site Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveNav('reports')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg"
            >
              <Printer className="w-4 h-4" /> [ 🖨️ Sign-off Muster Roll ]
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-sky-500/20 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">Total Guards:</div>
            <div className="text-xl font-black text-white mt-0.5">{guards.length} Personnel</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">Active Posts:</div>
            <div className="text-xl font-black text-sky-400 mt-0.5">{allPostsCount} Posts</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">On Duty Today:</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{assignments.length} Assigned</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
            <div className="text-slate-400 font-semibold">OT Requests:</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{pendingOTs.length} Pending</div>
          </div>
        </div>
      </div>

      {/* Overtime Approvals Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <span>⚡ Overtime Deployment Approval Queue</span>
            {pendingOTs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {pendingOTs.length} Pending
              </span>
            )}
          </h2>
          <span className="text-xs text-slate-400">AGM Authorized Authorization</span>
        </div>

        {pendingOTs.length === 0 ? (
          <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            No pending overtime authorizations. All off-day deployments are clear.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOTs.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 border border-sky-500/40 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.guardName}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                      ⚡ OT ({req.hours}h) • {req.shift} Shift
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Reason: {req.reason}</div>
                  <div className="text-[10px] text-slate-500">Requested by: {req.requestedBy}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rejectOvertime(req.id)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-rose-400 font-bold text-xs rounded-xl"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveOvertime(req.id)}
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow"
                  >
                    [ ✅ Approve OT ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access to Master Roster & Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveNav('dashboard')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl cursor-pointer transition space-y-2 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <h3>Master Deployment Board</h3>
          </div>
          <p className="text-xs text-slate-400">
            View full 74 posts and 168 assigned personnel across all 5 industrial locations.
          </p>
        </div>

        <div
          onClick={() => setActiveNav('matrix')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl cursor-pointer transition space-y-2 shadow-lg"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Activity className="w-5 h-5" />
            <h3>7-Day Duty Matrix & Guards Directory</h3>
          </div>
          <p className="text-xs text-slate-400">
            Inspect the 6-day Day ➔ Off-Day ➔ 6-day Night consecutive cycle compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
