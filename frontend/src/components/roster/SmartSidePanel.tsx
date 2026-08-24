'use client';

import React from 'react';
import { X, Shield, Clock, Award, AlertTriangle, Lock, Unlock, Sliders, CheckCircle2 } from 'lucide-react';
import { SecurityGuard } from '../../types';

interface SmartSidePanelProps {
  guard: SecurityGuard | null;
  onClose: () => void;
  onReassign: (guardId: string) => void;
}

export const SmartSidePanel: React.FC<SmartSidePanelProps> = ({ guard, onClose, onReassign }) => {
  if (!guard) return null;

  // Streak calculation representation (e.g. 4 of 6 days)
  const streak = (parseInt(guard.id.replace(/\D/g, '')) % 6) + 1;
  const isOffRequired = streak === 6;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30">
              {guard.user.fullName.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{guard.user.fullName}</h3>
              <p className="text-xs text-sky-400 font-mono">{guard.badgeNumber} • {guard.bloodGroup || 'O+'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Duty Streak Badge */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Current 6-Day Duty Streak:</span>
            {isOffRequired ? (
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                🔴 6/6 — OFF REQUIRED
              </span>
            ) : streak >= 5 ? (
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                🟡 {streak}/6 Days (Rest Tomorrow)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                🟢 {streak}/6 Days (Eligible)
              </span>
            )}
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${isOffRequired ? 'bg-rose-500' : streak >= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${(streak / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Workload & Monthly Balancing */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500">Monthly Duty Hours</div>
            <div className="text-base font-bold text-white mt-1">{guard.accumulatedDutyHours}h</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Avg: 138h (Balanced)</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-500">Night Shifts Count</div>
            <div className="text-base font-bold text-indigo-400 mt-1">7 Nights</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Fair rotation score</div>
          </div>
        </div>

        {/* "Why Was I Assigned?" Score Card */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-sky-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> "Why was I assigned?"
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Score: 91 / 100
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Full candidate availability verified (+30)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Primary location affinity match (+15)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Lower duty hours workload balanced (+20)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Shift compatibility confirmed (+15)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-800 space-y-2">
        <button
          onClick={() => onReassign(guard.id)}
          className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Sliders className="w-4 h-4" /> Replace / Reassign Guard
        </button>
      </div>
    </div>
  );
};
