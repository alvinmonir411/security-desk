'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Eye, Sparkles } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedImportRow {
  postName: string;
  type: 'FIXED' | 'ROTATING';
  locationName: string;
  requiredDay: number;
  requiredNight: number;
  dayShiftGuards: string[];
  nightShiftGuards: string[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { refreshData, showToast, currentDate } = useRoster();

  const [rawText, setRawText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Main Factory');
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [detectedDuplicatesCount, setDetectedDuplicatesCount] = useState(0);

  if (!isOpen) return null;

  const parseInput = () => {
    if (!rawText.trim()) {
      showToast('Please paste Excel/CSV data first.');
      return;
    }

    const lines = rawText.trim().split('\n');
    const rows: ParsedImportRow[] = [];
    const nameTracker = new Set<string>();
    let duplicates = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header line if detected
      if (i === 0 && (line.toLowerCase().includes('post') || line.toLowerCase().includes('shift'))) {
        continue;
      }

      // Check if tab-separated (from Excel copy) or comma-separated
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map((s) => s.trim());
      } else {
        // Simple CSV splitter
        let current = '';
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else current += char;
        }
        parts.push(current.trim());
      }

      if (parts.length >= 2) {
        const postName = parts[0];
        const typeStr = (parts[1] || 'ROTATING').toUpperCase();
        const type: 'FIXED' | 'ROTATING' = typeStr.includes('FIX') ? 'FIXED' : 'ROTATING';

        // Check if required day/night or guard lists are in columns
        let reqDay = 1;
        let reqNight = 1;
        let dayGuards: string[] = [];
        let nightGuards: string[] = [];

        if (parts.length >= 5 && (!isNaN(Number(parts[2])) || !isNaN(Number(parts[3])))) {
          // Format: postName, type, locationName, reqDay, reqNight, dayGuards, nightGuards
          reqDay = parseInt(parts[3], 10) || 1;
          reqNight = parseInt(parts[4], 10) || 1;
          dayGuards = (parts[5] || '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          nightGuards = (parts[6] || '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
        } else {
          // Standard Format: postName | type | dayGuards | nightGuards
          dayGuards = (parts[2] || '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          nightGuards = (parts[3] || '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          reqDay = Math.max(1, dayGuards.length);
          reqNight = Math.max(1, nightGuards.length);
        }

        // Count duplicate names in input
        [...dayGuards, ...nightGuards].forEach((name) => {
          if (nameTracker.has(name)) {
            duplicates++;
          } else {
            nameTracker.add(name);
          }
        });

        rows.push({
          postName,
          type,
          locationName: selectedLocation,
          requiredDay: reqDay,
          requiredNight: reqNight,
          dayShiftGuards: dayGuards,
          nightShiftGuards: nightGuards,
        });
      }
    }

    setParsedRows(rows);
    setDetectedDuplicatesCount(duplicates);
    setIsPreviewed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setRawText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsImporting(true);
      const res = await fetch('/api/roster/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: parsedRows,
          targetDate: currentDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(`Imported ${data.importedPostsCount} posts and ${data.importedGuardsCount} guards successfully!`);
        onClose();
      } else {
        showToast(`Import failed: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">BULK IMPORT POSTS & GUARDS</h3>
              <p className="text-xs text-slate-400">Copy-paste directly from Excel sheet or upload CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions & File Picker */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="text-slate-400">
            Expected columns: <strong className="text-slate-200">Post Name | Type (Fixed/Rotating) | Day Shift Guards | Night Shift Guards</strong>
          </div>
          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold rounded-lg cursor-pointer border border-slate-700 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4" /> Upload .CSV
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Textarea for Excel Paste */}
        <textarea
          rows={6}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setIsPreviewed(false);
          }}
          placeholder="Paste tab-separated rows copied from Excel here... e.g.&#10;Main Gate & Turnstile	FIXED	Karim, Rahim, Hasan	Rafiq, Jamil, Salam&#10;Tower 2 North	ROTATING	Alamin, Farhad	Delwar, Zakir"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono outline-none focus:border-sky-500"
        />

        {/* Preview Section */}
        {isPreviewed && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Parsed {parsedRows.length} Posts
              </span>
              {detectedDuplicatesCount > 0 && (
                <span className="text-amber-400 flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> {detectedDuplicatesCount} duplicate names detected (will be created as rotating backups)
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 p-2 text-[11px] space-y-1.5">
              {parsedRows.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-850">
                  <div>
                    <span className="font-bold text-white">{r.postName}</span>
                    <span className="text-slate-500 ml-2 font-mono">({r.type})</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Day ({r.dayShiftGuards.length}): <span className="text-amber-300">{r.dayShiftGuards.slice(0, 2).join(', ')}{r.dayShiftGuards.length > 2 ? '...' : ''}</span> | Night ({r.nightShiftGuards.length}): <span className="text-indigo-300">{r.nightShiftGuards.slice(0, 2).join(', ')}{r.nightShiftGuards.length > 2 ? '...' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={parseInput}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-sky-400" /> [ Preview Data ]
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isPreviewed || parsedRows.length === 0 || isImporting}
              onClick={handleExecuteImport}
              className={`px-5 py-2 text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-lg transition ${
                isPreviewed && parsedRows.length > 0 && !isImporting
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isImporting ? 'Importing to Neon DB...' : '[ Import to Database ]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
