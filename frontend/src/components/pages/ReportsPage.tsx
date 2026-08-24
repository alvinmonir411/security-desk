'use client';

import React, { useState } from 'react';
import { useRoster } from '../../context/RosterContext';
import { FileSpreadsheet, FileText, Printer, Building2, Calendar, Shield } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { locations, assignments, guards, currentDate, showToast } = useRoster();

  const [startDate, setStartDate] = useState('2026-08-24');
  const [endDate, setEndDate] = useState('2026-08-30');
  const [reportType, setReportType] = useState('DAILY_MUSTER_ROLL');
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const handleExport = (format: 'PDF' | 'EXCEL') => {
    if (format === 'PDF') {
      setIsPrintPreviewOpen(true);
    } else {
      // Generate CSV/Excel download
      const rows = [
        ['Location', 'Post Name', 'Shift', 'Guard Name', 'Badge Number', 'Post Type', 'Date'],
      ];

      assignments.forEach((asg) => {
        const guard = guards.find((g) => g.id === asg.guardId);
        const loc = locations.find((l) => l.id === asg.locationId);
        const post = loc?.posts.find((p) => p.id === asg.postId);
        rows.push([
          loc?.name || '',
          post?.name || '',
          asg.shift,
          guard?.name || '',
          guard?.badgeNumber || '',
          post?.postType || 'ROTATING',
          asg.date,
        ]);
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Security_Roster_${currentDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Roster exported as CSV/Excel successfully!`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">OPERATIONAL REPORTS & PRINT CENTER</h2>
          <p className="text-xs text-slate-400 mt-0.5">View, print, and export official company security muster rolls</p>
        </div>
        <button
          onClick={() => setIsPrintPreviewOpen(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
        >
          <Printer className="w-4 h-4" /> [ 🖨️ Print Daily Roster ]
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-sky-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-sky-500 font-semibold"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-400 mb-1.5 font-semibold">Select Report Document:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-sky-500 font-semibold cursor-pointer"
          >
            <option value="DAILY_MUSTER_ROLL">Official Daily Deployment Muster Roll (All Posts)</option>
            <option value="DUTY_HOURS">Duty Hours & Workload Balance Report</option>
            <option value="LOCATION_COVERAGE">Location Deployment & Shortage Audit</option>
            <option value="OVERTIME">Overtime & Reliever Compensation Sheet</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => handleExport('PDF')}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
          >
            <FileText className="w-4 h-4 text-rose-400" /> [ View & Print PDF Roster ]
          </button>
          <button
            onClick={() => handleExport('EXCEL')}
            className="flex-1 py-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> [ Download Excel / CSV ]
          </button>
        </div>
      </div>

      {/* Official A4 Print / PDF Preview Modal */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 space-y-6 shadow-2xl my-8">
            {/* Print Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-wider uppercase">SHIELDOPS WORKFORCE MANAGEMENT</h1>
                  <p className="text-xs text-slate-600 font-bold">OFFICIAL SECURITY DEPLOYMENT MUSTER ROLL</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-slate-900">DATE: {currentDate}</div>
                <div className="text-slate-500">PRINTED: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Force Statistics Summary Strip */}
            <div className="grid grid-cols-4 gap-2 bg-slate-100 p-3 rounded-lg text-center text-xs font-bold border border-slate-300">
              <div>Total Force: <span className="text-slate-900">{guards.length}</span></div>
              <div>Required Posts: <span className="text-slate-900">160</span></div>
              <div>Assigned: <span className="text-emerald-700">{assignments.length}</span></div>
              <div>Shortage: <span className="text-rose-700">{Math.max(0, 160 - assignments.length)}</span></div>
            </div>

            {/* Roster Table per Location & Post */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {locations.map((loc) => (
                <div key={loc.id} className="border border-slate-300 rounded-lg overflow-hidden">
                  <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-xs flex justify-between">
                    <span>{loc.name}</span>
                    <span className="font-normal text-[11px] text-slate-300">Supervisor: {loc.supervisorName}</span>
                  </div>

                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-200 text-slate-700 border-b border-slate-300 font-bold">
                        <th className="p-2 w-1/3">Post Name</th>
                        <th className="p-2 w-1/3">Day Shift (12h)</th>
                        <th className="p-2 w-1/3">Night Shift (12h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {loc.posts.map((post) => {
                        const postAsgs = assignments.filter((a) => a.postId === post.id);
                        const dayGuards = postAsgs.filter((a) => a.shift === 'DAY').map((a) => guards.find((g) => g.id === a.guardId)?.name).filter(Boolean);
                        const nightGuards = postAsgs.filter((a) => a.shift === 'NIGHT').map((a) => guards.find((g) => g.id === a.guardId)?.name).filter(Boolean);

                        return (
                          <tr key={post.id}>
                            <td className="p-2 font-semibold text-slate-800">
                              {post.name}
                              <span className="text-[9px] text-slate-500 ml-1">({post.postType})</span>
                            </td>
                            <td className="p-2">
                              {dayGuards.length > 0 ? dayGuards.join(', ') : <span className="text-rose-600 font-bold">⚠️ Unfilled</span>}
                            </td>
                            <td className="p-2">
                              {nightGuards.length > 0 ? nightGuards.join(', ') : <span className="text-rose-600 font-bold">⚠️ Unfilled</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Signature Footer */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t-2 border-slate-300 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold">Field Supervisor</div>
                <div className="text-[10px] text-slate-500">Prepared By</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold">Security Manager</div>
                <div className="text-[10px] text-slate-500">Verified & Approved</div>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 font-bold">AGM / DGM Operations</div>
                <div className="text-[10px] text-slate-500">Official Seal</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-300">
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
