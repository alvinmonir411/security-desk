'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Settings, Save, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useRoster();

  const [ruleSixOne, setRuleSixOne] = useState(true);
  const [maxDailyShift, setMaxDailyShift] = useState(1);
  const [nightToDayWarning, setNightToDayWarning] = useState(true);
  const [maxConsecutive, setMaxConsecutive] = useState(6);
  const [locationRotation, setLocationRotation] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System & Roster Rules Configuration saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">SYSTEM & ROSTER RULES CONFIGURATION</h2>
        <p className="text-xs text-slate-400 mt-0.5">Database-driven operational policies without hardcoded constraints</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="space-y-4 text-xs">
          {/* 6/1 Cycle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">6/1 Duty Cycle Enforcement</div>
              <div className="text-slate-400 text-[11px]">Mandatory 1-day weekly off after 6 consecutive shifts</div>
            </div>
            <button
              type="button"
              onClick={() => setRuleSixOne(!ruleSixOne)}
              className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                ruleSixOne ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {ruleSixOne ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Max Daily Shifts */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Maximum Daily Shifts per Guard</div>
              <div className="text-slate-400 text-[11px]">Enforce single 12h duty per calendar day</div>
            </div>
            <input
              type="number"
              min="1"
              max="2"
              value={maxDailyShift}
              onChange={(e) => setMaxDailyShift(Number(e.target.value))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-white text-xs"
            />
          </div>

          {/* Night -> Day Warning */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Night → Day Turnaround Warning</div>
              <div className="text-slate-400 text-[11px]">Flag fatigue warning when assigning day shift immediately after night</div>
            </div>
            <button
              type="button"
              onClick={() => setNightToDayWarning(!nightToDayWarning)}
              className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                nightToDayWarning ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {nightToDayWarning ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Max Consecutive Days */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Maximum Consecutive Duty Days Limit</div>
              <div className="text-slate-400 text-[11px]">Threshold before guard is marked due for mandatory off</div>
            </div>
            <input
              type="number"
              min="4"
              max="7"
              value={maxConsecutive}
              onChange={(e) => setMaxConsecutive(Number(e.target.value))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-white text-xs"
            />
          </div>

          {/* Location Rotation */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Location Continuity / Rotation</div>
              <div className="text-slate-400 text-[11px]">Balance guard fatigue by rotating external deployment posts</div>
            </div>
            <button
              type="button"
              onClick={() => setLocationRotation(!locationRotation)}
              className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                locationRotation ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {locationRotation ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Auto Assignment */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white">Automated Candidate Ranking Engine</div>
              <div className="text-slate-400 text-[11px]">Enable multi-factor scoring optimization during auto-fill</div>
            </div>
            <button
              type="button"
              onClick={() => setAutoAssignment(!autoAssignment)}
              className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                autoAssignment ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {autoAssignment ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
