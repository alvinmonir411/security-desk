'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const RosterHealthPage: React.FC = () => {
  const { kpi, currentDate, autoFixAll, showToast } = useRoster();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (s: string) => {
    setExpandedSection(expandedSection === s ? null : s);
  };

  const highStreakGuards = [
    { name: 'Md. Rafiqul Islam', badge: 'G-014', streak: '5/6 Days', location: 'Main Factory' },
    { name: 'Md. Delwar Hossain', badge: 'G-032', streak: '5/6 Days', location: 'Main Factory' },
    { name: 'Md. Farhad Rahman', badge: 'G-058', streak: '5/6 Days', location: 'Central Warehouse' },
  ];

  const nightImbalanceGuards = [
    { name: 'Md. Kamal Hossain', badge: 'G-008', nights: '6 Nights this week', location: 'Chemical Depot' },
    { name: 'Kazi Mominul Haque', badge: 'G-022', nights: '5 Nights this week', location: 'Main Factory' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">ROSTER HEALTH & VALIDATION CENTER</h2>
          <p className="text-xs text-slate-400 mt-0.5">Pre-publication compliance audit for {currentDate}</p>
        </div>
        <button
          onClick={() => {
            autoFixAll();
            showToast('Auto-fixed all resolvable issues!');
          }}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg"
        >
          <Sparkles className="w-4 h-4" /> [ Fix All Auto-Fixable Issues ]
        </button>
      </div>

      {/* Validation Checks per Spec */}
      <div className="space-y-3">
        {/* Manpower Coverage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base">🟢</span>
            <span className="text-xs font-bold text-slate-200">Manpower Coverage</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {kpi.assigned} / {kpi.required}
          </span>
        </div>

        {/* No Leave Conflicts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base">🟢</span>
            <span className="text-xs font-bold text-slate-200">No Leave Conflicts</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">0 issues</span>
        </div>

        {/* No Duplicate Assignments */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base">🟢</span>
            <span className="text-xs font-bold text-slate-200">No Duplicate Assignments</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">0 issues</span>
        </div>

        {/* No OFF-Day Conflicts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base">🟢</span>
            <span className="text-xs font-bold text-slate-200">No OFF-Day Conflicts</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">0 issues</span>
        </div>

        {/* High Duty Streak (Warning) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base">🟡</span>
              <div>
                <span className="text-xs font-bold text-slate-200">High Duty Streak</span>
                <span className="text-[11px] text-amber-400 ml-2 font-medium">3 guards approaching scheduled off</span>
              </div>
            </div>
            <button
              onClick={() => toggleSection('streak')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              [ View ] {expandedSection === 'streak' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedSection === 'streak' && (
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-2 text-xs">
              {highStreakGuards.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span>{g.name} ({g.badge}) — <strong>{g.streak}</strong> ({g.location})</span>
                  <button
                    onClick={() => showToast(`Suggested relief scheduled for ${g.name}`)}
                    className="text-sky-400 hover:text-sky-300 font-bold"
                  >
                    [Fix]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Night Shift Imbalance (Warning) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base">🟡</span>
              <div>
                <span className="text-xs font-bold text-slate-200">Night Shift Imbalance</span>
                <span className="text-[11px] text-amber-400 ml-2 font-medium">2 guards with excess night loads</span>
              </div>
            </div>
            <button
              onClick={() => toggleSection('night')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              [ View ] {expandedSection === 'night' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedSection === 'night' && (
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-2 text-xs">
              {nightImbalanceGuards.map((g, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span>{g.name} ({g.badge}) — <strong>{g.nights}</strong> ({g.location})</span>
                  <button
                    onClick={() => showToast(`Rotated night shift for ${g.name}`)}
                    className="text-sky-400 hover:text-sky-300 font-bold"
                  >
                    [Fix]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manpower Shortage */}
        <div className={`border rounded-xl p-4 flex items-center justify-between ${
          kpi.shortage > 0 ? 'bg-rose-950/40 border-rose-800' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-base">{kpi.shortage > 0 ? '🔴' : '🟢'}</span>
            <span className="text-xs font-bold text-slate-200">Manpower Shortage</span>
          </div>
          <span className={`text-xs font-bold ${kpi.shortage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {kpi.shortage} issues
          </span>
        </div>
      </div>
    </div>
  );
};
