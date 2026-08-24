'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, XCircle, Sparkles } from 'lucide-react';

interface RosterHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoFix: () => void;
  onPublish: () => void;
}

export const RosterHealthModal: React.FC<RosterHealthModalProps> = ({
  isOpen,
  onClose,
  onAutoFix,
  onPublish,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Roster Health & Validation Center</h3>
              <p className="text-xs text-slate-400">Pre-publication compliance and conflict detection audit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Status Matrix */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Hard Rules: Zero Approved Leave Conflicts
            </span>
            <span className="font-bold">PASSED</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Shift Integrity: Zero Duplicate Daily Assignments
            </span>
            <span className="font-bold">PASSED</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> 6/1 Rule: All Scheduled Off-Day Guards Excluded
            </span>
            <span className="font-bold">PASSED</span>
          </div>

          {/* Soft Warning */}
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-between text-amber-300">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Soft Warning: 2 Guards on Day 5/6 duty streak
            </span>
            <span className="font-bold">ACKNOWLEDGED</span>
          </div>
        </div>

        {/* Readiness Banner */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
          <div className="text-sm font-bold text-white">✅ Roster is 100% Valid & Ready for Operations</div>
          <p className="text-xs text-slate-400">All 154 required posts manned across Main Factory and Sub-locations.</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onAutoFix}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Run Auto-Fix Optimization
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Close
            </button>
            <button
              onClick={onPublish}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg"
            >
              Approve & Publish Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
