'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import {
  Sparkles,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  RotateCw,
  Plus,
  X,
  User,
  Shield,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { BulkImportModal } from './BulkImportModal';

export const MasterRosterBoard: React.FC = () => {
  const {
    locations,
    guards,
    assignments,
    currentDate,
    setCurrentDate,
    currentRole,
    currentUser,
    assignGuardToPost,
    removeAssignment,
    refreshData,
    showToast,
    overtimeRequests,
    requestOvertime,
    approveOvertime,
    rejectOvertime,
    kpi,
  } = useRoster();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Overtime Request Modal State
  const [otModalGuard, setOtModalGuard] = useState<any | null>(null);
  const [otPostId, setOtPostId] = useState('');
  const [otShift, setOtShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [otHours, setOtHours] = useState(12);
  const [otReason, setOtReason] = useState('Emergency replacement on weekly rest day');
  const [isSubmittingOt, setIsSubmittingOt] = useState(false);

  // Quick slot assignment popover state
  const [activeSlotModal, setActiveSlotModal] = useState<{
    postId: string;
    postName: string;
    locationId: string;
    shift: 'DAY' | 'NIGHT';
  } | null>(null);

  const [guardSearchInModal, setGuardSearchInModal] = useState('');

  // Edit Post Headcount & Settings Modal state
  const [editingPost, setEditingPost] = useState<{
    id: string;
    name: string;
    locationId: string;
    locationName: string;
    requiredDay: number;
    requiredNight: number;
    type: 'FIXED' | 'ROTATING';
  } | null>(null);

  const [isSavingPost, setIsSavingPost] = useState(false);

  // Add New Post Modal state
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [newPostName, setNewPostName] = useState('');
  const [newPostLocId, setNewPostLocId] = useState(locations[0]?.id || '');
  const [newPostReqDay, setNewPostReqDay] = useState(1);
  const [newPostReqNight, setNewPostReqNight] = useState(1);
  const [newPostType, setNewPostType] = useState<'FIXED' | 'ROTATING'>('FIXED');

  // 1-Click Auto Fill Daily Roster Engine
  const handleOneClickAutoRoster = async () => {
    try {
      setIsGenerating(true);
      showToast('⚡ Running 6-day duty + 1-day off rotation engine...');

      const res = await fetch('/api/roster/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: currentDate }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast('🎉 Daily Roster generated and optimized for all posts!');
      } else {
        showToast(`Generation notice: ${data.message || 'Updated roster'}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save edited post headcount (PATCH)
  const handleSavePostHeadcount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      setIsSavingPost(true);
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost.id,
          name: editingPost.name,
          requiredDay: Number(editingPost.requiredDay),
          requiredNight: Number(editingPost.requiredNight),
          type: editingPost.type,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`Updated "${editingPost.name}" to (${editingPost.requiredDay} Day / ${editingPost.requiredNight} Night)`);
        setEditingPost(null);
      } else {
        showToast(`Error updating post: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Save error: ${err.message}`);
    } finally {
      setIsSavingPost(false);
    }
  };

  // Create new post (POST)
  const handleCreateNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: newPostLocId || locations[0]?.id,
          name: newPostName || 'New Duty Post',
          requiredDay: Number(newPostReqDay),
          requiredNight: Number(newPostReqNight),
          type: newPostType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`Added new post "${newPostName}" successfully!`);
        setIsAddPostOpen(false);
        setNewPostName('');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Active Filter Mode from KPI Pills: 'ALL' | 'POSTS' | 'ON_DUTY' | 'OFF_DUTY'
  const [pillFilter, setPillFilter] = useState<'ALL' | 'POSTS' | 'ON_DUTY' | 'OFF_DUTY'>('ALL');
  const [isOffDayModalOpen, setIsOffDayModalOpen] = useState(false);
  const [isAvailableModalOpen, setIsAvailableModalOpen] = useState(false);
  const [availableSearchQuery, setAvailableSearchQuery] = useState('');
  const [isOtListModalOpen, setIsOtListModalOpen] = useState(false);
  const [otFilterTab, setOtFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [otSearchQuery, setOtSearchQuery] = useState('');
  const [assigningGuard, setAssigningGuard] = useState<any | null>(null);
  const [assignPostId, setAssignPostId] = useState('');
  const [assignShift, setAssignShift] = useState<'DAY' | 'NIGHT'>('DAY');

  // Calculate on-duty, weekly off-day, and standby available guards today
  const assignedGuardIdsSet = new Set(assignments.map((a) => a.guardId));
  const normalAssignments = assignments.filter((a) => !a.isOvertime);
  const otAssignments = assignments.filter((a) => a.isOvertime);
  const onDutyGuardsList = guards.filter((g) => assignedGuardIdsSet.has(g.id));
  
  // Today's Eligible Off-Day Guards (Standby Pool for Emergency OT Deployment)
  // Under the 6/1 rotation, active guards whose scheduled day is Off-Day (dutyStreak >= 6) and not on leave/absent/inactive
  const eligibleOffDayGuards = guards.filter(
    (g) => g.status === 'ACTIVE' && g.dutyStreak >= 6
  );

  // Available Off-Day guards who are currently unassigned and ready for emergency OT deployment
  const availableOffDayGuardsForOt = eligibleOffDayGuards.filter(
    (g) => !assignedGuardIdsSet.has(g.id)
  );

  // Active regular duty guards (dutyStreak < 6) who are unassigned
  const regularUnassignedGuards = guards.filter(
    (g) => g.status === 'ACTIVE' && g.dutyStreak < 6 && !assignedGuardIdsSet.has(g.id)
  );

  const onLeaveGuards = guards.filter((g) => g.status === 'ON_LEAVE');
  const absentGuards = guards.filter((g) => g.status === 'ABSENT');

  // For modal backward-compat references
  const offDutyGuardsList = availableOffDayGuardsForOt;
  const availableForDutyList = availableOffDayGuardsForOt;

  const pendingOtCount = overtimeRequests.filter((r) => r.status === 'PENDING').length;
  const approvedOtCount = overtimeRequests.filter((r) => r.status === 'APPROVED').length;
  const rejectedOtCount = overtimeRequests.filter((r) => r.status === 'REJECTED').length;

  // Filter posts based on search query or active pill filter
  const allPostsList: { post: any; location: any }[] = [];
  locations.forEach((loc) => {
    loc.posts.forEach((p) => {
      allPostsList.push({ post: p, location: loc });
    });
  });

  const filteredPosts = allPostsList.filter(({ post, location }) => {
    const postAsgs = assignments.filter((a) => a.postId === post.id);

    if (pillFilter === 'ON_DUTY' && postAsgs.length === 0) return false;
    if (pillFilter === 'POSTS') {
      // Keep all posts visible
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (post.name.toLowerCase().includes(q) || location.name.toLowerCase().includes(q)) return true;

    return postAsgs.some((a) => {
      const g = guards.find((guard) => guard.id === a.guardId);
      return g?.name.toLowerCase().includes(q) || g?.badgeNumber?.toLowerCase().includes(q);
    });
  });

  // Calculate Available Standby Guards for Slot Modal
  const availableGuardsList = guards.filter((g) => {
    if (g.status === 'ON_LEAVE' || g.status === 'INACTIVE') return false;
    if (guardSearchInModal.trim()) {
      return g.name.toLowerCase().includes(guardSearchInModal.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Master Control Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <Shield className="w-6 h-6 text-sky-400" />
              MASTER SECURITY ROSTER BOARD
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Single-screen operational command • 200 Guards workforce management
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddPostOpen(true)}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" /> [+ Add New Post]
            </button>

            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> [ Excel / CSV Import ]
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-4 h-4 text-sky-400" /> [ 🖨️ Print Roster ]
            </button>

            <button
              disabled={isGenerating}
              onClick={handleOneClickAutoRoster}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              {isGenerating ? 'Optimizing Roster...' : '⚡ [ 1-Click Auto Roster ]'}
            </button>
          </div>
        </div>

        {/* Live Operational Stats Pills (Interactive 1-Click Filters & Modals) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800/80 text-xs">
          {/* Pill 1: Total Workforce */}
          <button
            onClick={() => setPillFilter('ALL')}
            className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left ${
              pillFilter === 'ALL'
                ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500'
                : 'bg-slate-950 border-slate-850 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <span>👥 Total Workforce:</span>
            </span>
            <span className="text-sm font-black text-white mt-1">{guards.length} Guards</span>
          </button>

          {/* Pill 2: Duty Posts */}
          <button
            onClick={() => setPillFilter('POSTS')}
            className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left ${
              pillFilter === 'POSTS'
                ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500'
                : 'bg-slate-950 border-slate-850 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-semibold">📍 Duty Posts:</span>
            <span className="text-sm font-black text-sky-400 mt-1">{allPostsList.length} Active Posts</span>
          </button>

          {/* Pill 3: On Duty Today */}
          <button
            onClick={() => setPillFilter('ON_DUTY')}
            className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left ${
              pillFilter === 'ON_DUTY'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                : 'bg-slate-950 border-slate-850 hover:border-slate-700'
            }`}
          >
            <span className="text-slate-400 font-semibold">⚡ On Duty Today:</span>
            <div className="mt-1">
              <span className="text-sm font-black text-emerald-400">{assignments.length} Assigned</span>
              <p className="text-[10px] text-slate-400 font-medium">
                {normalAssignments.length} Normal {otAssignments.length > 0 ? `+ ${otAssignments.length} OT` : ''}
              </p>
            </div>
          </button>

          {/* Pill 4: Available for Duty (Standby Pool from Off-Day) */}
          <button
            onClick={() => setIsAvailableModalOpen(true)}
            title="Standby = Today's eligible Off-Day guards available for emergency OT deployment"
            className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left hover:border-teal-500/80 ${
              isAvailableModalOpen
                ? 'bg-teal-950/60 border-teal-500 shadow-md ring-1 ring-teal-500'
                : 'bg-slate-950 border-slate-850'
            }`}
          >
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <span>🟢 Available for Duty:</span>
            </span>
            <div className="mt-1">
              <span className="text-sm font-black text-teal-400 flex items-center justify-between">
                <span>{availableOffDayGuardsForOt.length} Standby</span>
                <span className="text-[10px] text-teal-300 underline font-normal">View ➔</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Off-Day eligible for OT</p>
            </div>
          </button>

          {/* Pill 5: Off-Day / Leave */}
          <button
            onClick={() => setIsOffDayModalOpen(true)}
            className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left hover:border-amber-500/80 ${
              isOffDayModalOpen
                ? 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500'
                : 'bg-slate-950 border-slate-850'
            }`}
          >
            <span className="text-slate-400 font-semibold">🏖️ Scheduled Off-Day:</span>
            <div className="mt-1">
              <span className="text-sm font-black text-amber-400 flex items-center justify-between">
                <span>{availableOffDayGuardsForOt.length} Rest Day</span>
                <span className="text-[10px] text-amber-300 underline font-normal">View ➔</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">6/1 Cycle Rest</p>
            </div>
          </button>

          {/* Pill 6: Overtime (OT) Deployments & Requests */}
          <button
            onClick={() => setIsOtListModalOpen(true)}
            className={`p-3 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left hover:border-orange-500/80 relative ${
              isOtListModalOpen
                ? 'bg-orange-950/60 border-orange-500 shadow-md ring-1 ring-orange-500'
                : 'bg-slate-950 border-slate-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <span>⚡ Overtime (OT):</span>
              </span>
              {pendingOtCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white font-black text-[9px] rounded-full animate-pulse">
                  {pendingOtCount} new
                </span>
              )}
            </div>
            <div className="mt-1">
              <span className="text-sm font-black text-orange-400 flex items-center justify-between">
                <span>{otAssignments.length} Active OT</span>
                <span className="text-[10px] text-orange-300 underline font-normal">View ➔</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                {pendingOtCount} pending review
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Fast Search & Date Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Type Guard name (e.g. Golam Anisur) or Post name to find instantly..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-sky-500 font-medium shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
          Showing <strong className="text-white">{filteredPosts.length}</strong> of {allPostsList.length} Posts
        </div>
      </div>

      {/* 3. The Master Interactive Excel-Style Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-1/4">📍 Post Name & Headcount</th>
                <th className="py-3.5 px-4 w-1/3 text-amber-400">☀️ Day Shift (12h)</th>
                <th className="py-3.5 px-4 w-1/3 text-indigo-400">🌙 Night Shift (12h)</th>
                <th className="py-3.5 px-4 w-28 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredPosts.map(({ post, location }) => {
                const postAsgs = assignments.filter((a) => a.postId === post.id);
                const dayAsgs = postAsgs.filter((a) => a.shift === 'DAY');
                const nightAsgs = postAsgs.filter((a) => a.shift === 'NIGHT');

                const dayMissing = Math.max(0, post.requiredDay - dayAsgs.length);
                const nightMissing = Math.max(0, post.requiredNight - nightAsgs.length);
                const isFullyCovered = dayMissing === 0 && nightMissing === 0;

                return (
                  <tr key={post.id} className="hover:bg-slate-800/30 transition">
                    {/* Column 1: Post Name & Headcount Edit Badge */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{post.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{location.name}</div>

                      {/* Clickable Headcount Change Button */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            setEditingPost({
                              id: post.id,
                              name: post.name,
                              locationId: location.id,
                              locationName: location.name,
                              requiredDay: post.requiredDay,
                              requiredNight: post.requiredNight,
                              type: post.postType,
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            post.postType === 'FIXED'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
                              : 'bg-purple-950/80 text-purple-300 border-purple-800/80 hover:bg-purple-900'
                          }`}
                          title="Click to change Day/Night guard requirements"
                        >
                          {post.postType === 'FIXED' ? (
                            <Lock className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <RotateCw className="w-3 h-3 text-purple-400" />
                          )}
                          <span>
                            {post.requiredDay} Day / {post.requiredNight} Night
                          </span>
                          <Edit2 className="w-3 h-3 ml-1 opacity-70 hover:opacity-100 text-sky-400" />
                        </button>
                      </div>
                    </td>

                    {/* Column 2: Day Shift Guards */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {dayAsgs.map((asg) => {
                          const guard = guards.find((g) => g.id === asg.guardId);
                          const isFixed = guard?.fixedPostId === post.id;

                          return (
                            <div
                              key={asg.id}
                              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs shadow-sm transition"
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              <span className="font-bold">{guard?.name || 'Assigned Guard'}</span>
                              {isFixed && <span className="text-[9px] text-emerald-400 font-bold">🔒</span>}
                              <button
                                onClick={() => removeAssignment(asg.id)}
                                title="Remove from duty"
                                className="text-slate-500 hover:text-rose-400 ml-1 opacity-60 group-hover:opacity-100 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}

                        {/* Empty Slots */}
                        {Array.from({ length: dayMissing }).map((_, idx) => (
                          <button
                            key={`day-empty-${idx}`}
                            onClick={() =>
                              setActiveSlotModal({
                                postId: post.id,
                                postName: post.name,
                                locationId: location.id,
                                shift: 'DAY',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-950/30 border border-dashed border-rose-800/80 text-rose-300 hover:bg-rose-900/50 hover:text-white font-bold text-xs flex items-center gap-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5" /> [+ Add Guard]
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Column 3: Night Shift Guards */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {nightAsgs.map((asg) => {
                          const guard = guards.find((g) => g.id === asg.guardId);
                          const isFixed = guard?.fixedPostId === post.id;

                          return (
                            <div
                              key={asg.id}
                              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-200 text-xs shadow-sm transition"
                            >
                              <span className="w-2 h-2 rounded-full bg-indigo-400" />
                              <span className="font-bold">{guard?.name || 'Assigned Guard'}</span>
                              {isFixed && <span className="text-[9px] text-emerald-400 font-bold">🔒</span>}
                              <button
                                onClick={() => removeAssignment(asg.id)}
                                title="Remove from duty"
                                className="text-slate-500 hover:text-rose-400 ml-1 opacity-60 group-hover:opacity-100 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}

                        {/* Empty Slots */}
                        {Array.from({ length: nightMissing }).map((_, idx) => (
                          <button
                            key={`night-empty-${idx}`}
                            onClick={() =>
                              setActiveSlotModal({
                                postId: post.id,
                                postName: post.name,
                                locationId: location.id,
                                shift: 'NIGHT',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-950/30 border border-dashed border-rose-800/80 text-rose-300 hover:bg-rose-900/50 hover:text-white font-bold text-xs flex items-center gap-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5" /> [+ Add Guard]
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Column 4: Status */}
                    <td className="py-4 px-4 text-right align-top">
                      {isFullyCovered ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 font-bold text-[11px] border border-emerald-800 flex items-center gap-1 justify-end w-fit ml-auto">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Full
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-950/90 text-rose-300 font-bold text-[11px] border border-rose-800 flex items-center gap-1 justify-end w-fit ml-auto animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" /> Short {dayMissing + nightMissing}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Edit Post Headcount Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePostHeadcount}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-sky-400" />
                  <span>Change Post Guard Requirements</span>
                </h3>
                <p className="text-[11px] text-slate-400">{editingPost.locationName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Post Name:</label>
                <input
                  type="text"
                  value={editingPost.name}
                  onChange={(e) => setEditingPost({ ...editingPost, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-sky-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-amber-400 font-bold">☀️ Day Shift Guards:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPost({
                          ...editingPost,
                          requiredDay: Math.max(0, editingPost.requiredDay - 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={editingPost.requiredDay}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          requiredDay: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-transparent text-center text-base font-black text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPost({
                          ...editingPost,
                          requiredDay: editingPost.requiredDay + 1,
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-indigo-400 font-bold">🌙 Night Shift Guards:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPost({
                          ...editingPost,
                          requiredNight: Math.max(0, editingPost.requiredNight - 1),
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={editingPost.requiredNight}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          requiredNight: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full bg-transparent text-center text-base font-black text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPost({
                          ...editingPost,
                          requiredNight: editingPost.requiredNight + 1,
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Post Type:</label>
                <select
                  value={editingPost.type}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, type: e.target.value as 'FIXED' | 'ROTATING' })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-sky-500 font-semibold"
                >
                  <option value="FIXED">🔒 Fixed Post (Dedicated permanent guards)</option>
                  <option value="ROTATING">🔁 Rotating Post (Rotates across pool)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingPost}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg transition"
              >
                {isSavingPost ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Add New Post Modal */}
      {isAddPostOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewPost}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Add New Security Post</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPostOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Post Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Gate 4 / Tower 9"
                  value={newPostName}
                  onChange={(e) => setNewPostName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Location:</label>
                <select
                  value={newPostLocId}
                  onChange={(e) => setNewPostLocId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-sky-500 font-semibold"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">☀️ Day Guards:</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={newPostReqDay}
                    onChange={(e) => setNewPostReqDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-indigo-400 font-bold mb-1">🌙 Night Guards:</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={newPostReqNight}
                    onChange={(e) => setNewPostReqNight(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Post Type:</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value as 'FIXED' | 'ROTATING')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-sky-500 font-semibold"
                >
                  <option value="FIXED">🔒 Fixed Post</option>
                  <option value="ROTATING">🔁 Rotating Post</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddPostOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg transition"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Quick Guard Picker Modal (When clicking [+ Add Guard]) */}
      {activeSlotModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Assign Guard to</span>
                  <span className="text-sky-400">{activeSlotModal.postName}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Shift: <strong className="text-amber-400">{activeSlotModal.shift}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search available guards..."
                value={guardSearchInModal}
                onChange={(e) => setGuardSearchInModal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {availableGuardsList.slice(0, 30).map((guard, idx) => {
                const isAlreadyAssigned = assignedGuardIdsSet.has(guard.id);
                const isOffDay = guard.dutyStreak >= 6;
                // Calculate 6-day alternating cycle (even index = Day cycle, odd index = Night cycle)
                const isDayCycle = idx % 2 === 0;
                const isShiftMismatch =
                  !isOffDay &&
                  ((activeSlotModal.shift === 'DAY' && !isDayCycle) ||
                  (activeSlotModal.shift === 'NIGHT' && isDayCycle));

                return (
                  <div
                    key={guard.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      isAlreadyAssigned
                        ? 'bg-slate-950/40 border-slate-850 opacity-60'
                        : isOffDay
                        ? 'bg-amber-950/30 border-amber-900/60 hover:border-amber-500'
                        : isShiftMismatch
                        ? 'bg-slate-950/80 border-slate-850 opacity-80'
                        : 'bg-slate-950 border-slate-800 hover:border-sky-500 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{guard.name}</span>
                        {guard.fixedPostId && <span className="text-[9px] text-emerald-400">🔒 Fixed</span>}
                        {isOffDay && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold">
                            🏖️ Off-Day (OT)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Streak: {guard.dutyStreak}/6</span>
                        <span>•</span>
                        {isOffDay ? (
                          <span className="text-amber-400 font-semibold">
                            🏖️ Weekly Rest Day • Available for OT
                          </span>
                        ) : isDayCycle ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                            ☀️ 6-Day Cycle: Day Shift
                          </span>
                        ) : (
                          <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                            🌙 6-Day Cycle: Night Shift
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isAlreadyAssigned}
                      onClick={async () => {
                        if (isOffDay) {
                          // Route to OT Deployment workflow
                          setOtModalGuard(guard);
                          setOtPostId(activeSlotModal.postId);
                          setOtShift(activeSlotModal.shift);
                          setOtReason(`Replacement for vacant slot at ${activeSlotModal.postName}`);
                          setActiveSlotModal(null);
                          return;
                        }

                        if (isShiftMismatch) {
                          const confirmSwap = window.confirm(
                            `⚠️ Shift Rotation Rule Notice:\n\n${guard.name} is currently in a 6-day ${
                              isDayCycle ? 'Day' : 'Night'
                            } Shift cycle. Shift normally alternates to ${
                              activeSlotModal.shift
                            } only after their scheduled weekly Off-Day.\n\nDo you want to override and assign to ${
                              activeSlotModal.shift
                            } Shift today?`
                          );
                          if (!confirmSwap) return;
                        }

                        await assignGuardToPost(
                          guard.id,
                          activeSlotModal.locationId,
                          activeSlotModal.postId,
                          activeSlotModal.shift
                        );
                        setActiveSlotModal(null);
                        showToast(`Assigned ${guard.name} to ${activeSlotModal.postName}`);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        isAlreadyAssigned
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isOffDay
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow font-black'
                          : isShiftMismatch
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 cursor-pointer'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer shadow'
                      }`}
                    >
                      {isAlreadyAssigned ? 'Assigned' : isOffDay ? '⚡ Deploy as OT' : isShiftMismatch ? 'Override' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal isOpen={isBulkImportOpen} onClose={() => setIsBulkImportOpen(false)} />

      {/* Official A4 Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-wider uppercase">SHIELDOPS SECURITY SERVICES</h1>
                  <p className="text-xs text-slate-600 font-bold">OFFICIAL SECURITY DEPLOYMENT MUSTER ROLL</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-slate-900">DATE: {currentDate}</div>
                <div className="text-slate-500">PRINTED: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-100 p-3 rounded-lg text-center text-xs font-bold border border-slate-300">
              <div>Total Force: <span className="text-slate-900">{guards.length}</span></div>
              <div>Duty Posts: <span className="text-slate-900">{allPostsList.length}</span></div>
              <div>Assigned: <span className="text-emerald-700">{assignments.length}</span></div>
              <div>Off-Day / Leave: <span className="text-amber-700">{Math.max(0, guards.length - assignments.length)}</span></div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="p-2 w-1/4">Post Name</th>
                    <th className="p-2 w-1/3">Day Shift (12h)</th>
                    <th className="p-2 w-1/3">Night Shift (12h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allPostsList.map(({ post }) => {
                    const postAsgs = assignments.filter((a) => a.postId === post.id);
                    const dayGuards = postAsgs.filter((a) => a.shift === 'DAY').map((a) => guards.find((g) => g.id === a.guardId)?.name).filter(Boolean);
                    const nightGuards = postAsgs.filter((a) => a.shift === 'NIGHT').map((a) => guards.find((g) => g.id === a.guardId)?.name).filter(Boolean);

                    return (
                      <tr key={post.id}>
                        <td className="p-2 font-bold text-slate-800">
                          {post.name}
                          <span className="text-[9px] text-slate-500 ml-1">({post.postType})</span>
                        </td>
                        <td className="p-2">
                          {dayGuards.length > 0 ? dayGuards.join(', ') : <span className="text-rose-600 font-bold">⚠️ Unfilled</span>}
                        </td>
                        <td className="p-2">
                          {nightGuards.length > 0 ? nightGuards.join(', ') : <span className="text-rose-600 font-bold">⚠️ Unfilled</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-6 border-t-2 border-slate-300 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold">Field Supervisor</div>
                <div className="text-[10px] text-slate-500">Prepared By</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold">Security Manager</div>
                <div className="text-[10px] text-slate-500">Verified & Approved</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold">AGM / DGM Operations</div>
                <div className="text-[10px] text-slate-500">Official Seal</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-300">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-Day Personnel List Modal */}
      {isOffDayModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏖️</span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Scheduled Off-Day Personnel ({availableOffDayGuardsForOt.length} Guards)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Guards currently on scheduled 6/1 weekly rest day — eligible for Overtime (OT) deployment if needed
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOffDayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableOffDayGuardsForOt.map((guard) => {
                  const loc = locations.find((l) => l.id === guard.defaultLocationId);
                  const fixedPost = loc?.posts.find((p) => p.id === guard.fixedPostId);

                  return (
                    <div
                      key={guard.id}
                      className="bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-1.5 hover:border-slate-700 transition shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{guard.name}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px] font-bold">
                          🏖️ Scheduled OFF-DAY
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="font-mono text-sky-400">{guard.badgeNumber}</span>
                        <span>•</span>
                        <span>Streak: {guard.dutyStreak}/6</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                        <span>Base: {loc?.name || 'Central'}</span>
                        <span className="text-teal-400 font-semibold">✓ Eligible for OT</span>
                      </div>

                      {/* ⚡ Deploy Overtime Button */}
                      <button
                        onClick={() => {
                          setOtModalGuard(guard);
                          const defaultLoc = loc || locations[0];
                          setOtPostId(fixedPost?.id || defaultLoc?.posts[0]?.id || allPostsList[0]?.post?.id || '');
                          setOtReason('Emergency replacement on scheduled weekly rest day');
                        }}
                        className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <span>⚡ Deploy as Overtime (OT)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-slate-400 text-[11px]">
              <span>6/1 Rotation Rule: 6 Days Duty completed ➔ 1 Day Rest</span>
              <button
                onClick={() => setIsOffDayModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Overtime Deployment Confirmation & Reason Modal */}
      {otModalGuard && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!otReason.trim()) {
                showToast('⚠️ Please provide a mandatory deployment reason for Overtime (OT).');
                return;
              }
              if (assignedGuardIdsSet.has(otModalGuard.id)) {
                alert(`⚠️ Guard Already Deployed:\n\n${otModalGuard.name} (${otModalGuard.badgeNumber}) is already assigned to a post today.\nA guard cannot be assigned to multiple active posts.`);
                return;
              }
              try {
                setIsSubmittingOt(true);
                const res = await requestOvertime(otModalGuard.id, otPostId, otShift, Number(otHours), otReason);
                if (res.success) {
                  setOtModalGuard(null);
                  setIsOffDayModalOpen(false);
                  setIsAvailableModalOpen(false);
                }
              } catch (err: any) {
                showToast(`Error: ${err.message}`);
              } finally {
                setIsSubmittingOt(false);
              }
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                  <span>⚡ Deploy Guard as Overtime (OT)</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-bold mt-0.5">
                  Guard: {otModalGuard.name} ({otModalGuard.badgeNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOtModalGuard(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️ Scheduled Status: OFF-DAY</span>
              </div>
              <p className="text-slate-300">
                This deployment will create an explicit <strong>Overtime (OT) Record</strong> and maintain the guard&apos;s scheduled Off-Day history for payroll &amp; audit.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Duty Post:</label>
                <select
                  value={otPostId}
                  onChange={(e) => setOtPostId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
                >
                  {allPostsList.map(({ post, location }) => (
                    <option key={post.id} value={post.id}>
                      {post.name} — {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Shift:</label>
                  <select
                    value={otShift}
                    onChange={(e) => setOtShift(e.target.value as 'DAY' | 'NIGHT')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
                  >
                    <option value="DAY">☀️ Day Shift (12h)</option>
                    <option value="NIGHT">🌙 Night Shift (12h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">OT Duration:</label>
                  <select
                    value={otHours}
                    onChange={(e) => setOtHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-black outline-none"
                  >
                    <option value={4}>4 Hours (Half OT)</option>
                    <option value={6}>6 Hours (Mid OT)</option>
                    <option value={8}>8 Hours (Standard OT)</option>
                    <option value={12}>12 Hours (Full Shift OT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Deployment Reason <span className="text-rose-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={otReason}
                  onChange={(e) => setOtReason(e.target.value)}
                  placeholder="e.g. Replacement for absent guard at Main Gate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOtModalGuard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingOt}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition"
              >
                {isSubmittingOt ? 'Deploying...' : '⚡ [ Deploy as OT ]'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🟢 Available Off-Day Personnel (Standby Pool Modal) */}
      {isAvailableModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🟢</span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Available Off-Day Personnel (Standby Pool)</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-extrabold">
                      {availableOffDayGuardsForOt.length} Available for OT
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Today&apos;s scheduled Off-Day guards dynamically available for emergency Overtime (OT) deployment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAvailableModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter for available guards */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={availableSearchQuery}
                onChange={(e) => setAvailableSearchQuery(e.target.value)}
                placeholder="🔍 Search available Off-Day guards by name, badge, phone, location..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-teal-500"
              />
            </div>

            {/* Available Guards List */}
            <div className="max-h-[55vh] overflow-y-auto space-y-2.5 pr-1">
              {(() => {
                const filteredAvailable = availableOffDayGuardsForOt.filter((g) => {
                  if (!availableSearchQuery.trim()) return true;
                  const q = availableSearchQuery.toLowerCase();
                  return (
                    g.name.toLowerCase().includes(q) ||
                    g.badgeNumber?.toLowerCase().includes(q) ||
                    g.phone?.toLowerCase().includes(q) ||
                    (g as any).designation?.toLowerCase().includes(q)
                  );
                });

                if (filteredAvailable.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <p className="text-sm font-bold text-slate-300">No available Off-Day personnel found</p>
                      <p className="text-slate-500 text-[11px]">
                        All scheduled workforce members are currently assigned to duty posts or deployed on active OT.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredAvailable.map((guard) => {
                      const loc = locations.find((l) => l.id === guard.defaultLocationId);
                      const fixedPost = loc?.posts.find((p) => p.id === guard.fixedPostId);

                      return (
                        <div
                          key={guard.id}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 hover:border-teal-500/50 transition shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white text-xs">{guard.name}</span>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-sky-400 font-bold">{guard.badgeNumber}</span>
                                <span>•</span>
                                <span>Streak: {guard.dutyStreak}/6</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px] font-bold">
                              🏖️ Scheduled OFF-DAY
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                            <span>Base: <strong className="text-slate-300">{loc?.name || 'Central'}</strong></span>
                            <span className="text-teal-400 font-bold">✓ Eligible for OT</span>
                          </div>

                          {/* Skills preview */}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                            <span className="text-slate-500">Skills:</span>
                            {(guard.qualifications || ['Gate Security', 'CCTV', 'Patrol']).map((q, qIdx) => (
                              <span key={qIdx} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300">
                                {q}
                              </span>
                            ))}
                          </div>

                          {/* Deploy as OT Action Button */}
                          <div className="pt-1">
                            <button
                              onClick={() => {
                                setOtModalGuard(guard);
                                const defaultLoc = loc || locations[0];
                                setOtPostId(fixedPost?.id || defaultLoc?.posts[0]?.id || allPostsList[0]?.post?.id || '');
                                setOtReason('Emergency replacement for vacant duty post');
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 transition shadow cursor-pointer"
                            >
                              <span>⚡ Deploy as OT</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-slate-400 text-[11px]">
              <span>Deploying an Off-Day guard creates an official OT record &amp; assignment</span>
              <button
                onClick={() => setIsAvailableModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Quick Deploy Standby Guard Modal */}
      {assigningGuard && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!assignPostId) {
                  showToast('Please select a duty post');
                  return;
                }
                const targetPostItem = allPostsList.find((item) => item.post.id === assignPostId);
                const locId = targetPostItem?.location?.id || assigningGuard.defaultLocationId || locations[0]?.id || '';
                await assignGuardToPost(assigningGuard.id, locId, assignPostId, assignShift);
                showToast(`✅ Deployed ${assigningGuard.name} to duty post!`);
                setAssigningGuard(null);
                setIsAvailableModalOpen(false);
              } catch (err: any) {
                showToast(`Error: ${err.message}`);
              }
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-teal-400 flex items-center gap-1.5">
                  <span>⚡ Assign Standby Guard to Duty Post</span>
                </h3>
                <p className="text-[11px] text-slate-300 font-bold mt-0.5">
                  Guard: {assigningGuard.name} ({assigningGuard.badgeNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningGuard(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Duty Post:</label>
                <select
                  value={assignPostId}
                  onChange={(e) => setAssignPostId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
                >
                  {allPostsList.map(({ post, location }) => (
                    <option key={post.id} value={post.id}>
                      {post.name} — {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Duty Shift:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignShift('DAY')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                      assignShift === 'DAY'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ☀️ Day Shift (12h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignShift('NIGHT')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                      assignShift === 'NIGHT'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🌙 Night Shift (12h)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAssigningGuard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl shadow-lg transition"
              >
                ⚡ [ Confirm Assignment ]
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ⚡ Overtime (OT) Requests Management & Approval Modal */}
      {isOtListModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Overtime (OT) Duty Requests Queue</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800 text-[10px] font-extrabold">
                      {overtimeRequests.length} Total Requests
                    </span>
                    {pendingOtCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                        {pendingOtCount} Awaiting Approval
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Review and authorize extra-shift overtime deployments submitted by Supervisors, Managers, and Staff.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOtListModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                <button
                  onClick={() => setOtFilterTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    otFilterTab === 'ALL'
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({overtimeRequests.length})
                </button>
                <button
                  onClick={() => setOtFilterTab('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    otFilterTab === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <span>Pending</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-950/80 text-amber-200 text-[9px]">
                    {pendingOtCount}
                  </span>
                </button>
                <button
                  onClick={() => setOtFilterTab('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    otFilterTab === 'APPROVED'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <span>Approved</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-200 text-[9px]">
                    {approvedOtCount}
                  </span>
                </button>
                <button
                  onClick={() => setOtFilterTab('REJECTED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    otFilterTab === 'REJECTED'
                      ? 'bg-rose-500 text-white font-black shadow'
                      : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  Rejected ({rejectedOtCount})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={otSearchQuery}
                  onChange={(e) => setOtSearchQuery(e.target.value)}
                  placeholder="Filter guard, post, badge..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Overtime Requests List */}
            <div className="max-h-[55vh] overflow-y-auto space-y-2.5 pr-1">
              {(() => {
                const filteredOTs = overtimeRequests.filter((req) => {
                  if (otFilterTab !== 'ALL' && req.status !== otFilterTab) return false;
                  if (!otSearchQuery.trim()) return true;
                  const q = otSearchQuery.toLowerCase();
                  return (
                    req.guardName.toLowerCase().includes(q) ||
                    req.postName?.toLowerCase().includes(q) ||
                    req.locationName?.toLowerCase().includes(q) ||
                    req.requestedBy?.toLowerCase().includes(q) ||
                    req.reason?.toLowerCase().includes(q)
                  );
                });

                if (filteredOTs.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <p className="text-sm font-bold text-slate-300">No overtime requests found</p>
                      <p className="text-slate-500 text-[11px]">
                        {otFilterTab === 'PENDING'
                          ? 'All pending overtime requests have been reviewed.'
                          : 'No matching records in this view.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {filteredOTs.map((req) => {
                      const guard = guards.find((g) => g.id === req.guardId);

                      return (
                        <div
                          key={req.id}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition shadow"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-white text-xs">{req.guardName}</span>
                              {guard?.badgeNumber && (
                                <span className="font-mono text-sky-400 font-bold text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {guard.badgeNumber}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                  req.status === 'PENDING'
                                    ? 'bg-amber-950 text-amber-400 border-amber-800/80 animate-pulse'
                                    : req.status === 'APPROVED'
                                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80'
                                    : 'bg-rose-950 text-rose-400 border-rose-800/80'
                                }`}
                              >
                                {req.status === 'PENDING'
                                  ? '🕒 PENDING APPROVAL'
                                  : req.status === 'APPROVED'
                                  ? '✅ APPROVED & DEPLOYED'
                                  : '❌ REJECTED'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-300 flex items-center gap-3 flex-wrap">
                              <span>
                                📍 Post: <strong className="text-white">{req.postName || 'Assigned Post'}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                🏢 Base: <strong className="text-white">{req.locationName || 'Central Area'}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                {req.shift === 'DAY' ? '☀️ Day Shift' : '🌙 Night Shift'} (<strong>{req.hours || 12}h OT</strong>)
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center gap-2 flex-wrap pt-0.5">
                              <span className="text-amber-300/90 font-medium">💬 Reason: {req.reason || 'Rest day overtime coverage'}</span>
                              <span>•</span>
                              <span>Requested by: <strong className="text-slate-300">{req.requestedBy || 'Field Supervisor'}</strong></span>
                              {req.approvedBy && (
                                <>
                                  <span>•</span>
                                  <span>Authorized by: <strong className="text-emerald-400">{req.approvedBy}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons for Pending Requests */}
                          {req.status === 'PENDING' && (
                            <div className="flex items-center gap-2 sm:self-center">
                              <button
                                onClick={async () => {
                                  try {
                                    await approveOvertime(req.id);
                                    showToast(`✅ Overtime approved & guard deployed!`);
                                  } catch (err: any) {
                                    showToast(`Error: ${err.message}`);
                                  }
                                }}
                                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>[ Approve & Deploy ]</span>
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await rejectOvertime(req.id);
                                    showToast(`Overtime request rejected.`);
                                  } catch (err: any) {
                                    showToast(`Error: ${err.message}`);
                                  }
                                }}
                                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs rounded-xl transition flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>[ Reject ]</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-slate-400 text-[11px]">
              <span>Authorizations are logged with audit timestamps</span>
              <button
                onClick={() => setIsOtListModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
