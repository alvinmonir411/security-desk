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
    posts,
    guards,
    assignments,
    currentDate,
    setCurrentDate,
    assignGuardToPost,
    removeAssignment,
    refreshData,
    showToast,
    kpi,
  } = useRoster();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Filter posts based on search query or highlighted guard
  const allPostsList: { post: any; location: any }[] = [];
  locations.forEach((loc) => {
    loc.posts.forEach((p) => {
      allPostsList.push({ post: p, location: loc });
    });
  });

  const filteredPosts = allPostsList.filter(({ post, location }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (post.name.toLowerCase().includes(q) || location.name.toLowerCase().includes(q)) return true;

    const postAsgs = assignments.filter((a) => a.postId === post.id);
    return postAsgs.some((a) => {
      const g = guards.find((guard) => guard.id === a.guardId);
      return g?.name.toLowerCase().includes(q) || g?.badgeNumber?.toLowerCase().includes(q);
    });
  });

  // Calculate Available Standby Guards for Slot Modal
  const assignedGuardIdsToday = new Set(assignments.map((a) => a.guardId));
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

        {/* Live Operational Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Total Workforce:</span>
            <span className="text-sm font-black text-white">{guards.length} Guards</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Duty Posts:</span>
            <span className="text-sm font-black text-sky-400">{allPostsList.length} Active Posts</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
            <span className="text-slate-400 font-semibold">On Duty Today:</span>
            <span className="text-sm font-black text-emerald-400">{assignments.length} Assigned</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Off-Day / Leave:</span>
            <span className="text-sm font-black text-amber-400">
              {Math.max(0, guards.length - assignments.length)} Rest / Leave
            </span>
          </div>
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
                const isAlreadyAssigned = assignedGuardIdsToday.has(guard.id);
                // Calculate 6-day alternating cycle (even index = Day cycle, odd index = Night cycle)
                const isDayCycle = idx % 2 === 0;
                const isShiftMismatch =
                  (activeSlotModal.shift === 'DAY' && !isDayCycle) ||
                  (activeSlotModal.shift === 'NIGHT' && isDayCycle);

                return (
                  <div
                    key={guard.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      isAlreadyAssigned
                        ? 'bg-slate-950/40 border-slate-850 opacity-60'
                        : isShiftMismatch
                        ? 'bg-slate-950/80 border-slate-850 opacity-80'
                        : 'bg-slate-950 border-slate-800 hover:border-sky-500 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{guard.name}</span>
                        {guard.fixedPostId && <span className="text-[9px] text-emerald-400">🔒 Fixed</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Streak: {guard.dutyStreak}/6</span>
                        <span>•</span>
                        {isDayCycle ? (
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
                          : isShiftMismatch
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 cursor-pointer'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer shadow'
                      }`}
                    >
                      {isAlreadyAssigned ? 'Assigned' : isShiftMismatch ? 'Override' : 'Select'}
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
    </div>
  );
};
