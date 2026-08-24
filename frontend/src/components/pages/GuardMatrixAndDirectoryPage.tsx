'use client';

import React, { useState } from 'react';
import { useRoster, GuardProfile } from '../../context/RosterContext';
import {
  CalendarDays,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  Lock,
  RotateCw,
  AlertTriangle,
  X,
  Phone,
  Droplet,
  CreditCard,
  Calendar,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { BulkImportModal } from '../roster/BulkImportModal';

export const GuardMatrixAndDirectoryPage: React.FC = () => {
  const {
    guards,
    locations,
    addGuard,
    updateGuardFixedPost,
    showToast,
  } = useRoster();

  // Active Sub-Tab View: 'matrix' (7-Day Timeline) or 'directory' (Personnel Profiles)
  const [activeTab, setActiveTab] = useState<'matrix' | 'directory'>('matrix');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocFilter, setSelectedLocFilter] = useState('ALL');
  const [selectedPostFilter, setSelectedPostFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [postTypeFilter, setPostTypeFilter] = useState('ALL');

  // Pagination & Week Offset for Matrix
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Modals
  const [isAddGuardOpen, setIsAddGuardOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Form states for Add Guard
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNid, setFormNid] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBlood, setFormBlood] = useState('O+');
  const [formLocation, setFormLocation] = useState(locations[0]?.id || 'LOC-1');
  const [formAssignmentType, setFormAssignmentType] = useState<'FIXED' | 'ROTATING'>('FIXED');
  const [formFixedPostId, setFormFixedPostId] = useState(locations[0]?.posts[0]?.id || '');

  // Matrix Cell Edit Popover
  const [selectedCell, setSelectedCell] = useState<{
    guardId: string;
    guardName: string;
    dayLabel: string;
    shift: string;
    locationId: string;
    postId: string;
    postName: string;
    isFixedGuard: boolean;
    fixedPostName?: string;
  } | null>(null);

  const [editingShift, setEditingShift] = useState('DAY');
  const [editingLocationId, setEditingLocationId] = useState(locations[0]?.id || 'LOC-1');
  const [editingPostId, setEditingPostId] = useState(locations[0]?.posts[0]?.id || '');

  // Calculate 7 days based on weekOffset
  const baseDate = new Date(2026, 7, 24 + weekOffset * 7); // Aug 24, 2026 is Monday
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      dayNum: d.getDate(),
      dayName: dayNames[d.getDay()],
      dateStr: d.toISOString().split('T')[0],
      fullLabel: `${dayNames[d.getDay()]} ${d.getDate()} Aug`,
    };
  });

  const activeSelectedLocation = locations.find((l) => l.id === formLocation) || locations[0];
  const activeEditingLocation = locations.find((l) => l.id === editingLocationId) || locations[0];

  // Filtering Logic
  const filteredGuards = guards.filter((g) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!g.name.toLowerCase().includes(q) && !g.badgeNumber.toLowerCase().includes(q) && !g.phone.includes(q)) {
        return false;
      }
    }
    if (selectedLocFilter !== 'ALL' && g.defaultLocationId !== selectedLocFilter) return false;
    if (selectedPostFilter !== 'ALL' && g.fixedPostId !== selectedPostFilter) return false;
    if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
    if (postTypeFilter === 'FIXED' && !g.fixedPostId) return false;
    if (postTypeFilter === 'ROTATING' && g.fixedPostId) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredGuards.length / pageSize) || 1;
  const paginatedGuards = filteredGuards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveNewGuard = (e: React.FormEvent) => {
    e.preventDefault();
    addGuard({
      name: formName || 'Security Guard',
      phone: formPhone || '+880 1711000000',
      nid: formNid || '1998000000',
      address: formAddress || 'Dhaka, Bangladesh',
      joiningDate: new Date().toISOString().split('T')[0],
      bloodGroup: formBlood,
      defaultLocationId: formLocation,
      fixedPostId: formAssignmentType === 'FIXED' ? formFixedPostId : null,
      status: 'ACTIVE',
      qualifications: ['Gate Security', 'First Aid'],
    });
    setIsAddGuardOpen(false);
    showToast(`Added guard "${formName}" successfully!`);
    setFormName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Master Header with Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-400" />
              GUARDS & DUTY MATRIX CENTER
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified 200-force personnel directory & 7-day continuous shift schedule
            </p>
          </div>

          {/* Sub-Tab Navigation Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-sky-500 text-slate-950 shadow-lg font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> [ 📅 7-Day Duty Matrix ]
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-sky-500 text-slate-950 shadow-lg font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> [ 👥 Guards Directory ({guards.length}) ]
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <FileSpreadsheet className="w-4 h-4" /> [ Excel / CSV Import ]
            </button>
            <button
              onClick={() => setIsAddGuardOpen(true)}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" /> [+ Add New Guard]
            </button>
          </div>
        </div>

        {/* Unified Search & Filters Row */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80 flex-wrap">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="🔍 Search 200 guards by Name, ID, or Phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedLocFilter}
              onChange={(e) => {
                setSelectedLocFilter(e.target.value);
                setSelectedPostFilter('ALL');
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <select
              value={postTypeFilter}
              onChange={(e) => {
                setPostTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Posts (Fixed & Rotating)</option>
              <option value="FIXED">🔒 Fixed Post Guards</option>
              <option value="ROTATING">🔁 Rotating Pool Guards</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 outline-none cursor-pointer"
            >
              <option value={25}>Show 25 / page</option>
              <option value={50}>Show 50 / page</option>
              <option value={100}>Show 100 / page</option>
              <option value={200}>Show All 200 Guards</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. VIEW 1: 7-Day Continuous Shift Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Week Selector Bar & Legend */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" /> [◀ Prev Week]
              </button>
              <span className="text-xs font-bold text-sky-400">
                {days[0].fullLabel} — {days[6].fullLabel}
              </span>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                [Next Week ▶] <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                  D
                </span>
                <strong className="text-slate-300">6-Day Day Shift</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-indigo-950 border border-indigo-500 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                  N
                </span>
                <strong className="text-slate-300">6-Day Night Shift</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-4 rounded bg-slate-800 border border-slate-600 text-slate-400 font-bold text-[9px] flex items-center justify-center">
                  OFF
                </span>
                <strong className="text-slate-300">Weekly Rest Day</strong>
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-4 w-1/4">Guard Name & ID</th>
                    {days.map((d) => (
                      <th key={d.dateStr} className="p-3.5 text-center w-16">
                        <div>{d.dayName}</div>
                        <div className="text-sky-400 font-black text-xs">{d.dayNum}</div>
                      </th>
                    ))}
                    <th className="p-3.5 text-right pr-4">Post Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {paginatedGuards.map((guard, rawIdx) => {
                    const globalIdx = (currentPage - 1) * pageSize + rawIdx;
                    const offDayIndex = globalIdx % 7;
                    const baseStartsDay = globalIdx % 2 === 0;

                    const locObj = locations.find((l) => l.id === guard.defaultLocationId) || locations[0];
                    const fixedPostObj = locObj.posts.find((p) => p.id === guard.fixedPostId);

                    return (
                      <tr key={guard.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 pl-4 text-slate-200 font-semibold">
                          <div className="font-bold text-white text-xs">{guard.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{guard.badgeNumber}</div>
                        </td>

                        {days.map((d, dIdx) => {
                          const isOff = dIdx === offDayIndex;
                          const isAfterOffDay = dIdx > offDayIndex;
                          const effectiveWeekIsAlt = (weekOffset % 2 !== 0) !== isAfterOffDay;

                          let currentShift: 'DAY' | 'NIGHT';
                          if (baseStartsDay) {
                            currentShift = effectiveWeekIsAlt ? 'NIGHT' : 'DAY';
                          } else {
                            currentShift = effectiveWeekIsAlt ? 'DAY' : 'NIGHT';
                          }

                          let cellText = isOff ? 'OFF' : currentShift === 'DAY' ? 'D' : 'N';
                          let cellClass = isOff
                            ? 'bg-slate-800 text-slate-400 border-slate-700 font-bold'
                            : currentShift === 'DAY'
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 font-black'
                            : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80 font-black';

                          const assignedPostName = fixedPostObj ? fixedPostObj.name : locObj.posts[0]?.name || 'Duty Post';

                          return (
                            <td key={d.dateStr} className="p-2 text-center">
                              <button
                                onClick={() => {
                                  setSelectedCell({
                                    guardId: guard.id,
                                    guardName: guard.name,
                                    dayLabel: d.fullLabel,
                                    shift: isOff ? 'OFF' : currentShift === 'DAY' ? 'Day' : 'Night',
                                    locationId: locObj.id,
                                    postId: fixedPostObj?.id || locObj.posts[0]?.id || '',
                                    postName: assignedPostName,
                                    isFixedGuard: !!guard.fixedPostId,
                                    fixedPostName: fixedPostObj?.name,
                                  });
                                  setEditingLocationId(locObj.id);
                                  setEditingPostId(fixedPostObj?.id || locObj.posts[0]?.id || '');
                                }}
                                className={`w-9 h-8 rounded-lg border text-xs flex items-center justify-center mx-auto hover:scale-105 transition cursor-pointer shadow-sm ${cellClass}`}
                              >
                                {cellText}
                              </button>
                            </td>
                          );
                        })}

                        <td className="p-3 text-right pr-4 truncate max-w-[170px]">
                          {guard.fixedPostId && fixedPostObj ? (
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3" /> {fixedPostObj.name} 🔒
                            </span>
                          ) : (
                            <span className="text-purple-400 font-bold text-[11px] flex items-center justify-end gap-1">
                              <RotateCw className="w-3 h-3" /> Rotating Pool 🔁
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
              <div>
                Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                <strong className="text-white">
                  {Math.min(currentPage * pageSize, filteredGuards.length)}
                </strong>{' '}
                of <strong className="text-white">{filteredGuards.length}</strong> Total Personnel
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  Previous
                </button>
                <span className="text-slate-300 font-bold">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW 2: Guards Directory & Comprehensive Personnel Cards */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedGuards.map((guard) => {
              const loc = locations.find((l) => l.id === guard.defaultLocationId);
              const fixedPost = loc?.posts.find((p) => p.id === guard.fixedPostId);

              return (
                <div
                  key={guard.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition shadow-lg relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{guard.name}</h3>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span className="text-sky-400 font-bold">{guard.badgeNumber}</span>
                        <span>•</span>
                        <span className="text-slate-400">{loc?.name || 'Assigned Location'}</span>
                      </div>
                    </div>
                    {guard.fixedPostId ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Fixed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold flex items-center gap-1">
                        <RotateCw className="w-2.5 h-2.5" /> Rotating
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-850">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{guard.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Droplet className="w-3.5 h-3.5 text-rose-400" />
                      <span>Blood: {guard.bloodGroup}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>NID: {guard.nid}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400">
                      Streak: <strong className="text-white">{guard.dutyStreak}/6 Days</strong>
                    </div>
                    {fixedPost && (
                      <div className="text-[11px] text-emerald-400 font-semibold truncate max-w-[140px]">
                        📍 {fixedPost.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Directory Pagination Footer */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
            <div>
              Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, filteredGuards.length)}
              </strong>{' '}
              of <strong className="text-white">{filteredGuards.length}</strong> Total Personnel
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-slate-300 font-bold">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cell Edit Popover Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedCell.guardName}</h4>
                <p className="text-xs text-sky-400">{selectedCell.dayLabel} • {selectedCell.postName}</p>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedCell.isFixedGuard && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  This guard is permanently fixed to <strong>{selectedCell.fixedPostName}</strong>. Moving him to another post will create a gap at his home post.
                </span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Change Shift:</label>
                <select
                  value={editingShift}
                  onChange={(e) => setEditingShift(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                >
                  <option value="DAY">☀️ Day Shift (12h)</option>
                  <option value="NIGHT">🌙 Night Shift (12h)</option>
                  <option value="OFF">🏖️ Scheduled Weekly OFF</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Location:</label>
                <select
                  value={editingLocationId}
                  onChange={(e) => {
                    setEditingLocationId(e.target.value);
                    const newLoc = locations.find((l) => l.id === e.target.value);
                    if (newLoc && newLoc.posts.length > 0) {
                      setEditingPostId(newLoc.posts[0].id);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Duty Post:</label>
                <select
                  value={editingPostId}
                  onChange={(e) => setEditingPostId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                >
                  {activeEditingLocation.posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.postType === 'FIXED' ? 'Fixed Post' : 'Rotating'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Assignment updated for ${selectedCell.guardName} on ${selectedCell.dayLabel}`);
                  setSelectedCell(null);
                }}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs rounded-lg font-bold"
              >
                [Save Changes]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add New Guard Modal */}
      {isAddGuardOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNewGuard}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Add New Security Guard</span>
              </h3>
              <button type="button" onClick={() => setIsAddGuardOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Rafiqul Islam"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number:</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711..."
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Blood Group:</label>
                  <select
                    value={formBlood}
                    onChange={(e) => setFormBlood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">NID Number:</label>
                <input
                  type="text"
                  placeholder="10 or 17 digit NID"
                  value={formNid}
                  onChange={(e) => setFormNid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Deployment Location:</label>
                <select
                  value={formLocation}
                  onChange={(e) => {
                    setFormLocation(e.target.value);
                    const newLoc = locations.find((l) => l.id === e.target.value);
                    if (newLoc && newLoc.posts.length > 0) {
                      setFormFixedPostId(newLoc.posts[0].id);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assignment Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAssignmentType('FIXED')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formAssignmentType === 'FIXED'
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> Fixed Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAssignmentType('ROTATING')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formAssignmentType === 'ROTATING'
                        ? 'bg-purple-950 border-purple-700 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotating Pool
                  </button>
                </div>
              </div>

              {formAssignmentType === 'FIXED' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Select Fixed Home Post:</label>
                  <select
                    value={formFixedPostId}
                    onChange={(e) => setFormFixedPostId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  >
                    {activeSelectedLocation.posts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.postType})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddGuardOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg transition"
              >
                Save Guard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal isOpen={isBulkImportOpen} onClose={() => setIsBulkImportOpen(false)} />
    </div>
  );
};
