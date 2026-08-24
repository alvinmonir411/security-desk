'use client';

import React, { useState, useMemo } from 'react';
import { useRoster, OvertimeReq } from '../../context/RosterContext';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Users,
  Activity,
  Printer,
  Layers,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AGMDashboard: React.FC = () => {
  const {
    guards,
    locations,
    assignments,
    overtimeRequests,
    approveOvertime,
    rejectOvertime,
    showToast,
    setActiveNav,
  } = useRoster();

  const [otViewTab, setOtViewTab] = useState<'PENDING' | 'GUARD_SUMMARY' | 'ALL_RECORDS'>('PENDING');
  const [otSearchQuery, setOtSearchQuery] = useState('');
  const [expandedGuardId, setExpandedGuardId] = useState<string | null>(null);

  const pendingOTs = overtimeRequests.filter((r) => r.status === 'PENDING');
  const approvedOTs = overtimeRequests.filter((r) => r.status === 'APPROVED');
  const allPostsCount = locations.reduce((sum, l) => sum + l.posts.length, 0);

  // Calculate Guard-Wise Overtime Hours Breakdown
  const guardOtSummary = useMemo(() => {
    const summaryMap: {
      [guardId: string]: {
        guardId: string;
        guardName: string;
        badgeNumber?: string;
        phone?: string;
        totalHours: number;
        approvedHours: number;
        pendingHours: number;
        approvedCount: number;
        pendingCount: number;
        dayShiftCount: number;
        nightShiftCount: number;
        locationNames: Set<string>;
        postNames: Set<string>;
        records: OvertimeReq[];
      };
    } = {};

    overtimeRequests.forEach((req) => {
      if (!summaryMap[req.guardId]) {
        const g = guards.find((guard) => guard.id === req.guardId);
        summaryMap[req.guardId] = {
          guardId: req.guardId,
          guardName: req.guardName || g?.name || 'Security Guard',
          badgeNumber: g?.badgeNumber,
          phone: g?.phone,
          totalHours: 0,
          approvedHours: 0,
          pendingHours: 0,
          approvedCount: 0,
          pendingCount: 0,
          dayShiftCount: 0,
          nightShiftCount: 0,
          locationNames: new Set(),
          postNames: new Set(),
          records: [],
        };
      }

      const item = summaryMap[req.guardId];
      const hrs = Number(req.hours) || 12;
      item.totalHours += hrs;

      if (req.status === 'APPROVED') {
        item.approvedHours += hrs;
        item.approvedCount += 1;
        if (req.shift === 'DAY') item.dayShiftCount += 1;
        else item.nightShiftCount += 1;
      } else if (req.status === 'PENDING') {
        item.pendingHours += hrs;
        item.pendingCount += 1;
      }

      if (req.locationName) item.locationNames.add(req.locationName);
      if (req.postName) item.postNames.add(req.postName);
      item.records.push(req);
    });

    return Object.values(summaryMap).sort(
      (a, b) => b.approvedHours - a.approvedHours || b.totalHours - a.totalHours
    );
  }, [overtimeRequests, guards]);

  const totalApprovedHours = useMemo(() => {
    return approvedOTs.reduce((sum, r) => sum + (Number(r.hours) || 12), 0);
  }, [approvedOTs]);

  const filteredGuardSummary = useMemo(() => {
    if (!otSearchQuery.trim()) return guardOtSummary;
    const q = otSearchQuery.toLowerCase();
    return guardOtSummary.filter(
      (g) =>
        g.guardName.toLowerCase().includes(q) ||
        g.badgeNumber?.toLowerCase().includes(q) ||
        Array.from(g.locationNames).some((l) => l.toLowerCase().includes(q)) ||
        Array.from(g.postNames).some((p) => p.toLowerCase().includes(q))
    );
  }, [guardOtSummary, otSearchQuery]);

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
            <div className="text-slate-400 font-semibold">Approved OT Hours:</div>
            <div className="text-xl font-black text-orange-400 mt-0.5">{totalApprovedHours} Hours</div>
            <div className="text-[10px] text-amber-300 mt-1">
              {pendingOTs.length > 0 ? `${pendingOTs.length} Pending Approval` : 'All Cleared'}
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Approvals & Hours Breakdown Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Overtime Deployment Approval & Hours Ledger</span>
                {pendingOTs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    {pendingOTs.length} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Track how many OT hours each guard performed and approve extra-shift deployments.
              </p>
            </div>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setOtViewTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                otViewTab === 'PENDING'
                  ? 'bg-sky-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡ Approval Queue</span>
              {pendingOTs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[9px] font-black">
                  {pendingOTs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setOtViewTab('GUARD_SUMMARY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                otViewTab === 'GUARD_SUMMARY'
                  ? 'bg-orange-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📊 Guard OT Hours ({guardOtSummary.length})</span>
            </button>

            <button
              onClick={() => setOtViewTab('ALL_RECORDS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                otViewTab === 'ALL_RECORDS'
                  ? 'bg-slate-800 text-white font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📜 All Records ({overtimeRequests.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PENDING APPROVAL QUEUE */}
        {otViewTab === 'PENDING' && (
          <div className="space-y-3">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{req.guardName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          ⚡ OT ({req.hours || 12}h) • {req.shift} Shift
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        📍 Post: <strong className="text-slate-200">{req.postName || 'Assigned'}</strong> • Base:{' '}
                        <strong className="text-slate-200">{req.locationName || 'Central'}</strong>
                      </div>
                      <div className="text-xs text-slate-400">Reason: {req.reason || 'Staff shortage'}</div>
                      <div className="text-[10px] text-slate-500">Requested by: {req.requestedBy} • Date: {req.date}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await rejectOvertime(req.id);
                          showToast('Overtime request rejected.');
                        }}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-rose-400 font-bold text-xs rounded-xl"
                      >
                        Reject
                      </button>
                      <button
                        onClick={async () => {
                          await approveOvertime(req.id);
                          showToast(`✅ Overtime approved & guard deployed!`);
                        }}
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
        )}

        {/* TAB 2: GUARD-WISE OVERTIME HOURS BREAKDOWN */}
        {otViewTab === 'GUARD_SUMMARY' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Total Authorized OT: </span>
                  <span className="font-black text-orange-400 text-sm">{totalApprovedHours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Guards with OT: </span>
                  <span className="font-black text-emerald-400 text-sm">
                    {guardOtSummary.filter((g) => g.approvedHours > 0).length} Guards
                  </span>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={otSearchQuery}
                  onChange={(e) => setOtSearchQuery(e.target.value)}
                  placeholder="🔍 Search guard, badge, or post..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {filteredGuardSummary.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-850 text-slate-400 text-xs">
                No overtime records found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredGuardSummary.map((item) => {
                  const isExpanded = expandedGuardId === item.guardId;

                  return (
                    <div
                      key={item.guardId}
                      className="bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-xl p-4 transition shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-sm">{item.guardName}</span>
                            {item.badgeNumber && (
                              <span className="font-mono text-sky-400 text-[11px] font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {item.badgeNumber}
                              </span>
                            )}
                            {item.approvedHours > 0 && (
                              <span className="px-2.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 text-[10px] font-black">
                                ⚡ {item.approvedHours} Hours Approved OT
                              </span>
                            )}
                            {item.pendingHours > 0 && (
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                                🕒 {item.pendingHours}h Pending
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                            <span>
                              Shifts: ☀️ {item.dayShiftCount} Day / 🌙 {item.nightShiftCount} Night
                            </span>
                            <span>•</span>
                            <span>
                              Base: <strong className="text-slate-300">{Array.from(item.locationNames).join(', ') || 'Central'}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Posts: <strong className="text-slate-300">{Array.from(item.postNames).join(', ') || 'Various'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Total Hours Badge & Expand */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Total OT Credited</div>
                            <div className="text-base font-black text-emerald-400">
                              {item.approvedHours} hrs
                            </div>
                          </div>

                          <button
                            onClick={() => setExpandedGuardId(isExpanded ? null : item.guardId)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 font-bold"
                          >
                            <span>{isExpanded ? 'Hide' : 'Breakdown'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Session Logs */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-900 space-y-2">
                          <div className="text-[11px] font-bold text-slate-400">
                            Individual Overtime Sessions for {item.guardName}:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {item.records.map((r, idx) => (
                              <div
                                key={r.id || idx}
                                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">
                                    {r.shift === 'DAY' ? '☀️ Day Shift' : '🌙 Night Shift'} ({r.hours || 12}h OT)
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      r.status === 'APPROVED'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : r.status === 'PENDING'
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  📍 Post: <span className="text-slate-200">{r.postName || 'Assigned'}</span> • Date: {r.date}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Reason: {r.reason || 'Off-day duty coverage'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL OVERTIME RECORDS */}
        {otViewTab === 'ALL_RECORDS' && (
          <div className="space-y-3">
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
              {overtimeRequests.length === 0 ? (
                <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-850 text-slate-400 text-xs">
                  No overtime requests in system.
                </div>
              ) : (
                overtimeRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{req.guardName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : req.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                          }`}
                        >
                          {req.status} ({req.hours || 12}h OT)
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {req.shift === 'DAY' ? '☀️ DAY' : '🌙 NIGHT'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        📍 Post: {req.postName || 'Assigned'} • Location: {req.locationName || 'Central'} • Date: {req.date}
                      </div>
                      <div className="text-[10px] text-slate-500">Reason: {req.reason} • Requested by: {req.requestedBy}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access to Master Roster & Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveNav('deployment')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl cursor-pointer transition space-y-2 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <h3>Roster Maker & Board</h3>
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
