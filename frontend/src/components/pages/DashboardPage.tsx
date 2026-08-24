'use client';

import React from 'react';
import { useRoster } from '../../context/RosterContext';
import { Sparkles, Layers, ShieldCheck, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { kpi, locations, assignments, currentDate, setActiveNav, setSelectedLocationFilter } = useRoster();

  // Calculate per location stats for preview table dynamically
  const locationSummaries = locations.map((loc) => {
    const active = assignments.filter((a) => a.date === currentDate && a.locationId === loc.id && a.status === 'confirmed');
    let reqTotal = 0;
    loc.posts.forEach((p) => {
      reqTotal += p.requiredDay + p.requiredNight;
    });
    const assignedTotal = active.length;
    const shortage = Math.max(0, reqTotal - assignedTotal);

    return {
      id: loc.id,
      name: loc.name,
      required: reqTotal,
      assigned: assignedTotal,
      shortage,
      isFull: shortage === 0,
    };
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* 1. KPI Strip (5 Horizontal Boxes per Spec) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Daily Operational Force Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Workforce */}
          <div
            onClick={() => setActiveNav('guards')}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition"
          >
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Workforce</div>
            <div className="text-2xl font-black text-white mt-1">{kpi.workforce}</div>
            <div className="text-[10px] text-slate-500 mt-1">Active guards in force</div>
          </div>

          {/* Required */}
          <div
            onClick={() => setActiveNav('deployment')}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition"
          >
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Required</div>
            <div className="text-2xl font-black text-white mt-1">{kpi.required}</div>
            <div className="text-[10px] text-slate-500 mt-1">Day + Night posts</div>
          </div>

          {/* Assigned */}
          <div
            onClick={() => setActiveNav('deployment')}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition"
          >
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Assigned</div>
            <div className="text-2xl font-black text-sky-400 mt-1">{kpi.assigned}</div>
            <div className="text-[10px] text-emerald-400 mt-1">Confirmed on duty</div>
          </div>

          {/* Shortage */}
          <div
            onClick={() => {
              setSelectedLocationFilter('SHORTAGE');
              setActiveNav('deployment');
            }}
            className={`border rounded-xl p-4 cursor-pointer transition ${
              kpi.shortage > 0 ? 'bg-rose-950/40 border-rose-800/80 hover:border-rose-600' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] text-rose-400 font-semibold uppercase">Shortage</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{kpi.shortage}</div>
            <div className="text-[10px] text-rose-400/80 mt-1">
              {kpi.shortage > 0 ? 'Click to jump to slot' : '0 Shortage'}
            </div>
          </div>

          {/* Reserve */}
          <div
            onClick={() => {
              setSelectedLocationFilter('ALL');
              setActiveNav('deployment');
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition"
          >
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Reserve</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{kpi.reserve}</div>
            <div className="text-[10px] text-purple-400/80 mt-1">Standby available pool</div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setActiveNav('deployment')}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Layers className="w-4 h-4" /> [ Open Roster Maker ]
        </button>

        <button
          onClick={() => setActiveNav('matrix')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 text-sky-400" /> [ Guards & Duty Matrix ]
        </button>

        <button
          onClick={() => setActiveNav('reports')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-2 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> [ View Reports & Muster ]
        </button>
      </div>

      {/* 3. Deployment Summary (Mini Table Live Preview per Spec) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Deployment Summary (Live Preview)</h3>
          </div>
          <button
            onClick={() => setActiveNav('deployment')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            [ View Full Board → ]
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 font-semibold uppercase">
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">Required</th>
                <th className="py-2.5 px-3 text-center">Assigned</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {locationSummaries.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setActiveNav('deployment')}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="py-3 px-3 font-semibold text-slate-200">{row.name}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{row.required}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{row.assigned}</td>
                  <td className="py-3 px-3 text-right">
                    {row.isFull ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/60 text-[10px]">
                        🟢 FULL
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-800 text-[10px] animate-pulse">
                        🔴 SHORT {row.shortage}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
