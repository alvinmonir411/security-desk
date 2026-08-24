'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, AlertTriangle } from 'lucide-react';
import { useRoster, SystemLocation, SystemPost } from '../../context/RosterContext';

interface AssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetLocation: SystemLocation | null;
  targetPost: SystemPost | null;
  targetShift: 'DAY' | 'NIGHT';
}

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({
  isOpen,
  onClose,
  targetLocation,
  targetPost,
  targetShift,
}) => {
  const { guards, assignments, currentDate, calculateScore, assignGuardToPost } = useRoster();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterNight, setFilterNight] = useState(targetShift === 'NIGHT');
  const [filterNearby, setFilterNearby] = useState(false);
  const [filterLowHours, setFilterLowHours] = useState(false);
  const [filterRotatingOnly, setFilterRotatingOnly] = useState(true);
  const [includeFixed, setIncludeFixed] = useState(false);

  const assignedGuardIdsToday = useMemo(() => {
    return new Set(
      assignments.filter((a) => a.date === currentDate && a.status === 'confirmed').map((a) => a.guardId)
    );
  }, [assignments, currentDate]);

  const scoredGuards = useMemo(() => {
    if (!targetLocation || !targetPost) return [];

    let available = guards.filter(
      (g) => g.status === 'ACTIVE' && g.dutyStreak < 6 && !assignedGuardIdsToday.has(g.id)
    );

    // Fixed vs Rotating filtering per Spec
    if (filterRotatingOnly && !includeFixed) {
      // Show Rotating guards OR guards whose home fixed post is this exact target post
      available = available.filter((g) => g.fixedPostId === null || g.fixedPostId === targetPost.id);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      available = available.filter(
        (g) => g.name.toLowerCase().includes(q) || g.badgeNumber.toLowerCase().includes(q)
      );
    }

    // Filter Chips
    if (filterNearby) {
      available = available.filter((g) => g.defaultLocationId === targetLocation.id);
    }
    if (filterLowHours) {
      available = available.filter((g) => g.weeklyHours <= 36);
    }

    // Calculate exact 3-level score per candidate
    return available
      .map((g) => ({
        guard: g,
        score: calculateScore(g, targetLocation, targetPost, targetShift),
        isFixedToThisPost: g.fixedPostId === targetPost.id,
        isFixedElsewhere: g.fixedPostId !== null && g.fixedPostId !== targetPost.id,
      }))
      .sort((a, b) => b.score - a.score);
  }, [
    guards,
    targetLocation,
    targetPost,
    targetShift,
    assignedGuardIdsToday,
    searchQuery,
    filterNearby,
    filterLowHours,
    filterRotatingOnly,
    includeFixed,
    calculateScore,
  ]);

  if (!isOpen || !targetLocation || !targetPost) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between">
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {/* Header per Spec */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ASSIGN TO: {targetPost.name} — {targetShift}
            </h3>
            <p className="text-xs text-sky-400 font-semibold mt-0.5">
              {targetLocation.name} ({targetPost.postType} Post)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="🔍 Search guards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-sky-500"
          />
        </div>

        {/* Filter Chips per Spec */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Filters:</span>
          <button
            onClick={() => setFilterNight(!filterNight)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
              filterNight ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            [Night]
          </button>
          <button
            onClick={() => setFilterNearby(!filterNearby)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
              filterNearby ? 'bg-sky-950 text-sky-300 border border-sky-700' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            [Nearby]
          </button>
          <button
            onClick={() => setFilterLowHours(!filterLowHours)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
              filterLowHours ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            [Low Hours]
          </button>
          <button
            onClick={() => {
              setFilterRotatingOnly(!filterRotatingOnly);
              if (includeFixed) setIncludeFixed(false);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
              filterRotatingOnly && !includeFixed ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            [Rotating Only]
          </button>
          <button
            onClick={() => {
              setIncludeFixed(!includeFixed);
              if (!includeFixed) setFilterRotatingOnly(false);
            }}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
              includeFixed ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            [Include Fixed]
          </button>
        </div>

        {includeFixed && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Warning: Pulling guards fixed to other posts will create manpower shortages at their home posts.</span>
          </div>
        )}

        {/* Recommended List per Spec */}
        <div className="pt-2 space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            RECOMMENDED CANDIDATES ({scoredGuards.length})
          </div>

          {scoredGuards.slice(0, 15).map((item, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤';
            const { guard, score, isFixedToThisPost, isFixedElsewhere } = item;

            return (
              <div
                key={guard.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-sky-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{medal}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <span>{guard.name}</span>
                        {isFixedToThisPost ? (
                          <span className="text-[10px] text-emerald-400 font-bold">🔒 Home Post</span>
                        ) : isFixedElsewhere ? (
                          <span className="text-[10px] text-amber-400 font-bold">🔒 Fixed Elsewhere</span>
                        ) : (
                          <span className="text-[10px] text-purple-400 font-bold">🔁 Rotating</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{guard.badgeNumber}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Score:{score}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-1 pt-1 border-t border-slate-900">
                  <div>Duty: <strong className="text-slate-200">{guard.dutyStreak}/6</strong></div>
                  <div>Hours: <strong className="text-slate-200">{guard.weeklyHours}h</strong></div>
                  <div>Night: <strong className="text-slate-200">{guard.nightCountThisWeek}</strong></div>
                  <div>Location: <strong className={guard.defaultLocationId === targetLocation.id ? 'text-emerald-400' : 'text-slate-500'}>{guard.defaultLocationId === targetLocation.id ? '✓ Match' : 'Other'}</strong></div>
                </div>

                <button
                  onClick={() => {
                    assignGuardToPost(guard.id, targetLocation.id, targetPost.id, targetShift);
                  }}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition mt-1 shadow"
                >
                  [ Assign ]
                </button>
              </div>
            );
          })}

          {scoredGuards.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No eligible available guards match this search filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
