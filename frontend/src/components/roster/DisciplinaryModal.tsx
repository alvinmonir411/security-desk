'use client';

import React, { useState, useEffect } from 'react';
import { GuardProfile } from '../../context/RosterContext';
import {
  X,
  AlertTriangle,
  UserX,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface DisciplinaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  guard: GuardProfile | null;
  currentRole: string;
  onApplyAction: (params: {
    guardId: string;
    actionType: 'ABSENT' | 'SUSPENDED' | 'WARNING' | 'ACTIVE';
    durationDays?: number;
    startDate?: string;
    endDate?: string;
    reason: string;
  }) => Promise<void>;
}

export const DisciplinaryModal: React.FC<DisciplinaryModalProps> = ({
  isOpen,
  onClose,
  guard,
  currentRole,
  onApplyAction,
}) => {
  const [activeAction, setActiveAction] = useState<'ABSENT' | 'SUSPENDED' | 'WARNING' | 'ACTIVE'>('ABSENT');
  
  // Absence Options
  const [absentDurationMode, setAbsentDurationMode] = useState<'TODAY' | '3_DAYS' | '5_DAYS' | '7_DAYS' | 'CUSTOM'>('TODAY');
  const [absentStartDate, setAbsentStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [absentEndDate, setAbsentEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [absentReasonPreset, setAbsentReasonPreset] = useState('Unexcused Absence / AWOL (অনুমতি ছাড়া অনুপস্থিত)');
  const [absentCustomReason, setAbsentCustomReason] = useState('');

  // Suspension Options
  const [suspensionDuration, setSuspensionDuration] = useState<number>(7);
  const [suspensionReasonPreset, setSuspensionReasonPreset] = useState('Sleeping during duty shift (ডিউটিতে ঘুমানো)');
  const [suspensionCustomReason, setSuspensionCustomReason] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(false);

  // Warning Options
  const [warningLevel, setWarningLevel] = useState<'VERBAL' | 'WRITTEN' | 'FINAL'>('WRITTEN');
  const [warningNotes, setWarningNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (guard) {
      if (guard.status === 'SUSPENDED') {
        setActiveAction('ACTIVE');
      } else if (guard.status === 'ABSENT') {
        setActiveAction('ACTIVE');
      } else {
        setActiveAction('ABSENT');
      }
    }
  }, [guard]);

  if (!isOpen || !guard) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeAction === 'ABSENT') {
        let days = 1;
        let start = absentStartDate;
        let end = absentEndDate;

        if (absentDurationMode === 'TODAY') {
          days = 1;
          const today = new Date().toISOString().split('T')[0];
          start = today;
          end = today;
        } else if (absentDurationMode === '3_DAYS') {
          days = 3;
          const s = new Date();
          const e = new Date();
          e.setDate(s.getDate() + 2);
          start = s.toISOString().split('T')[0];
          end = e.toISOString().split('T')[0];
        } else if (absentDurationMode === '5_DAYS') {
          days = 5;
          const s = new Date();
          const e = new Date();
          e.setDate(s.getDate() + 4);
          start = s.toISOString().split('T')[0];
          end = e.toISOString().split('T')[0];
        } else if (absentDurationMode === '7_DAYS') {
          days = 7;
          const s = new Date();
          const e = new Date();
          e.setDate(s.getDate() + 6);
          start = s.toISOString().split('T')[0];
          end = e.toISOString().split('T')[0];
        }

        const reason = absentCustomReason.trim()
          ? `${absentReasonPreset} - ${absentCustomReason}`
          : absentReasonPreset;

        await onApplyAction({
          guardId: guard.id,
          actionType: 'ABSENT',
          durationDays: days,
          startDate: start,
          endDate: end,
          reason,
        });
      } else if (activeAction === 'SUSPENDED') {
        const reason = suspensionCustomReason.trim()
          ? `${suspensionReasonPreset} - ${suspensionCustomReason}`
          : suspensionReasonPreset;

        await onApplyAction({
          guardId: guard.id,
          actionType: 'SUSPENDED',
          durationDays: isIndefinite ? 90 : suspensionDuration,
          reason,
        });
      } else if (activeAction === 'WARNING') {
        const reason = `[${warningLevel} WARNING] ${warningNotes.trim() || 'Disciplinary violation noted'}`;
        await onApplyAction({
          guardId: guard.id,
          actionType: 'WARNING',
          reason,
        });
      } else if (activeAction === 'ACTIVE') {
        await onApplyAction({
          guardId: guard.id,
          actionType: 'ACTIVE',
          reason: 'Reinstated / Cleared by Management',
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Guard Avatar */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-sm shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{guard.name}</h3>
                <span className="font-mono text-sky-400 font-bold bg-sky-950/80 border border-sky-800/80 px-2 py-0.5 rounded text-xs">
                  {guard.badgeNumber}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Phone: {guard.phone}</span>
                <span>•</span>
                <span>
                  Current Status:{' '}
                  <strong
                    className={
                      guard.status === 'ABSENT'
                        ? 'text-rose-400'
                        : guard.status === 'SUSPENDED'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {guard.status}
                  </strong>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Disciplinary Alert Banner if Suspended or Absent */}
        {(guard.status === 'SUSPENDED' || guard.status === 'ABSENT' || guard.disciplinaryNote) && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-xs space-y-1">
            <div className="font-black text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" /> Active Disciplinary Notice on Record
            </div>
            {guard.disciplinaryNote && (
              <p className="text-slate-300 text-[11px] leading-relaxed">{guard.disciplinaryNote}</p>
            )}
            {guard.suspensionEndDate && (
              <div className="text-[11px] text-amber-300 font-semibold pt-1">
                ⏳ Suspension Active Until: <strong>{guard.suspensionEndDate}</strong>
              </div>
            )}
          </div>
        )}

        {/* Action Tabs Selector */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveAction('ABSENT')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
              activeAction === 'ABSENT'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span className="text-[11px]">Mark Absent</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('SUSPENDED')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
              activeAction === 'SUSPENDED'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[11px]">Suspend</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('WARNING')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
              activeAction === 'WARNING'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[11px]">Log Warning</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAction('ACTIVE')}
            className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition cursor-pointer ${
              activeAction === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px]">Make Active</span>
          </button>
        </div>

        {/* Dynamic Form Content Based on Selected Tab */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. ABSENT TAB FORM */}
          {activeAction === 'ABSENT' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  📅 Absence Duration / কয়দিনের অনুপস্থিত?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'TODAY', label: '1 Day (Today)' },
                    { id: '3_DAYS', label: '3 Days' },
                    { id: '5_DAYS', label: '5 Days' },
                    { id: '7_DAYS', label: '7 Days' },
                    { id: 'CUSTOM', label: 'Custom Date' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setAbsentDurationMode(btn.id as any)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition ${
                        absentDurationMode === btn.id
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {absentDurationMode === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">From Date</label>
                    <input
                      type="date"
                      value={absentStartDate}
                      onChange={(e) => setAbsentStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">To Date</label>
                    <input
                      type="date"
                      value={absentEndDate}
                      onChange={(e) => setAbsentEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  ⚠️ Primary Reason / কারণ
                </label>
                <select
                  value={absentReasonPreset}
                  onChange={(e) => setAbsentReasonPreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500 font-medium"
                >
                  <option value="Unexcused Absence / AWOL (অনুমতি ছাড়া অনুপস্থিত)">Unexcused Absence / AWOL (অনুমতি ছাড়া অনুপস্থিত)</option>
                  <option value="Emergency Medical / Sudden Illness (জরুরি অসুস্থতা)">Emergency Medical / Sudden Illness (জরুরি অসুস্থতা)</option>
                  <option value="Family / Personal Emergency (পারিবারিক জরুরি বিষয়)">Family / Personal Emergency (পারিবারিক জরুরি বিষয়)</option>
                  <option value="Severe Weather / Commute Delay (যাতায়াত সমস্যা)">Severe Weather / Commute Delay (যাতায়াত সমস্যা)</option>
                  <option value="Other Unexcused Reason (অন্যান্য)">Other Unexcused Reason (অন্যান্য)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  📝 Specific Incident Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={absentCustomReason}
                  onChange={(e) => setAbsentCustomReason(e.target.value)}
                  placeholder="e.g. Guard did not report to Shift Supervisor at 06:00 AM..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Operational Consequence:
                </span>
                <p>Today's duty slot will be vacated. The slot will show shortage on Master Roster for standby reliever or Overtime (OT) deployment.</p>
              </div>
            </div>
          )}

          {/* 2. SUSPENDED TAB FORM */}
          {activeAction === 'SUSPENDED' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  ⏳ Suspension Duration / কতদিনের বরখাস্ত?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { days: 3, label: '3 Days' },
                    { days: 7, label: '7 Days' },
                    { days: 14, label: '14 Days' },
                    { days: 30, label: '30 Days' },
                    { days: 90, label: 'Indefinite' },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => {
                        setSuspensionDuration(item.days);
                        setIsIndefinite(item.days === 90);
                      }}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition ${
                        suspensionDuration === item.days
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  🚨 Violation Offense / কি কারণে সাসপেন্ড?
                </label>
                <select
                  value={suspensionReasonPreset}
                  onChange={(e) => setSuspensionReasonPreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Sleeping during duty shift (ডিউটিতে ঘুমানো)">Sleeping during duty shift (ডিউটিতে ঘুমানো)</option>
                  <option value="Unauthorized post abandonment / AWOL (পোস্ট ছেড়ে চলে যাওয়া)">Unauthorized post abandonment / AWOL (পোস্ট ছেড়ে চলে যাওয়া)</option>
                  <option value="Insubordination / Disrespect to Supervisor (উদ্ধত আচরণ)">Insubordination / Disrespect to Supervisor (উদ্ধত আচরণ)</option>
                  <option value="Uniform / Equipment Violation (ইউনিফর্ম ও সরঞ্জাম কোড লঙ্ঘন)">Uniform / Equipment Violation (ইউনিফর্ম ও সরঞ্জাম কোড লঙ্ঘন)</option>
                  <option value="Security Checkpoint Breach / Negligence (নিরাপত্তা প্রটোকল লঙ্ঘন)">Security Checkpoint Breach / Negligence (নিরাপত্তা প্রটোকল লঙ্ঘন)</option>
                  <option value="Site Dispute / Physical Altercation (মারামারি বা বিশৃঙ্খলা)">Site Dispute / Physical Altercation (মারামারি বা বিশৃঙ্খলা)</option>
                  <option value="Other Major Disciplinary Offense (অন্যান্য)">Other Major Disciplinary Offense (অন্যান্য)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  📜 Official Inquiry Notes & Evidence
                </label>
                <textarea
                  rows={2}
                  value={suspensionCustomReason}
                  onChange={(e) => setSuspensionCustomReason(e.target.value)}
                  placeholder="e.g. Found asleep at Warehouse Gate 2 during 03:00 AM round by Supervisor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-2xl text-[11px] text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Administrative Action:
                </span>
                <p>Guard is de-listed from daily rosters during this period. Guard status becomes <strong>SUSPENDED</strong>. Management can reinstate anytime.</p>
              </div>
            </div>
          )}

          {/* 3. WARNING TAB FORM */}
          {activeAction === 'WARNING' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  📝 Warning Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'VERBAL', label: '1st Verbal Notice' },
                    { id: 'WRITTEN', label: 'Formal Written Warning' },
                    { id: 'FINAL', label: 'Final Warning Before Suspension' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWarningLevel(w.id as any)}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition ${
                        warningLevel === w.id
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  📋 Warning Reason & Performance Details
                </label>
                <textarea
                  rows={3}
                  value={warningNotes}
                  onChange={(e) => setWarningNotes(e.target.value)}
                  placeholder="e.g. Late arrival by 25 minutes at North Gate. Advised to maintain punctuality..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-[11px] text-slate-400">
                <span>ℹ️ Warning does not interrupt active duty but logs a permanent audit record on guard's profile for monthly performance evaluation.</span>
              </div>
            </div>
          )}

          {/* 4. ACTIVE / RESTORE TAB */}
          {activeAction === 'ACTIVE' && (
            <div className="p-5 bg-emerald-950/30 border border-emerald-800/60 rounded-3xl text-center space-y-3 animate-in fade-in duration-150">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-black text-white">Reclaim & Restore to Active Duty</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                This will clear any active suspension or absence locks on {guard.name} ({guard.badgeNumber}) and restore them into the normal active rotation and standby pool.
              </p>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50 ${
                activeAction === 'ABSENT'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : activeAction === 'SUSPENDED'
                  ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/20'
                  : activeAction === 'WARNING'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : activeAction === 'ABSENT' ? (
                <span>Confirm Mark Absent</span>
              ) : activeAction === 'SUSPENDED' ? (
                <span>Confirm Guard Suspension</span>
              ) : activeAction === 'WARNING' ? (
                <span>Save Official Warning</span>
              ) : (
                <span>Restore to Active Duty</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
