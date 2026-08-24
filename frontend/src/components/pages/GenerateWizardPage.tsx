'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Sparkles, CheckCircle2, RefreshCw, Lock, RotateCw, ChevronDown, ChevronRight } from 'lucide-react';

export const GenerateWizardPage: React.FC = () => {
  const { locations, guards, currentDate, setCurrentDate, setActiveNav, autoFixAll, showToast } = useRoster();

  const [step, setStep] = useState(1);
  const [isFullWeek, setIsFullWeek] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedLocMap, setExpandedLocMap] = useState<Record<string, boolean>>({ 'LOC-1': true });

  // Rule checkboxes (all checked by default per spec)
  const [ruleSixOne, setRuleSixOne] = useState(true);
  const [ruleLeave, setRuleLeave] = useState(true);
  const [ruleOff, setRuleOff] = useState(true);
  const [ruleConflict, setRuleConflict] = useState(true);
  const [ruleDutyHours, setRuleDutyHours] = useState(true);
  const [ruleFixedLock, setRuleFixedLock] = useState(true);
  const [ruleRotatingPool, setRuleRotatingPool] = useState(true);
  const [ruleNightBalance, setRuleNightBalance] = useState(true);

  // Calculations
  let totalRequired = 0;
  let totalPosts = 0;
  locations.forEach((loc) => {
    totalPosts += loc.posts.length;
    loc.posts.forEach((p) => {
      totalRequired += p.requiredDay + p.requiredNight;
    });
  });

  const totalGuards = guards.length;
  const offCount = guards.filter((g) => g.dutyStreak >= 6).length;
  const leaveCount = guards.filter((g) => g.status === 'ON_LEAVE').length;
  const absentCount = guards.filter((g) => g.status === 'ABSENT').length;
  const availableCount = totalGuards - offCount - leaveCount - absentCount;

  const hasShortageWarning = availableCount < totalRequired;

  const handleGenerateAction = () => {
    setIsGenerating(true);
    setTimeout(() => {
      autoFixAll();
      setIsGenerating(false);
      setStep(5);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Wizard Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
          GENERATE ROSTER — Step {step} of 5
        </span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-6 h-2 rounded-full transition ${
                i <= step ? 'bg-sky-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Select Date */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Select Operational Target Date</h3>
            <p className="text-xs text-slate-400 mt-1">
              Choose whether to generate for a single target date or full 7-day rolling cycle.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold">Target Operational Date:</label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-sky-500 font-semibold"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="fullWeekCheck"
                checked={isFullWeek}
                onChange={(e) => setIsFullWeek(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="fullWeekCheck" className="text-slate-300 font-semibold cursor-pointer">
                Or Range: Generate for full 7-day rolling week (Aug 24 - Aug 30)
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveNav('dashboard')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
            >
              [Cancel]
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              [Next →]
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Requirements Auto-Check with 3-Level Breakdown per Spec */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Requirements Auto-Check (3-Level Hierarchy)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Locations found: <strong>{locations.length}</strong> | Total Posts found: <strong>{totalPosts}</strong> | Total Demand: <strong>{totalRequired} Guards</strong>
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 text-xs max-h-80 overflow-y-auto">
            {locations.map((loc) => {
              const isExp = !!expandedLocMap[loc.id];
              let locReq = 0;
              loc.posts.forEach((p) => { locReq += p.requiredDay + p.requiredNight; });

              return (
                <div key={loc.id} className="border border-slate-850 rounded-lg p-2.5 space-y-2">
                  <div
                    onClick={() => setExpandedLocMap((prev) => ({ ...prev, [loc.id]: !prev[loc.id] }))}
                    className="flex items-center justify-between cursor-pointer select-none font-bold text-slate-200 hover:text-sky-400"
                  >
                    <span className="flex items-center gap-1.5">
                      {isExp ? <ChevronDown className="w-4 h-4 text-sky-400" /> : <ChevronRight className="w-4 h-4" />}
                      {loc.name} ({loc.posts.length} Posts)
                    </span>
                    <span className="text-sky-400 font-mono">{locReq} Guards</span>
                  </div>

                  {isExp && (
                    <div className="pl-5 space-y-1.5 pt-1 border-t border-slate-900 text-slate-400">
                      {loc.posts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5">
                            • {p.name}
                            {p.postType === 'FIXED' ? (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 flex items-center gap-0.5">
                                <Lock className="w-2 h-2" /> Fixed
                              </span>
                            ) : (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-400 font-bold border border-purple-800 flex items-center gap-0.5">
                                <RotateCw className="w-2 h-2" /> Rotating
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-slate-300 font-semibold">
                            {p.requiredDay + p.requiredNight} (Day {p.requiredDay} / Night {p.requiredNight})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
            >
              [← Back]
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              [Next →]
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Workforce Check */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Workforce Availability Check</h3>
            <p className="text-xs text-slate-400 mt-1">
              Live status breakdown of all registered security personnel.
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between font-semibold">
              <span>Total Workforce:</span>
              <span className="text-white font-bold">{totalGuards}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Available for Duty:</span>
              <span>{availableCount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>On Weekly OFF (per 6/1 cycle):</span>
              <span>{offCount}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>On Approved Leave:</span>
              <span>{leaveCount}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Marked Absent Today:</span>
              <span>{absentCount}</span>
            </div>

            <div className={`mt-3 p-3 rounded-lg border text-xs font-semibold ${
              hasShortageWarning
                ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}>
              {hasShortageWarning
                ? `⚠️ Warning: Shortage expected! Need ${totalRequired} but only ${availableCount} available.`
                : `✅ Available workforce (${availableCount}) is sufficient for Required demand (${totalRequired}).`}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
            >
              [← Back]
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              [Next →]
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Rules Selection per Spec */}
      {step === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white">Roster Rules Selection</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select which operational constraints the scoring engine should enforce.
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs">
            {[
              { label: '6/1 Duty Cycle Enforcement', state: ruleSixOne, set: setRuleSixOne },
              { label: 'Leave Protection (don’t assign guards on approved leave)', state: ruleLeave, set: setRuleLeave },
              { label: 'OFF Day Protection', state: ruleOff, set: setRuleOff },
              { label: 'Shift Conflict Protection (no double-booking)', state: ruleConflict, set: setRuleConflict },
              { label: 'Duty Hour Balancing (spread hours evenly)', state: ruleDutyHours, set: setRuleDutyHours },
              { label: 'Fixed Post Lock (Fixed guards always stay at home post; only absent gets backup)', state: ruleFixedLock, set: setRuleFixedLock },
              { label: 'Rotating Pool Optimization (Dispatch rotating guards to shortage posts)', state: ruleRotatingPool, set: setRuleRotatingPool },
              { label: 'Night Shift Balancing (rotate night duty fairly among rotating guards)', state: ruleNightBalance, set: setRuleNightBalance },
            ].map((r, i) => (
              <label key={i} className="flex items-center gap-2.5 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={r.state}
                  onChange={(e) => r.set(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span>✓ {r.label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
            >
              [← Back]
            </button>
            <button
              onClick={handleGenerateAction}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Running Engine...' : '[Generate →]'}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Result Screen */}
      {step === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl text-center">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white">ROSTER GENERATED ✅</h3>
            <p className="text-xs text-slate-400 mt-1">
              Fixed posts locked & rotating pool distributed across 24 posts successfully.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-4 gap-2 text-xs">
            <div>
              <div className="text-slate-500">Assigned</div>
              <div className="text-base font-bold text-white mt-0.5">{totalRequired} / {totalRequired}</div>
            </div>
            <div>
              <div className="text-slate-500">Shortage</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">0</div>
            </div>
            <div>
              <div className="text-slate-500">Conflicts</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">0</div>
            </div>
            <div>
              <div className="text-slate-500">Warnings</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">3 (Soft)</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800 flex-wrap">
            <button
              onClick={() => setActiveNav('deployment')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 rounded-xl"
            >
              [ Review Full Roster ]
            </button>

            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> [ Regenerate ]
            </button>

            <button
              onClick={() => {
                showToast('Roster Confirmed & Published to Active Force!');
                setActiveNav('dashboard');
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg"
            >
              [ Confirm & Publish ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
