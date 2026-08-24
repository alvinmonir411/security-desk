'use client';

import React from 'react';
import { Roster, Location } from '../../types';
import { Building2, Sun, Moon, AlertTriangle, CheckCircle, Sliders, Sparkles } from 'lucide-react';

interface DeploymentBoardProps {
  roster: Roster | null;
  locations: Location[];
  onOpenReassign: (guardId: string) => void;
  onSelectGuard: (guardId: string) => void;
  onAutoFixShortage: (locationId: string, shiftId: string) => void;
}

export const DeploymentBoard: React.FC<DeploymentBoardProps> = ({
  roster,
  locations,
  onOpenReassign,
  onSelectGuard,
  onAutoFixShortage,
}) => {
  if (!roster) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        No active roster generated for this date. Click <strong>Generate Roster</strong> above.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((loc) => {
          const locAssignments = roster.assignments.filter((a) => a.locationId === loc.id);
          const dayGuards = locAssignments.filter((a) => a.shift.name === 'DAY');
          const nightGuards = locAssignments.filter((a) => a.shift.name === 'NIGHT');

          return (
            <div
              key={loc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition"
            >
              {/* Location Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{loc.name}</h3>
                    <p className="text-xs text-slate-400">{loc.type} • {loc.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                    Total Assigned: {locAssignments.length}
                  </span>
                </div>
              </div>

              {/* Day & Night Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Day Shift */}
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-3 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-400" /> DAY SHIFT (12H)
                    </span>
                    <span className="text-slate-400">{dayGuards.length} Guards</span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {dayGuards.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => onSelectGuard(a.guardId)}
                        className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800 text-xs hover:border-sky-500/40 hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                            {a.guard.user.fullName.substring(0, 2)}
                          </div>
                          <div className="truncate">
                            <div className="font-medium text-slate-200 truncate">{a.guard.user.fullName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span>{a.guard.badgeNumber}</span>
                              <span className="text-emerald-400 font-semibold">🟢 4/6</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReassign(a.guardId);
                          }}
                          className="p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition"
                          title="Reassign guard"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {dayGuards.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-600">No day guards assigned</div>
                    )}
                  </div>
                </div>

                {/* Night Shift */}
                <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-3 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-indigo-400" /> NIGHT SHIFT (12H)
                    </span>
                    <span className="text-slate-400">{nightGuards.length} Guards</span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {nightGuards.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => onSelectGuard(a.guardId)}
                        className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800 text-xs hover:border-indigo-500/40 hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                            {a.guard.user.fullName.substring(0, 2)}
                          </div>
                          <div className="truncate">
                            <div className="font-medium text-slate-200 truncate">{a.guard.user.fullName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span>{a.guard.badgeNumber}</span>
                              <span className="text-emerald-400 font-semibold">🟢 3/6</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReassign(a.guardId);
                          }}
                          className="p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition"
                          title="Reassign guard"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {nightGuards.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-600">No night guards assigned</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
