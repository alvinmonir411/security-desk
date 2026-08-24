'use client';

import React, { useState } from 'react';
import { useRoster, GuardProfile } from '../../context/RosterContext';
import {
  Check,
  XCircle,
  Calendar,
  PlusCircle,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Send,
} from 'lucide-react';
import { DisciplinaryModal } from '../roster/DisciplinaryModal';

export const LeaveAttendancePage: React.FC = () => {
  const {
    leaveRequests,
    guards,
    assignments,
    locations,
    approveLeave,
    rejectLeave,
    applyLeave,
    markGuardAbsent,
    applyDisciplinaryAction,
    currentRole,
    currentUser,
    currentDate,
  } = useRoster();

  const isGuard = currentRole === 'SECURITY_GUARD';

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'APPROVED' | 'REJECTED' | 'ATTENDANCE'>('QUEUE');
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'ABSENT' | 'SUSPENDED' | 'ON_LEAVE' | 'ON_DUTY' | 'OFF_DAY'>('ALL');
  const [disciplinaryGuard, setDisciplinaryGuard] = useState<GuardProfile | null>(null);

  // Attendance metrics calculation
  const assignedGuardIdsSet = new Set(
    assignments
      .filter((a) => a.date === currentDate && a.status === 'confirmed')
      .map((a) => a.guardId)
  );

  const onDutyCount = assignedGuardIdsSet.size;
  const onLeaveCount = guards.filter((g) => g.status === 'ON_LEAVE').length;
  const absentCount = guards.filter((g) => g.status === 'ABSENT').length;
  const suspendedCount = guards.filter((g) => g.status === 'SUSPENDED').length;
  const standbyCount = guards.filter(
    (g) => g.status === 'ACTIVE' && g.dutyStreak >= 6 && !assignedGuardIdsSet.has(g.id)
  ).length;

  // Apply Leave Modal State (for Guards, Supervisors, Managers, AGMs, DGMs)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedGuardId, setSelectedGuardId] = useState<string>('');
  const [selectedGuardFilter, setSelectedGuardFilter] = useState<string>('ALL');
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [startDate, setStartDate] = useState(currentDate || '2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [leaveReasonText, setLeaveReasonText] = useState('Family emergency & personal urgent work');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter requests based on user role
  const relevantRequests = isGuard
    ? leaveRequests.filter((l) => l.guardId === currentUser?.id || l.guardName === currentUser?.name)
    : selectedGuardFilter === 'ALL'
    ? leaveRequests
    : leaveRequests.filter((l) => l.guardId === selectedGuardFilter);

  // Filter for tabs
  const getFilteredList = () => {
    if (activeTab === 'QUEUE') {
      if (isGuard) {
        return relevantRequests.filter((l) => l.status !== 'APPROVED' && l.status !== 'REJECTED');
      }
      if (currentRole === 'SUPERVISOR') {
        return relevantRequests.filter((l) => l.status === 'PENDING_SUPERVISOR');
      }
      if (currentRole === 'MANAGER') {
        return relevantRequests.filter((l) => l.status === 'PENDING_MANAGER');
      }
      if (currentRole === 'AGM' || currentRole === 'DGM') {
        return relevantRequests.filter((l) => l.status === 'PENDING_EXECUTIVE');
      }
      return relevantRequests.filter((l) => l.status !== 'APPROVED' && l.status !== 'REJECTED');
    }
    if (activeTab === 'APPROVED') {
      return relevantRequests.filter((l) => l.status === 'APPROVED');
    }
    if (activeTab === 'REJECTED') {
      return relevantRequests.filter((l) => l.status === 'REJECTED');
    }
    return relevantRequests;
  };

  const currentDisplayList = getFilteredList();

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetGuard = isGuard
      ? (guards.find((g) => g.id === currentUser?.id || g.name === currentUser?.name) || guards[0])
      : guards.find((g) => g.id === selectedGuardId) || guards[0];

    if (!targetGuard) {
      alert('Please select a guard profile.');
      return;
    }

    setIsSubmitting(true);
    await applyLeave({
      guardId: targetGuard.id,
      guardName: targetGuard.name,
      startDate,
      endDate,
      type: leaveType,
      reason: leaveReasonText,
    });
    setIsSubmitting(false);
    setIsApplyModalOpen(false);
  };

  const getActionLabel = () => {
    if (currentRole === 'SUPERVISOR') return 'Recommend & Forward to Manager';
    if (currentRole === 'MANAGER') return 'Endorse & Forward to AGM/DGM';
    if (currentRole === 'AGM' || currentRole === 'DGM') return 'Final Authorize & Grant Leave';
    return 'Approve';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2.5">
            <span>LEAVE & ATTENDANCE MANAGEMENT</span>
            {isGuard ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-950 text-sky-400 border border-sky-800">
                My Portal
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-950 text-amber-400 border border-amber-800">
                Operating As: {currentRole}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isGuard
              ? 'Track your personal leave applications and view company leave balances.'
              : 'Monitor live workforce attendance, mark absent personnel, and process multi-tier leave approval queue.'}
          </p>
        </div>

        {/* Apply Leave Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> + Apply for Leave
          </button>
        </div>
      </div>

      {/* 📊 Live Workforce Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">👥 Total Force</div>
          <div className="text-xl font-black text-white">{guards.length}</div>
          <div className="text-[10px] text-slate-500">Active personnel</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">⚡ On Duty</div>
          <div className="text-xl font-black text-emerald-400">{onDutyCount}</div>
          <div className="text-[10px] text-emerald-500/80">Assigned on post</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">🏖️ On Leave</div>
          <div className="text-xl font-black text-amber-400">{onLeaveCount}</div>
          <div className="text-[10px] text-amber-500/80">Approved leave</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow">
          <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">🚫 Absent</div>
          <div className="text-xl font-black text-rose-400">{absentCount}</div>
          <div className="text-[10px] text-rose-500/80">Unexcused / Missing</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow">
          <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">⚠️ Suspended</div>
          <div className="text-xl font-black text-amber-500">{suspendedCount}</div>
          <div className="text-[10px] text-amber-500/80">Disciplinary notice</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1 shadow">
          <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">🟢 Standby Pool</div>
          <div className="text-xl font-black text-sky-400">{standbyCount}</div>
          <div className="text-[10px] text-sky-500/80">Off-Day for OT</div>
        </div>
      </div>

      {/* 4-Step Approval Sequence Visual Legend (shown when viewing leave queue) */}
      {activeTab !== 'ATTENDANCE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Sequential 4-Tier Approval Flow:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] flex items-center justify-center">1</span>
              <div>
                <div className="font-bold text-slate-200 text-[11px]">Guard Applied</div>
                <div className="text-[10px] text-slate-500">Initial submission</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">2</span>
              <div>
                <div className="font-bold text-amber-300 text-[11px]">Supervisor Review</div>
                <div className="text-[10px] text-slate-500">Field recommendation</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px] flex items-center justify-center">3</span>
              <div>
                <div className="font-bold text-purple-300 text-[11px]">Manager Endorsement</div>
                <div className="text-[10px] text-slate-500">Operations review</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">4</span>
              <div>
                <div className="font-bold text-emerald-300 text-[11px]">AGM / DGM Final</div>
                <div className="text-[10px] text-slate-500">Final authorization</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold flex-1 flex-wrap">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition ${
              activeTab === 'QUEUE'
                ? 'bg-sky-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isGuard
              ? `My Requests (${relevantRequests.filter((l) => l.status !== 'APPROVED' && l.status !== 'REJECTED').length})`
              : `Leave Queue (${getFilteredList().length})`}
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved Leaves ({relevantRequests.filter((l) => l.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition ${
              activeTab === 'REJECTED'
                ? 'bg-rose-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rejected ({relevantRequests.filter((l) => l.status === 'REJECTED').length})
          </button>
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`flex-1 min-w-[180px] py-2 px-3 rounded-xl transition ${
              activeTab === 'ATTENDANCE'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚫 Attendance Register ({absentCount} Absent)
          </button>
        </div>

        {!isGuard && activeTab !== 'ATTENDANCE' && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl text-xs">
            <User className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="text-slate-400 font-bold whitespace-nowrap text-[11px]">Guard:</span>
            <select
              value={selectedGuardFilter}
              onChange={(e) => setSelectedGuardFilter(e.target.value)}
              className="bg-slate-950 border border-slate-750 text-white rounded-lg px-2.5 py-1 text-xs font-semibold outline-none focus:border-sky-500 max-w-[180px]"
            >
              <option value="ALL">All Guards ({guards.length})</option>
              {guards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.badgeNumber} - {g.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content Area: Attendance Register OR Leave Requests List */}
      {activeTab === 'ATTENDANCE' ? (
        <div className="space-y-4">
          {/* Search & Filter Bar for Attendance Register */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="🔍 Search personnel by name, badge ID, phone..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {(['ALL', 'ABSENT', 'SUSPENDED', 'ON_DUTY', 'ON_LEAVE', 'OFF_DAY'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setAttendanceFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                    attendanceFilter === filterKey
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {filterKey === 'ALL' && `All Personnel (${guards.length})`}
                  {filterKey === 'ABSENT' && `🚫 Absent (${absentCount})`}
                  {filterKey === 'SUSPENDED' && `⚠️ Suspended (${suspendedCount})`}
                  {filterKey === 'ON_DUTY' && `⚡ On Duty (${onDutyCount})`}
                  {filterKey === 'ON_LEAVE' && `🏖️ On Leave (${onLeaveCount})`}
                  {filterKey === 'OFF_DAY' && `⚪ Off-Day (${standbyCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Personnel Attendance Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(() => {
              const filteredAttendanceList = guards.filter((g) => {
                // Search filter
                if (attendanceSearch.trim()) {
                  const q = attendanceSearch.toLowerCase();
                  const match =
                    g.name.toLowerCase().includes(q) ||
                    g.badgeNumber.toLowerCase().includes(q) ||
                    g.phone?.toLowerCase().includes(q);
                  if (!match) return false;
                }

                // Category filter
                const isAssigned = assignedGuardIdsSet.has(g.id);
                if (attendanceFilter === 'ABSENT') return g.status === 'ABSENT';
                if (attendanceFilter === 'SUSPENDED') return g.status === 'SUSPENDED';
                if (attendanceFilter === 'ON_LEAVE') return g.status === 'ON_LEAVE';
                if (attendanceFilter === 'ON_DUTY') return isAssigned;
                if (attendanceFilter === 'OFF_DAY') return !isAssigned && g.status === 'ACTIVE';

                return true;
              });

              if (filteredAttendanceList.length === 0) {
                return (
                  <div className="col-span-full p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
                    <p className="text-sm font-bold text-slate-300">No personnel found for the selected criteria</p>
                    <p className="text-xs text-slate-500">Try changing your search keywords or filter tab.</p>
                  </div>
                );
              }

              return filteredAttendanceList.map((guard) => {
                const isAssigned = assignedGuardIdsSet.has(guard.id);
                const isAbsent = guard.status === 'ABSENT';
                const isSuspended = guard.status === 'SUSPENDED';
                const isOnLeave = guard.status === 'ON_LEAVE';
                const todayAsg = assignments.find(
                  (a) => a.guardId === guard.id && a.date === currentDate && a.status === 'confirmed'
                );
                const loc = locations.find((l) => l.id === guard.defaultLocationId);
                const post = loc?.posts.find((p) => p.id === todayAsg?.postId || p.id === guard.fixedPostId);

                return (
                  <div
                    key={guard.id}
                    className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition shadow-lg ${
                      isAbsent
                        ? 'border-rose-700/80 bg-rose-950/20'
                        : isSuspended
                        ? 'border-amber-700/80 bg-amber-950/20'
                        : isOnLeave
                        ? 'border-amber-700/70 bg-amber-950/20'
                        : isAssigned
                        ? 'border-emerald-800/80 bg-slate-900'
                        : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-xs">{guard.name}</span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-sky-400 font-bold">{guard.badgeNumber}</span>
                          <span>•</span>
                          <span>{guard.phone || 'No phone'}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isAbsent ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-black">
                          🚫 ABSENT
                        </span>
                      ) : isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-black flex items-center gap-1">
                          ⚠️ SUSPENDED
                        </span>
                      ) : isOnLeave ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-black">
                          🏖️ ON LEAVE
                        </span>
                      ) : isAssigned ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-black flex items-center gap-1">
                          🟢 ON DUTY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold">
                          ⚪ OFF-DAY
                        </span>
                      )}
                    </div>

                    {/* Disciplinary Record Banner if exists */}
                    {(isSuspended || isAbsent || guard.disciplinaryNote) && (
                      <div
                        onClick={() => setDisciplinaryGuard(guard)}
                        className={`p-2 rounded-xl text-[10px] border flex items-center justify-between gap-2 cursor-pointer transition ${
                          isSuspended
                            ? 'bg-amber-950/40 border-amber-850 text-amber-300 hover:bg-amber-900/30'
                            : 'bg-rose-950/40 border-rose-850 text-rose-300 hover:bg-rose-900/30'
                        }`}
                      >
                        <span className="truncate">
                          ⚖️ {guard.disciplinaryNote || (isSuspended ? `Suspended until ${guard.suspensionEndDate || 'notice'}` : 'Marked Absent')}
                        </span>
                        <span className="underline font-bold shrink-0">Details</span>
                      </div>
                    )}

                    {/* Duty details */}
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Base Location:</span>
                        <strong className="text-slate-200">{loc?.name || 'Central Facility'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Today&apos;s Post:</span>
                        {todayAsg ? (
                          <strong className="text-emerald-400 truncate max-w-[140px]">
                            {post?.name || 'Duty Post'} ({todayAsg.shift})
                          </strong>
                        ) : isAbsent ? (
                          <strong className="text-rose-400">Marked Absent</strong>
                        ) : isSuspended ? (
                          <strong className="text-amber-400">Suspended from Post</strong>
                        ) : isOnLeave ? (
                          <strong className="text-amber-400">Scheduled Leave</strong>
                        ) : (
                          <strong className="text-sky-300">Standby / Rest Day</strong>
                        )}
                      </div>
                    </div>

                    {/* Attendance & Disciplinary Actions */}
                    {!isGuard && (
                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        {isAbsent || isSuspended ? (
                          <>
                            <button
                              onClick={() => applyDisciplinaryAction({ guardId: guard.id, actionType: 'ACTIVE', reason: 'Reinstated' })}
                              className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Make Active</span>
                            </button>
                            <button
                              onClick={() => setDisciplinaryGuard(guard)}
                              className="py-1.5 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                              <span>⚖️ Action</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDisciplinaryGuard(guard)}
                            className="w-full py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-700 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <span>⚖️ Discipline / Absent / Suspend</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        /* Leave Requests List */
        <div className="space-y-4">
          {currentDisplayList.map((req) => {
            const isPendingSup = req.status === 'PENDING_SUPERVISOR';
            const isPendingMgr = req.status === 'PENDING_MANAGER';
            const isPendingExec = req.status === 'PENDING_EXECUTIVE';
            const isFinalApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            // Resolve guard from guards array
            const matchedG = guards.find((g) => g.id === req.guardId || g.name === req.guardName);
            const displayName = req.guardName && req.guardName !== 'Guard' ? req.guardName : (matchedG?.name || 'Abdul Mahfuz Islam');
            const displayBadge = req.guardBadge || matchedG?.badgeNumber || 'G-001';
            const displayPhone = matchedG?.phone || '+880 1799-15165';

            // Check if current user can take action
            const canAct =
              (currentRole === 'SUPERVISOR' && isPendingSup) ||
              (currentRole === 'MANAGER' && isPendingMgr) ||
              ((currentRole === 'AGM' || currentRole === 'DGM') && isPendingExec);

            return (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg space-y-4 transition"
              >
                {/* Header: Guard Info + Dates */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{displayName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-400 font-mono text-[10px] border border-sky-800 font-bold">
                          {displayBadge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                          {displayPhone}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {req.startDate} ➔ {req.endDate}
                        </span>
                        <span>• Type: <strong className="text-slate-200">{req.type || req.reason}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isFinalApproved && (
                      <span className="px-3 py-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-black text-xs rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Fully Authorized
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1.5 bg-rose-950/80 text-rose-300 border border-rose-800 font-black text-xs rounded-xl flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> ✗ Rejected
                      </span>
                    )}
                    {!isFinalApproved && !isRejected && (
                      <span className="px-3 py-1.5 bg-amber-950/80 text-amber-300 border border-amber-800 font-black text-xs rounded-xl flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        {isPendingSup && 'Stage 1/3: Awaiting Supervisor'}
                        {isPendingMgr && 'Stage 2/3: Awaiting Manager'}
                        {isPendingExec && 'Stage 3/3: Awaiting AGM/DGM'}
                      </span>
                    )}
                  </div>
                </div>

              {/* Sequential Stepper Progress Bar */}
              <div className="grid grid-cols-4 gap-2 text-xs py-1">
                {/* Step 1: Guard */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">1. Guard Applied</div>
                  <div className="text-[11px] font-black text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Submitted
                  </div>
                </div>

                {/* Step 2: Supervisor */}
                <div
                  className={`p-2.5 rounded-xl border text-center space-y-1 ${
                    isPendingSup
                      ? 'bg-amber-950/40 border-amber-500/60 animate-pulse'
                      : !isPendingSup && !isRejected
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/50 border-slate-850'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">2. Supervisor</div>
                  <div
                    className={`text-[11px] font-black ${
                      isPendingSup
                        ? 'text-amber-400'
                        : !isPendingSup && !isRejected
                        ? 'text-emerald-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {isPendingSup ? '⏳ Pending Review' : !isPendingSup && !isRejected ? '✓ Recommended' : '—'}
                  </div>
                </div>

                {/* Step 3: Manager */}
                <div
                  className={`p-2.5 rounded-xl border text-center space-y-1 ${
                    isPendingMgr
                      ? 'bg-purple-950/40 border-purple-500/60 animate-pulse'
                      : (isPendingExec || isFinalApproved)
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/50 border-slate-850'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">3. Manager</div>
                  <div
                    className={`text-[11px] font-black ${
                      isPendingMgr
                        ? 'text-purple-400'
                        : (isPendingExec || isFinalApproved)
                        ? 'text-emerald-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {isPendingMgr ? '⏳ Pending Endorsement' : (isPendingExec || isFinalApproved) ? '✓ Endorsed' : '—'}
                  </div>
                </div>

                {/* Step 4: Executive */}
                <div
                  className={`p-2.5 rounded-xl border text-center space-y-1 ${
                    isPendingExec
                      ? 'bg-emerald-950/40 border-emerald-500/60 animate-pulse'
                      : isFinalApproved
                      ? 'bg-emerald-950/40 border-emerald-800'
                      : 'bg-slate-950/50 border-slate-850'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">4. AGM / DGM</div>
                  <div
                    className={`text-[11px] font-black ${
                      isPendingExec
                        ? 'text-sky-400'
                        : isFinalApproved
                        ? 'text-emerald-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {isPendingExec ? '⏳ Final Review' : isFinalApproved ? '✓ Authorized' : '—'}
                  </div>
                </div>
              </div>

              {/* Reason & Audit Notes */}
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">
                  <span className="font-bold text-slate-300">Reason Details:</span> {req.reason}
                </div>
                {req.rejectionReason && (
                  <div className="text-rose-400 font-semibold pt-1 border-t border-slate-800">
                    ⚠️ Rejection Note: {req.rejectionReason} (By {req.rejectedBy || 'Authority'})
                  </div>
                )}
              </div>

              {/* Action Buttons (Strictly enabled only for current role in sequence) */}
              {!isGuard && canAct && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setRejectReason('Manpower shortage at assigned post');
                      setRejectingReqId(req.id);
                    }}
                    className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> [ Reject Request ]
                  </button>

                  <button
                    onClick={() => approveLeave(req.id)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> [ {getActionLabel()} ]
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {currentDisplayList.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-white text-sm">No Applications in this Queue</div>
            <p>
              {isGuard
                ? 'You do not have any leave applications under this status tab.'
                : 'All leave requests for your authority stage have been cleared.'}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <h4 className="text-sm font-black text-white">Specify Rejection Reason</h4>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500"
              placeholder="e.g. Manpower shortage during festival week..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectLeave(rejectingReqId, rejectReason);
                  setRejectingReqId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Apply for Leave</h3>
                  <p className="text-[11px] text-slate-400">Sequential Multi-Stage Approval Workflow</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              {/* Target Guard Selection Option */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Applicant Guard: <span className="text-rose-400">*</span>
                </label>
                {isGuard ? (
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-400" />
                      <span>{currentUser?.name || 'Abdul Mahfuz Islam'} (You)</span>
                    </div>
                    <span className="text-xs text-sky-400 font-mono bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60 font-bold">
                      G-001
                    </span>
                  </div>
                ) : (
                  <select
                    value={selectedGuardId || (guards[0]?.id || '')}
                    onChange={(e) => setSelectedGuardId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-orange-500"
                  >
                    {guards.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.badgeNumber} — {g.name} ({g.status})
                      </option>
                    ))}
                  </select>
                )}
                {!isGuard && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Select the guard for whom this leave application is being logged.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Leave Category / Type:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-orange-500"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                  <option value="Medical Leave (ML)">Medical Leave (ML)</option>
                  <option value="Annual Earned Leave (AL)">Annual Earned Leave (AL)</option>
                  <option value="Emergency Family Leave">Emergency Family Leave</option>
                  <option value="Compensatory Rest Off">Compensatory Rest Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Date:</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Date:</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reason & Remarks:</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReasonText}
                  onChange={(e) => setLeaveReasonText(e.target.value)}
                  placeholder="Describe your reason..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disciplinary, Multi-Day Absence & Suspension Modal */}
      <DisciplinaryModal
        isOpen={!!disciplinaryGuard}
        guard={disciplinaryGuard}
        currentRole={currentRole}
        onClose={() => setDisciplinaryGuard(null)}
        onApplyAction={applyDisciplinaryAction}
      />
    </div>
  );
};
