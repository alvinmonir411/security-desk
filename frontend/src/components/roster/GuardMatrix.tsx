'use client';

import React from 'react';
import { SecurityGuard } from '../../types';

interface GuardMatrixProps {
  guards: SecurityGuard[];
}

export const GuardMatrix: React.FC<GuardMatrixProps> = ({ guards }) => {
  const sampleDays = [
    '24 Aug (Mon)',
    '25 Aug (Tue)',
    '26 Aug (Wed)',
    '27 Aug (Thu)',
    '28 Aug (Fri)',
    '29 Aug (Sat)',
    '30 Aug (Sun)',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">7-Day Operational Duty Matrix</h3>
          <p className="text-xs text-slate-400">
            🔄 Rotation: 6 Consecutive Days (D) ➔ 1 Off-Day ➔ 6 Consecutive Nights (N) ➔ 1 Off-Day
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-3 h-3 rounded bg-emerald-500"></span> DAY (12h)
          </span>
          <span className="inline-flex items-center gap-1.5 text-indigo-400 font-bold">
            <span className="w-3 h-3 rounded bg-indigo-500"></span> NIGHT (12h)
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-400 font-bold">
            <span className="w-3 h-3 rounded bg-slate-600"></span> OFF
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3.5 pl-4">Security Guard</th>
              <th className="p-3.5">Badge #</th>
              {sampleDays.map((day, idx) => (
                <th key={idx} className="p-3.5 text-center font-bold">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {guards.map((guard, idx) => {
              const offDayIndex = idx % 7;
              const baseStartsDay = idx % 2 === 0;

              return (
                <tr key={guard.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 pl-4 font-semibold text-slate-200">{guard.user.fullName}</td>
                  <td className="p-3 text-slate-400 font-mono">{guard.badgeNumber}</td>
                  {sampleDays.map((_, dayIdx) => {
                    const isOff = dayIdx === offDayIndex;
                    const isAfterOffDay = dayIdx > offDayIndex;

                    let currentShift: 'DAY' | 'NIGHT';
                    if (baseStartsDay) {
                      currentShift = isAfterOffDay ? 'NIGHT' : 'DAY';
                    } else {
                      currentShift = isAfterOffDay ? 'DAY' : 'NIGHT';
                    }

                    return (
                      <td key={dayIdx} className="p-2 text-center">
                        {isOff ? (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-bold border border-slate-700 text-[10px]">
                            🏖️ OFF
                          </span>
                        ) : currentShift === 'DAY' ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 font-black border border-emerald-700/80 text-[10px]">
                            ☀️ D (12h)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 text-indigo-300 font-black border border-indigo-700/80 text-[10px]">
                            🌙 N (12h)
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3.5 text-center text-xs text-slate-400 bg-slate-950/80 border-t border-slate-800">
        Displaying all {guards.length} Security Guards in full timeline matrix.
      </div>
    </div>
  );
};
