'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { Check, XCircle, AlertCircle, Calendar } from 'lucide-react';

export const LeaveAttendancePage: React.FC = () => {
  const { leaveRequests, approveLeave, rejectLeave } = useRoster();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = leaveRequests.filter((l) => l.status === activeTab);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Tabs Header per Spec */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">LEAVE & ATTENDANCE MANAGEMENT</h2>
          <p className="text-xs text-slate-400 mt-0.5">Approve requests to automatically exclude guards from roster</p>
        </div>

        <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'PENDING' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            [Pending Requests] ({leaveRequests.filter((l) => l.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'APPROVED' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            [Approved] ({leaveRequests.filter((l) => l.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'REJECTED' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            [Rejected] ({leaveRequests.filter((l) => l.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{req.guardName}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono text-[10px] font-bold">
                  {req.guardId}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {req.startDate} to {req.endDate}
                </span>
                <span>• Reason: <strong>{req.reason}</strong></span>
              </div>
              {req.rejectionReason && (
                <div className="text-[11px] text-rose-400 mt-1">
                  Rejection Reason: {req.rejectionReason}
                </div>
              )}
            </div>

            {req.status === 'PENDING' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => approveLeave(req.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow"
                >
                  <Check className="w-3.5 h-3.5" /> [ Approve ]
                </button>
                <button
                  onClick={() => {
                    setRejectReason('Operational manpower shortage at site');
                    setRejectingReqId(req.id);
                  }}
                  className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> [ Reject ]
                </button>
              </div>
            )}

            {req.status === 'APPROVED' && (
              <span className="px-3 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold text-xs rounded-full">
                ✓ Approved
              </span>
            )}

            {req.status === 'REJECTED' && (
              <span className="px-3 py-1 bg-rose-950/60 text-rose-400 border border-rose-800/60 font-bold text-xs rounded-full">
                ✗ Rejected
              </span>
            )}
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500">
            No leave applications found in {activeTab.toLowerCase()} status.
          </div>
        )}
      </div>

      {/* Reject Reason Modal Popup */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white">Specify Rejection Reason</h4>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500"
              placeholder="e.g. Critical deployment shortage during festival week..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rejectLeave(rejectingReqId, rejectReason);
                  setRejectingReqId(null);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-lg font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
