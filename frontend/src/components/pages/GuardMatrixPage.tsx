'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { ChevronLeft, ChevronRight, Search, X, Lock, RotateCw, AlertTriangle, Users } from 'lucide-react';

export const GuardMatrixPage: React.FC = () => {
  const { guards, locations, showToast } = useRoster();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocFilter, setSelectedLocFilter] = useState('ALL');
  const [selectedPostFilter, setSelectedPostFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [weekOffset, setWeekOffset] = useState<number>(0);

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

  // Edit popover states
  const [editingShift, setEditingShift] = useState('DAY');
  const [editingLocationId, setEditingLocationId] = useState(locations[0]?.id || 'LOC-1');
  const [editingPostId, setEditingPostId] = useState(locations[0]?.posts[0]?.id || 'POST-F01');

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

  // Selected Location object for popover posts
  const activeEditingLocation = locations.find((l) => l.id === editingLocationId) || locations[0];

  const filteredGuards = guards.filter((g) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!g.name.toLowerCase().includes(q) && !g.badgeNumber.toLowerCase().includes(q)) return false;
    }
    if (selectedLocFilter !== 'ALL' && g.defaultLocationId !== selectedLocFilter) return false;
    if (selectedPostFilter !== 'ALL' && g.fixedPostId !== selectedPostFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredGuards.length / pageSize) || 1;
  const paginatedGuards = filteredGuards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar with Location + Post Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
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

        <div className="flex items-center gap-2 flex-1 max-w-2xl justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="🔍 Search all 200 guards..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <select
            value={selectedLocFilter}
            onChange={(e) => {
              setSelectedLocFilter(e.target.value);
              setSelectedPostFilter('ALL');
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-400 outline-none cursor-pointer"
          >
            <option value={25}>Show 25 / page</option>
            <option value={50}>Show 50 / page</option>
            <option value={100}>Show 100 / page</option>
            <option value={200}>Show All 200 Guards</option>
          </select>
        </div>
      </div>

      {/* Legend & Policy Banner */}
      <div className="flex items-center justify-between text-xs pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-3">
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
        <div className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
          🔄 <strong>Rotation Policy:</strong> 6 Days Day ➔ 1 Off-Day ➔ 6 Days Night ➔ 1 Off-Day ➔ 6 Days Day
        </div>
      </div>

      {/* 7-Day Matrix Table with Fixed Post Column */}
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
                
                // Determine initial shift: half starts in Day cycle, half in Night cycle
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
                      
                      // Week cycle parity: when dIdx crosses off-day or based on weekOffset, shift alternates!
                      // For days BEFORE off-day in current week: current week's shift
                      // For days AFTER off-day: shift has ALTERNATED to the other shift!
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
                      const tooltip = `${guard.name} — ${d.fullLabel} — ${
                        isOff ? '🏖️ Weekly OFF Day' : currentShift === 'DAY' ? '☀️ 6-Day Day Shift' : '🌙 6-Day Night Shift'
                      } — ${locObj.name} / ${assignedPostName}`;

                      return (
                        <td key={d.dateStr} className="p-2 text-center">
                          <button
                            title={tooltip}
                            onClick={() => {
                              setSelectedCell({
                                guardId: guard.id,
                                guardName: guard.name,
                                dayLabel: d.fullLabel,
                                shift: isOff ? 'OFF' : currentShift === 'DAY' ? 'Day' : 'Night',
                                locationId: locObj.id,
                                postId: fixedPostObj?.id || locObj.posts[0]?.id || 'POST-1',
                                postName: assignedPostName,
                                isFixedGuard: !!guard.fixedPostId,
                                fixedPostName: fixedPostObj?.name,
                              });
                              setEditingLocationId(locObj.id);
                              setEditingPostId(fixedPostObj?.id || locObj.posts[0]?.id || 'POST-1');
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

        {/* Pagination & Count Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>
              Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, filteredGuards.length)}
              </strong>{' '}
              of <strong className="text-white">{filteredGuards.length}</strong> Total Guards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              Previous
            </button>
            <span className="text-slate-300 font-bold">
              Page {currentPage} of {totalPages}
            </span>
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

      {/* Mini Cell Popover with 3-Level Location + Post Selector */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {activeEditingLocation.posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.postType === 'FIXED' ? 'Fixed Post' : 'Rotating'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
                [Change & Save]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
