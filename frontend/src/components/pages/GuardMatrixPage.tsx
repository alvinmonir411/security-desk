'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { ChevronLeft, ChevronRight, Search, X, Lock, RotateCw, AlertTriangle } from 'lucide-react';

export const GuardMatrixPage: React.FC = () => {
  const { guards, locations, showToast } = useRoster();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocFilter, setSelectedLocFilter] = useState('ALL');
  const [selectedPostFilter, setSelectedPostFilter] = useState('ALL');

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

  const days = [
    { label: '24', name: 'Mon 24' },
    { label: '25', name: 'Tue 25' },
    { label: '26', name: 'Wed 26' },
    { label: '27', name: 'Thu 27' },
    { label: '28', name: 'Fri 28' },
    { label: '29', name: 'Sat 29' },
    { label: '30', name: 'Sun 30' },
  ];

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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Bar with Location + Post Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> [◀ Prev Week]
          </button>
          <span className="text-xs font-bold text-sky-400">
            Aug 24 - Aug 30, 2026
          </span>
          <button className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1">
            [Next Week ▶] <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="🔍 Search guard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={selectedLocFilter}
            onChange={(e) => {
              setSelectedLocFilter(e.target.value);
              setSelectedPostFilter('ALL');
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {selectedLocFilter !== 'ALL' && (
            <select
              value={selectedPostFilter}
              onChange={(e) => setSelectedPostFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">All Posts</option>
              {locations.find((l) => l.id === selectedLocFilter)?.posts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs pb-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-500 text-emerald-400 font-bold text-[9px] flex items-center justify-center">D</span> Day (12h)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-950 border border-indigo-500 text-indigo-400 font-bold text-[9px] flex items-center justify-center">N</span> Night (12h)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-800 border border-slate-600 text-slate-400 font-bold text-[9px] flex items-center justify-center">OFF</span> Weekly Off</span>
        </div>
        <span className="text-amber-400 font-semibold">
          ⚠️ Yellow border indicates guard completed 6 consecutive days (Due for OFF)
        </span>
      </div>

      {/* 7-Day Matrix Table with Fixed Post Column */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <th className="p-3 pl-4">Guard</th>
                {days.map((d) => (
                  <th key={d.label} className="p-3 text-center w-14">{d.label}</th>
                ))}
                <th className="p-3 text-right pr-4">Fixed Post</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGuards.slice(0, 35).map((guard, idx) => {
                const offDayIndex = idx % 7;
                const locObj = locations.find((l) => l.id === guard.defaultLocationId) || locations[0];
                const fixedPostObj = locObj.posts.find((p) => p.id === guard.fixedPostId);

                return (
                  <tr key={guard.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 pl-4 text-slate-200 font-semibold">
                      {guard.name} <span className="text-[10px] text-slate-500 font-mono">({guard.badgeNumber})</span>
                    </td>

                    {days.map((d, dIdx) => {
                      const isOff = dIdx === offDayIndex;
                      const isNight = (idx + dIdx) % 2 !== 0;
                      const isDueForOff = guard.dutyStreak >= 6 && dIdx === 6;

                      let cellText = isOff ? 'OFF' : isNight ? 'N' : 'D';
                      let cellClass = isOff
                        ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                        : isNight
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800';

                      if (isDueForOff) {
                        cellClass += ' ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900';
                      }

                      const assignedPostName = fixedPostObj ? fixedPostObj.name : locObj.posts[0]?.name || 'Duty Post';
                      const tooltip = `${guard.name} — Aug ${d.label} — ${cellText === 'D' ? 'Day' : cellText === 'N' ? 'Night' : 'OFF'} — ${locObj.name} / ${assignedPostName}`;

                      return (
                        <td key={d.label} className="p-2 text-center">
                          <button
                            title={tooltip}
                            onClick={() => {
                              setSelectedCell({
                                guardId: guard.id,
                                guardName: guard.name,
                                dayLabel: `Aug ${d.label}, 2026`,
                                shift: isOff ? 'OFF' : isNight ? 'Night' : 'Day',
                                locationId: locObj.id,
                                postId: fixedPostObj?.id || locObj.posts[0]?.id || 'POST-1',
                                postName: assignedPostName,
                                isFixedGuard: !!guard.fixedPostId,
                                fixedPostName: fixedPostObj?.name,
                              });
                              setEditingLocationId(locObj.id);
                              setEditingPostId(fixedPostObj?.id || locObj.posts[0]?.id || 'POST-1');
                            }}
                            className={`w-9 h-8 rounded border font-bold text-xs flex items-center justify-center mx-auto hover:scale-105 transition cursor-pointer ${cellClass}`}
                          >
                            {cellText}
                          </button>
                        </td>
                      );
                    })}

                    <td className="p-3 text-right pr-4 truncate max-w-[170px]">
                      {guard.fixedPostId && fixedPostObj ? (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-end gap-1">
                          <Lock className="w-3 h-3" /> {fixedPostObj.name.split(' ')[0]} 🔒
                        </span>
                      ) : (
                        <span className="text-purple-400 font-bold text-[11px] flex items-center justify-end gap-1">
                          <RotateCw className="w-3 h-3" /> Rotating 🔁
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
