'use client';

import React, { useState } from 'react';
import { useRoster, SystemLocation, SystemPost } from '../../context/RosterContext';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Edit,
  MoreVertical,
  Check,
  Sparkles,
  Trash2,
  Lock,
  RotateCw,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { AssignmentDrawer } from './AssignmentDrawer';
import { BulkImportModal } from '../roster/BulkImportModal';

export const DeploymentBoardPage: React.FC = () => {
  const {
    locations,
    assignments,
    guards,
    currentDate,
    removeAssignment,
    autoFixPost,
    addLocation,
    addPost,
    deletePost,
    deleteLocation,
    selectedLocationFilter,
    setSelectedLocationFilter,
    showToast,
  } = useRoster();

  // Accordion expansion states for Level 1 (Locations) and Level 2 (Posts)
  const [expandedLocIds, setExpandedLocIds] = useState<Set<string>>(new Set(['LOC-4'])); // Default open Chemical Depot
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set(['POST-D01']));

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawer, setActiveDrawer] = useState<{
    isOpen: boolean;
    location: SystemLocation | null;
    post: SystemPost | null;
    shift: 'DAY' | 'NIGHT';
  }>({ isOpen: false, location: null, post: null, shift: 'DAY' });

  // Modals
  const [isAddLocModalOpen, setIsAddLocModalOpen] = useState(false);
  const [isAddPostModalOpenLocId, setIsAddPostModalOpenLocId] = useState<string | null>(null);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

  // Add Location form
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locSupervisor, setLocSupervisor] = useState('Md. Delwar Hossain');

  // Add Post form
  const [postName, setPostName] = useState('');
  const [postReqDay, setPostReqDay] = useState(1);
  const [postReqNight, setPostReqNight] = useState(1);
  const [postType, setPostType] = useState<'FIXED' | 'ROTATING'>('FIXED');

  // Removal confirmation dialog for Fixed Guards
  const [fixedGuardRemovalAsgId, setFixedGuardRemovalAsgId] = useState<string | null>(null);
  const [fixedGuardRemovalName, setFixedGuardRemovalName] = useState<string>('');

  const toggleExpandLoc = (locId: string) => {
    setExpandedLocIds((prev) => {
      const next = new Set(prev);
      if (next.has(locId)) next.delete(locId);
      else next.add(locId);
      return next;
    });
  };

  const toggleExpandPost = (postId: string) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // Filter Locations
  const filteredLocations = locations.filter((loc) => {
    let reqTotal = 0;
    loc.posts.forEach((p) => { reqTotal += p.requiredDay + p.requiredNight; });
    const locAssignments = assignments.filter((a) => a.date === currentDate && a.locationId === loc.id && a.status === 'confirmed');
    const assignedTotal = locAssignments.length;
    const isFull = assignedTotal >= reqTotal;
    const isShortage = assignedTotal < reqTotal;
    const isOver = assignedTotal > reqTotal;

    if (searchQuery.trim()) {
      if (!loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }

    if (selectedLocationFilter === 'FULL') return isFull;
    if (selectedLocationFilter === 'SHORTAGE') return isShortage;
    if (selectedLocationFilter === 'OVERSTAFFED') return isOver;
    return true;
  });

  const handleSaveAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    addLocation({
      name: locName || 'New Location Site',
      address: locAddress || 'Industrial Area',
      type: 'Site',
      supervisorName: locSupervisor,
      distanceKm: 10,
    });
    setIsAddLocModalOpen(false);
  };

  const handleSaveAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddPostModalOpenLocId) return;
    addPost(isAddPostModalOpenLocId, {
      name: postName || 'New Security Gate',
      requiredDay: Number(postReqDay),
      requiredNight: Number(postReqNight),
      postType,
    });
    setIsAddPostModalOpenLocId(null);
  };

  const handleRemoveClick = (asgId: string, guard: any, post: SystemPost) => {
    if (guard?.fixedPostId === post.id) {
      setFixedGuardRemovalName(guard.name);
      setFixedGuardRemovalAsgId(asgId);
    } else {
      removeAssignment(asgId);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="🔍 Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedLocationFilter}
            onChange={(e) => setSelectedLocationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="ALL">Filter: All</option>
            <option value="FULL">Full Coverage</option>
            <option value="SHORTAGE">Shortage Only</option>
            <option value="OVERSTAFFED">Overstaffed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
          >
            <FileSpreadsheet className="w-4 h-4" /> [ Bulk Import from Excel/CSV ]
          </button>

          <button
            onClick={() => {
              setLocName('');
              setLocAddress('');
              setIsAddLocModalOpen(true);
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" /> [+ Add Loc]
          </button>
        </div>
      </div>

      {/* 3-Level Hierarchy Accordion (Location -> Post -> Guard Slot) */}
      <div className="space-y-4">
        {filteredLocations.map((loc) => {
          const isLocExpanded = expandedLocIds.has(loc.id);
          let locReqTotal = 0;
          loc.posts.forEach((p) => { locReqTotal += p.requiredDay + p.requiredNight; });

          const locAssignments = assignments.filter((a) => a.date === currentDate && a.locationId === loc.id && a.status === 'confirmed');
          const locAssignedTotal = locAssignments.length;
          const locShortage = Math.max(0, locReqTotal - locAssignedTotal);

          return (
            <div
              key={loc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow transition"
            >
              {/* Level 1 Header (Location) */}
              <div
                onClick={() => toggleExpandLoc(loc.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold">
                    {isLocExpanded ? <ChevronDown className="w-5 h-5 text-sky-400" /> : <ChevronRight className="w-5 h-5" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{loc.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({loc.posts.length} Posts)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">{loc.address} • Supervisor: {loc.supervisorName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {locAssignedTotal}/{locReqTotal}
                  </span>
                  {locShortage === 0 ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/60 text-xs">
                      🟢 FULL
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 font-bold border border-rose-800 text-xs animate-pulse">
                      🔴 SHORT {locShortage}
                    </span>
                  )}
                </div>
              </div>

              {/* Level 2: Post List under this Location */}
              {isLocExpanded && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 space-y-4">
                  {/* Location Action Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Posts within {loc.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPostName('');
                          setPostReqDay(1);
                          setPostReqNight(1);
                          setPostType('FIXED');
                          setIsAddPostModalOpenLocId(loc.id);
                        }}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" /> [+ Add Post]
                      </button>
                      <button
                        onClick={() => deleteLocation(loc.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                        title="Delete Location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Posts Accordion Items */}
                  <div className="space-y-3">
                    {loc.posts.map((post) => {
                      const isPostExpanded = expandedPostIds.has(post.id);
                      const postAssignments = assignments.filter((a) => a.date === currentDate && a.postId === post.id && a.status === 'confirmed');
                      const dayGuards = postAssignments.filter((a) => a.shift === 'DAY');
                      const nightGuards = postAssignments.filter((a) => a.shift === 'NIGHT');

                      const postReqTotal = post.requiredDay + post.requiredNight;
                      const postAssignedTotal = postAssignments.length;
                      const postShortage = Math.max(0, postReqTotal - postAssignedTotal);

                      const dayEmptySlots = Math.max(0, post.requiredDay - dayGuards.length);
                      const nightEmptySlots = Math.max(0, post.requiredNight - nightGuards.length);

                      return (
                        <div
                          key={post.id}
                          className="bg-slate-900 border border-slate-800/90 rounded-xl overflow-hidden shadow-sm"
                        >
                          {/* Post Header (Level 2 click) */}
                          <div
                            onClick={() => toggleExpandPost(post.id)}
                            className="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-slate-400">
                                {isPostExpanded ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4" />}
                              </span>
                              <span className="text-xs font-bold text-white">{post.name}</span>
                              {post.postType === 'FIXED' ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Fixed Post
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold flex items-center gap-1">
                                  <RotateCw className="w-2.5 h-2.5" /> Rotating
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono font-bold text-slate-300">
                                {postAssignedTotal}/{postReqTotal}
                              </span>
                              {postShortage === 0 ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 font-bold text-[10px] border border-emerald-800/60">
                                  🟢 FULL
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 font-bold text-[10px] border border-rose-800 animate-pulse">
                                  🔴 SHORT {postShortage}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Level 3: Post Detail (Guards Assigned to Post) */}
                          {isPostExpanded && (
                            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Day Shift */}
                                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                                    <span>DAY SHIFT ({post.requiredDay} Required)</span>
                                    <span className="text-slate-500 font-normal">{dayGuards.length}/{post.requiredDay}</span>
                                  </div>

                                  <div className="space-y-1.5">
                                    {dayGuards.map((asg) => {
                                      const guard = guards.find((g) => g.id === asg.guardId);
                                      const isFixed = guard?.fixedPostId === post.id;

                                      return (
                                        <div
                                          key={asg.id}
                                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="font-semibold text-slate-200">{guard?.name}</span>
                                            {isFixed ? (
                                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                                <Lock className="w-2.5 h-2.5" /> Fixed here
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-purple-400 font-bold flex items-center gap-0.5">
                                                <RotateCw className="w-2.5 h-2.5" /> Rotating
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => handleRemoveClick(asg.id, guard, post)}
                                            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded hover:bg-rose-950/40"
                                          >
                                            [Remove]
                                          </button>
                                        </div>
                                      );
                                    })}

                                    {/* Empty Slots */}
                                    {Array.from({ length: dayEmptySlots }).map((_, idx) => (
                                      <div
                                        key={`empty-day-${idx}`}
                                        onClick={() => setActiveDrawer({ isOpen: true, location: loc, post, shift: 'DAY' })}
                                        className="flex items-center justify-between p-2 rounded-lg border border-dashed border-rose-900/60 bg-rose-950/20 text-xs text-rose-400 cursor-pointer hover:bg-rose-950/40 transition"
                                      >
                                        <span className="font-bold flex items-center gap-1">
                                          🔴 [+ Assign Guard]
                                        </span>
                                        <span className="text-[10px] text-rose-400/80">Empty Slot</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Night Shift */}
                                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                                    <span>NIGHT SHIFT ({post.requiredNight} Required)</span>
                                    <span className="text-slate-500 font-normal">{nightGuards.length}/{post.requiredNight}</span>
                                  </div>

                                  <div className="space-y-1.5">
                                    {nightGuards.map((asg) => {
                                      const guard = guards.find((g) => g.id === asg.guardId);
                                      const isFixed = guard?.fixedPostId === post.id;

                                      return (
                                        <div
                                          key={asg.id}
                                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="font-semibold text-slate-200">{guard?.name}</span>
                                            {isFixed ? (
                                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                                <Lock className="w-2.5 h-2.5" /> Fixed here
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-purple-400 font-bold flex items-center gap-0.5">
                                                <RotateCw className="w-2.5 h-2.5" /> Rotating
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => handleRemoveClick(asg.id, guard, post)}
                                            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded hover:bg-rose-950/40"
                                          >
                                            [Remove]
                                          </button>
                                        </div>
                                      );
                                    })}

                                    {/* Empty Slots */}
                                    {Array.from({ length: nightEmptySlots }).map((_, idx) => (
                                      <div
                                        key={`empty-night-${idx}`}
                                        onClick={() => setActiveDrawer({ isOpen: true, location: loc, post, shift: 'NIGHT' })}
                                        className="flex items-center justify-between p-2 rounded-lg border border-dashed border-rose-900/60 bg-rose-950/20 text-xs text-rose-400 cursor-pointer hover:bg-rose-950/40 transition"
                                      >
                                        <span className="font-bold flex items-center gap-1">
                                          🔴 [+ Assign Guard]
                                        </span>
                                        <span className="text-[10px] text-rose-400/80">Empty Slot</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Footer buttons for this Post */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                                <button
                                  onClick={() => setActiveDrawer({ isOpen: true, location: loc, post, shift: 'NIGHT' })}
                                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 font-bold text-xs rounded-lg flex items-center gap-1"
                                >
                                  [ Find Replacement ]
                                </button>

                                <button
                                  onClick={() => autoFixPost(loc.id, post.id)}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1 shadow"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> [ Auto Fix ]
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Drawer (Screen 2A) */}
      <AssignmentDrawer
        isOpen={activeDrawer.isOpen}
        onClose={() => setActiveDrawer({ isOpen: false, location: null, post: null, shift: 'DAY' })}
        targetLocation={activeDrawer.location}
        targetPost={activeDrawer.post}
        targetShift={activeDrawer.shift}
      />

      {/* Confirmation Dialog when removing a FIXED Post Guard */}
      {fixedGuardRemovalAsgId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fixed Post Removal Warning</h4>
              <p className="text-xs text-slate-400 mt-1">
                <strong className="text-white">{fixedGuardRemovalName}</strong> is permanently fixed to this post. Removing today only, not changing his permanent fixed post profile. Continue?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFixedGuardRemovalAsgId(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeAssignment(fixedGuardRemovalAsgId);
                  setFixedGuardRemovalAsgId(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Yes, Remove for Today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* + Add Location Modal */}
      {isAddLocModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAddLocation}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">+ Add Location Facility</h3>
            <p className="text-xs text-slate-400">
              Note: Headcount requirements are now defined at the Post level inside the location.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Location Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-Site 6: Riverport Terminal"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Address / Zone:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Narayanganj Outer Ring"
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Field Supervisor:</label>
                <input
                  type="text"
                  value={locSupervisor}
                  onChange={(e) => setLocSupervisor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddLocModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
              >
                Save Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* + Add Post Modal */}
      {isAddPostModalOpenLocId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAddPost}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">+ Add Duty Post to Location</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Post Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Perimeter Tower 4"
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Required Day Guards:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={postReqDay}
                    onChange={(e) => setPostReqDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Required Night Guards:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={postReqNight}
                    onChange={(e) => setPostReqNight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Post Assignment Type:</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as 'FIXED' | 'ROTATING')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="FIXED">🔒 Fixed Post (Dedicated permanent guards assigned)</option>
                  <option value="ROTATING">🔁 Rotating Post (Floating pool rotates through here)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddPostModalOpenLocId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
              >
                Save Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
      />
    </div>
  );
};
