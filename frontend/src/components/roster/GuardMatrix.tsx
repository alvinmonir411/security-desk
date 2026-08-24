'use client';

import React from 'react';
import { SecurityGuard } from '../../types';

interface GuardMatrixProps {
  guards: SecurityGuard[];
}

export const GuardMatrix: React.FC<GuardMatrixProps> = ({ guards }) => {
  const sampleDays = ['24 Aug (Mon)', '25 Aug (Tue)', '26 Aug (Wed)', '27 Aug (Thu)', '28 Aug (Fri)', '29 Aug (Sat)', '30 Aug (Sun)'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">7-Day Operational Duty Matrix (6 Duty + 1 Off)</h3>
          <p className="text-xs text-slate-400">Continuous timeline tracking for 200 force personnel</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> DAY (12h)
          </span>
          <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> NIGHT (12h)
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> OFF
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <th className="p-3 pl-4 font-semibold uppercase tracking-wider">Security Guard</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Badge #</th>
              {sampleDays.map((day, idx) => (
                <th key={idx} className="p-3 text-center font-semibold uppercase tracking-wider">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {guards.slice(0, 25).map((guard, idx) => {
              // Simulated deterministic 6 on 1 off pattern for visualization
              const offDayIndex = idx % 7;

              return (
                <tr key={guard.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 pl-4 font-medium text-slate-200">{guard.user.fullName}</td>
                  <td className="p-3 text-slate-400 font-mono">{guard.badgeNumber}</td>
                  {sampleDays.map((_, dayIdx) => {
                    const isOff = dayIdx === offDayIndex;
                    const isDay = (idx + dayIdx) % 2 === 0;

                    return (
                      <td key={dayIdx} className="p-3 text-center">
                        {isOff ? (
                          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700 text-[10px]">
                            🏖️ OFF
                          </span>
                        ) : isDay ? (
                          <span className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-800/60 text-[10px]">
                            ☀️ D (12h)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 font-bold border border-indigo-800/60 text-[10px]">
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
      <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/40 border-t border-slate-800">
        Displaying 25 of 200 Security Guards in timeline matrix.
      </div>
    </div>
  );
};
