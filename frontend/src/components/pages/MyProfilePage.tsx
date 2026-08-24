'use client';
import React, { useMemo, useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { ShieldCheck, Save, UserRound } from 'lucide-react';

const fields = [['phone','Mobile number'],['address','Home address'],['email','Email address'],['emergencyContactName','Emergency contact name'],['emergencyContactRelation','Relationship'],['emergencyContactPhone','Emergency contact phone'],['medicalNotes','Medical note'],['bankName','Bank name'],['bankAccountNo','Bank account number'],['payrollId','Payroll ID'],['trainingCertifications','Training / certifications']] as const;
const entitlement = [{ key:'casual', label:'Casual Leave', total:14 },{ key:'sick', label:'Sick Leave', total:14 },{ key:'unpaid', label:'Unpaid Leave', total:36 },{ key:'earned', label:'Earned Leave', total:18 }];

export const MyProfilePage: React.FC = () => {
  const { currentUser, guards, locations, updateGuardProfile, showToast, leaveRequests, isLoading } = useRoster();
  const guard = useMemo(() => {
    return (
      guards.find(
        (g) =>
          g.id === currentUser?.id ||
          (currentUser?.name && g.name.toLowerCase() === currentUser.name.toLowerCase()) ||
          g.badgeNumber === 'G-001'
      ) ||
      guards[0] || {
        id: 'GUARD-001',
        name: currentUser?.name || 'Abdul Mahfuz Islam',
        badgeNumber: 'G-001',
        phone: '+880 1799-15165',
        nid: '199801452391',
        address: 'Sector 4, Uttara, Dhaka',
        joiningDate: '2024-09-01',
        bloodGroup: 'A+',
        defaultLocationId: locations[0]?.id || 'LOC-1',
        fixedPostId: null,
        status: 'ACTIVE' as const,
        dutyStreak: 4,
        weeklyHours: 48,
        monthlyHours: 160,
        nightCountThisWeek: 2,
        qualifications: ['Gate Security', 'CCTV Monitoring', 'Fire Safety'],
        designation: 'Senior Security Guard',
      }
    );
  }, [guards, currentUser, locations]);
  const [saving, setSaving] = useState(false);
  if (!guard) return <div className="text-slate-400 text-sm">Loading your profile…</div>;
  const used = leaveRequests.filter(l => (l.guardId === guard.id || l.guardName === guard.name) && l.status === 'APPROVED').reduce<Record<string,number>>((totals,l) => { const t = `${l.type} ${l.reason}`.toLowerCase(); const key = t.includes('sick') || t.includes('medical') ? 'sick' : t.includes('unpaid') ? 'unpaid' : t.includes('earned') || t.includes('annual') ? 'earned' : 'casual'; const days = Math.max(1, Math.round((new Date(l.endDate).getTime()-new Date(l.startDate).getTime()) / 86400000)+1); totals[key]=(totals[key]||0)+days; return totals; }, {});
  const location = locations.find(l => l.id === guard.defaultLocationId);
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 rounded-3xl p-7 text-white shadow-2xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
            <UserRound className="w-9 h-9 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{guard.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                🟢 {guard.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-sm text-sky-100 mt-0.5">
              {guard.designation || 'Senior Security Guard'} • Badge: <strong className="text-white font-mono">{guard.badgeNumber}</strong>
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3 text-right text-xs space-y-0.5">
          <div className="text-slate-400">Assigned Base:</div>
          <div className="font-bold text-sky-300">{location?.name || 'Central Facility'}</div>
        </div>
      </div>

      {/* Yearly Leave Balance */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <span>🏖️ My Yearly Leave Balance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Approved leave taken is automatically deducted from your annual quota.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {entitlement.map((item) => {
            const taken = used[item.key] || 0;
            const remaining = Math.max(0, item.total - taken);
            return (
              <div key={item.key} className="rounded-2xl bg-slate-950 border border-slate-800/80 p-4 space-y-1">
                <div className="text-xs text-slate-400 font-bold">{item.label}</div>
                <div className="text-2xl text-white font-black">
                  {remaining}
                  <span className="text-xs text-slate-500 font-normal"> / {item.total} days</span>
                </div>
                <div className="text-[11px] text-sky-400 font-medium">Used: {taken} days</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profile Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            const formData = new FormData(e.currentTarget);
            await updateGuardProfile(guard.id, Object.fromEntries(formData.entries()));
            showToast('✅ Your profile information has been saved successfully.');
          } catch (error) {
            showToast(error instanceof Error ? error.message : 'Profile update failed.');
          } finally {
            setSaving(false);
          }
        }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-7 shadow-xl"
      >
        {/* Section 1: Official Identity & Personal Information */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>🆔 Identity &amp; Contact Details</span>
            </h2>
            <p className="text-xs text-slate-400">Your official government and personal communication data.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs text-slate-300 font-bold">
              National ID (NID)
              <input
                name="nid"
                defaultValue={guard.nid || ''}
                placeholder="e.g. 199801452391"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-mono text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Mobile Phone Number
              <input
                name="phone"
                defaultValue={guard.phone || ''}
                placeholder="e.g. +880 1712-345678"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-mono text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Email Address
              <input
                name="email"
                type="email"
                defaultValue={guard.email || currentUser?.email || ''}
                placeholder="e.g. guard@shieldops.com"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Blood Group
              <input
                name="bloodGroup"
                defaultValue={guard.bloodGroup || 'A+'}
                placeholder="e.g. A+, B+, O+, AB+"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold sm:col-span-2">
              Present / Home Address
              <input
                name="address"
                defaultValue={guard.address || ''}
                placeholder="e.g. Sector 4, Uttara, Dhaka"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>
          </div>
        </section>

        {/* Section 2: Banking & Payroll Information */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <span>💳 Banking &amp; Salary Disbursement Details</span>
            </h2>
            <p className="text-xs text-slate-400">Used by Finance &amp; Accounts for direct salary and overtime deposit.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="text-xs text-slate-300 font-bold">
              Bank Name
              <input
                name="bankName"
                defaultValue={guard.bankName || ''}
                placeholder="e.g. Dutch-Bangla Bank / DBBL"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Bank Account Number
              <input
                name="bankAccountNo"
                defaultValue={guard.bankAccountNo || ''}
                placeholder="e.g. 102.120.45892"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-mono text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Payroll ID
              <input
                name="payrollId"
                defaultValue={guard.payrollId || guard.badgeNumber}
                placeholder="e.g. PAY-G-001"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-mono text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>
          </div>
        </section>

        {/* Section 3: Emergency Contact & Medical Info */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-black text-rose-400 flex items-center gap-2">
              <span>🚨 Emergency Contact &amp; Medical Record</span>
            </h2>
            <p className="text-xs text-slate-400">Critical for emergency response and medical care during duty hours.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="text-xs text-slate-300 font-bold">
              Emergency Contact Person
              <input
                name="emergencyContactName"
                defaultValue={guard.emergencyContactName || ''}
                placeholder="e.g. Begum Rokeya"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Relationship
              <input
                name="emergencyContactRelation"
                defaultValue={guard.emergencyContactRelation || 'Spouse / Family'}
                placeholder="e.g. Spouse / Brother / Father"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold">
              Emergency Contact Phone
              <input
                name="emergencyContactPhone"
                defaultValue={guard.emergencyContactPhone || ''}
                placeholder="e.g. +880 1812-998877"
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white font-mono text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>

            <label className="text-xs text-slate-300 font-bold sm:col-span-3">
              Medical &amp; Health Notes
              <input
                name="medicalNotes"
                defaultValue={guard.medicalNotes || 'Fit for full 12-hour day/night operational security shifts.'}
                placeholder="e.g. No chronic illness. Fit for heavy duty."
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
              />
            </label>
          </div>
        </section>

        {/* Section 4: Training & Certifications */}
        <section className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <span>🎖️ Training &amp; Security Certifications</span>
            </h2>
            <p className="text-xs text-slate-400">Your verified security skill sets, badges, and fire safety certifications.</p>
          </div>

          <label className="block text-xs text-slate-300 font-bold">
            Certifications &amp; Specialized Skills
            <input
              name="trainingCertifications"
              defaultValue={guard.trainingCertifications || guard.qualifications?.join(', ') || 'Gate Security, Access Control, Fire Safety, CCTV Operation'}
              placeholder="e.g. CCTV Level 2, Fire Fighting, First Aid, VIP Escort"
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-xs outline-none focus:border-sky-500 font-normal"
            />
          </label>
        </section>

        {/* Privacy Assurance Banner */}
        <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
          <span>
            <strong>Confidential Data Protection:</strong> You have full access to view and update your NID, banking, and medical records at any time. Only you and authorized HR/DGM administration can view these records.
          </span>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
