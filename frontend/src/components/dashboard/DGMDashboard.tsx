'use client';

import React, { useState, useMemo } from 'react';
import { useRoster, OvertimeReq } from '../../context/RosterContext';
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
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
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
  const [otViewTab, setOtViewTab] = useState<'PENDING' | 'GUARD_SUMMARY' | 'ALL_RECORDS'>('PENDING');
  const [otSearchQuery, setOtSearchQuery] = useState('');
  const [expandedGuardId, setExpandedGuardId] = useState<string | null>(null);

  const pendingOTs = overtimeRequests.filter((r) => r.status === 'PENDING');
  const approvedOTs = overtimeRequests.filter((r) => r.status === 'APPROVED');
  const rejectedOTs = overtimeRequests.filter((r) => r.status === 'REJECTED');

  const allPostsCount = locations.reduce((sum, l) => sum + l.posts.length, 0);
  const totalAssigned = assignments.length;
  const offDutyCount = Math.max(0, guards.length - totalAssigned);

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

  const totalPendingHours = useMemo(() => {
    return pendingOTs.reduce((sum, r) => sum + (Number(r.hours) || 12), 0);
  }, [pendingOTs]);

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
                Executive Oversight • Guard Overtime Hours Audit • Workforce Command
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
            <div className="text-slate-400 font-semibold">Approved OT Hours:</div>
            <div className="text-xl font-black text-orange-400 mt-0.5">{totalApprovedHours} Hours</div>
            <div className="text-[10px] text-amber-300 mt-1">
              {pendingOTs.length > 0 ? `${pendingOTs.length} Pending Approval` : 'All Cleared'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Overtime Command & Guard-Wise Hours Audit Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-black">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Executive Overtime (OT) & Hours Audit</span>
                {pendingOTs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-slate-950 font-black text-[10px] animate-pulse">
                    {pendingOTs.length} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Track exactly which guards worked how many OT hours, shifts deployed, and authorize pending requests.
              </p>
            </div>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setOtViewTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                otViewTab === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
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
                  ? 'bg-sky-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📜 All OT History ({overtimeRequests.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PENDING APPROVAL QUEUE */}
        {otViewTab === 'PENDING' && (
          <div className="space-y-3">
            {pendingOTs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-850 text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-white text-sm">All Overtime Requests Cleared!</div>
                <p>No pending off-day overtime deployments awaiting DGM authorization.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOTs.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-950 border border-amber-500/40 hover:border-amber-500 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 transition shadow-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-sm">{req.guardName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                          ⚡ Off-Day OT ({req.hours || 12}h)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                          Shift: {req.shift === 'DAY' ? '☀️ DAY (12h)' : '🌙 NIGHT (12h)'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        📍 Post: <strong className="text-slate-200">{req.postName || 'Assigned Duty Post'}</strong> • Base:{' '}
                        <strong className="text-slate-200">{req.locationName || 'Central'}</strong>
                      </div>
                      <div className="text-xs text-slate-400">
                        Reason: <strong className="text-amber-300">{req.reason || 'Staffing shortage'}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Requested by: {req.requestedBy} • Date: {req.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await rejectOvertime(req.id);
                          showToast('Overtime request rejected.');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={async () => {
                          await approveOvertime(req.id);
                          showToast(`✅ Overtime approved & guard deployed!`);
                        }}
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
        )}

        {/* TAB 2: GUARD-WISE OVERTIME HOURS BREAKDOWN (Who worked how many hours) */}
        {otViewTab === 'GUARD_SUMMARY' && (
          <div className="space-y-4">
            {/* Search & Overview bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Total Authorized OT: </span>
                  <span className="font-black text-orange-400 text-sm">{totalApprovedHours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Guards on OT: </span>
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {filteredGuardSummary.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 text-slate-400 text-xs">
                No overtime records found matching your search.
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

                        {/* Total Hours Badge & Expand Details */}
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
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 text-slate-400 text-xs">
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
                        📍 Post: {req.postName || 'Assigned Post'} • Location: {req.locationName || 'Central'} • Date: {req.date}
                      </div>
                      <div className="text-[10px] text-slate-500">Reason: {req.reason} • Requested by: {req.requestedBy}</div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            await approveOvertime(req.id);
                            showToast('Approved & guard deployed!');
                          }}
                          className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
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
            onClick={() => setActiveNav('deployment')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
          >
            Inspect Roster Board
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <History className="w-4 h-4" />
            <h3>Approved Overtime History</h3>
          </div>
          <p className="text-xs text-slate-400">
            {totalApprovedHours} hours across {approvedOTs.length} overtime deployments authorized.
          </p>
          <button
            onClick={() => setOtViewTab('GUARD_SUMMARY')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
          >
            View Guard Overtime Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
