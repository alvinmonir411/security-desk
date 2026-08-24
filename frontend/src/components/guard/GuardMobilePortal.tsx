'use client';

import React, { useState } from 'react';
import { Shield, Clock, MapPin, Calendar, AlertOctagon, CheckCircle2, User } from 'lucide-react';

export const GuardMobilePortal: React.FC = () => {
  const [checkedIn, setCheckedIn] = useState(true);
  const [sosTriggered, setSosTriggered] = useState(false);

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Guard Profile Hero */}
      <div className="bg-gradient-to-br from-sky-950 via-slate-900 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg">
              RI
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Md. Rafiqul Islam</h2>
              <p className="text-xs text-sky-400 font-mono">SEC-BD-1001 • A+ Positive</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Active Guard
          </span>
        </div>

        {/* Current Shift Card */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Current Assignment
            </span>
            <span className="text-amber-400 font-bold">DAY SHIFT (06:00 - 18:00)</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Main Factory — Gate 1 Visitor Turnstile</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Weekly Off:</span>
            <span className="text-purple-400 font-bold">Every Sunday (6+1 Cycle)</span>
          </div>
        </div>

        {/* Check-In Action Button */}
        <div className="mt-5">
          <button
            onClick={() => setCheckedIn(!checkedIn)}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
              checkedIn
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {checkedIn ? 'Checked In (05:54 AM) — Tap to Check Out' : 'Tap to Shift Check-In'}
          </button>
        </div>
      </div>

      {/* Emergency SOS Button */}
      <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 shadow-lg text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
          <AlertOctagon className="w-5 h-5" /> EMERGENCY PANIC TRIGGER
        </div>
        <p className="text-xs text-slate-400">
          Instantly triggers high-priority siren to Central SOC & Field Supervisor with GPS Coordinates.
        </p>
        <button
          onClick={() => setSosTriggered(!sosTriggered)}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition ${
            sosTriggered
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
          }`}
        >
          {sosTriggered ? '🚨 SOS ALARM BROADCASTED TO SOC' : 'BROADCAST EMERGENCY SOS'}
        </button>
      </div>
    </div>
  );
};
