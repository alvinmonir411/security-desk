'use client';

import React, { useState } from 'react';
import { useRoster, GuardProfile } from '../../context/RosterContext';
import { Search, Plus, MoreVertical, UserCheck, UserX, Eye, Edit3, X, Lock, RotateCw, FileSpreadsheet } from 'lucide-react';
import { BulkImportModal } from '../roster/BulkImportModal';

export const GuardsDirectoryPage: React.FC = () => {
  const { guards, locations, addGuard, updateGuardFixedPost, showToast } = useRoster();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [postTypeFilter, setPostTypeFilter] = useState('ALL'); // ALL, FIXED, ROTATING

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [activeMenuGuardId, setActiveMenuGuardId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNid, setFormNid] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBlood, setFormBlood] = useState('O+');
  const [formLocation, setFormLocation] = useState(locations[0]?.id || 'LOC-1');
  const [formAssignmentType, setFormAssignmentType] = useState<'FIXED' | 'ROTATING'>('FIXED');
  const [formFixedPostId, setFormFixedPostId] = useState(locations[0]?.posts[0]?.id || 'POST-F01');

  const activeSelectedLocation = locations.find((l) => l.id === formLocation) || locations[0];

  const filteredGuards = guards.filter((g) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!g.name.toLowerCase().includes(q) && !g.badgeNumber.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
    if (postTypeFilter === 'FIXED' && !g.fixedPostId) return false;
    if (postTypeFilter === 'ROTATING' && g.fixedPostId) return false;
    return true;
  });

  const handleSaveGuard = (e: React.FormEvent) => {
    e.preventDefault();
    addGuard({
      name: formName || 'Md. Security Personnel',
      phone: formPhone || '+880 1711000000',
      nid: formNid || '1998000000',
      address: formAddress || 'Dhaka',
      joiningDate: new Date().toISOString().split('T')[0],
      bloodGroup: formBlood,
      defaultLocationId: formLocation,
      fixedPostId: formAssignmentType === 'FIXED' ? formFixedPostId : null,
      status: 'ACTIVE',
      qualifications: ['Gate Security', 'First Aid'],
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[320px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="🔍 Search guards by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">Status: All (200)</option>
            <option value="ACTIVE">Active Force</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent Today</option>
          </select>

          <select
            value={postTypeFilter}
            onChange={(e) => setPostTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">Post Type: All</option>
            <option value="FIXED">Fixed Post Guards</option>
            <option value="ROTATING">Rotating Pool Guards</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
          >
            <FileSpreadsheet className="w-4 h-4" /> [ Bulk Import from Excel/CSV ]
          </button>

          <button
            onClick={() => {
              setFormName('');
              setFormPhone('+880 17');
              setFormNid('');
              setFormAddress('Dhaka Industrial Zone');
              setFormAssignmentType('FIXED');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" /> [+ Add Guard]
          </button>
        </div>
      </div>

      {/* Guards Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Photo</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Fixed Post / Type</th>
                <th className="py-3 px-3">Duty</th>
                <th className="py-3 px-3 text-right pr-4">⋮ Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGuards.slice(0, 30).map((guard) => {
                const isMenuOpen = activeMenuGuardId === guard.id;
                const locObj = locations.find((l) => l.id === guard.defaultLocationId);
                const fixedPostObj = locObj?.posts.find((p) => p.id === guard.fixedPostId);

                return (
                  <tr key={guard.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-sky-400 font-bold text-xs flex items-center justify-center mx-auto border border-slate-700">
                        👤
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      <div>{guard.name}</div>
                      <div className="text-[10px] text-slate-500">{guard.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{guard.badgeNumber}</td>
                    <td className="py-3 px-3">
                      {guard.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                          Active
                        </span>
                      ) : guard.status === 'ON_LEAVE' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 font-bold text-[10px] border border-amber-800">
                          On Leave
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 font-bold text-[10px] border border-rose-800">
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {guard.fixedPostId && fixedPostObj ? (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {fixedPostObj.name} 🔒
                        </span>
                      ) : (
                        <span className="text-purple-400 font-bold text-[11px] flex items-center gap-1">
                          <RotateCw className="w-3 h-3" /> Rotating 🔁
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-300">{guard.dutyStreak}/6</span>
                      <span className="text-[10px] text-slate-500 ml-1">({guard.weeklyHours}h)</span>
                    </td>
                    <td className="py-3 px-3 text-right pr-4 relative">
                      <button
                        onClick={() => setActiveMenuGuardId(isMenuOpen ? null : guard.id)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-4 top-10 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-30 py-1 text-left text-xs">
                          <button
                            onClick={() => {
                              showToast(`Editing profile for ${guard.name}`);
                              setActiveMenuGuardId(null);
                            }}
                            className="w-full px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                          </button>
                          {guard.fixedPostId ? (
                            <button
                              onClick={() => {
                                updateGuardFixedPost(guard.id, null);
                                setActiveMenuGuardId(null);
                              }}
                              className="w-full px-3 py-2 text-purple-400 hover:bg-slate-800 flex items-center gap-2"
                            >
                              <RotateCw className="w-3.5 h-3.5" /> Convert to Rotating
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateGuardFixedPost(guard.id, 'POST-F01');
                                setActiveMenuGuardId(null);
                              }}
                              className="w-full px-3 py-2 text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Lock className="w-3.5 h-3.5" /> Set as Fixed Post
                            </button>
                          )}
                          <button
                            onClick={() => {
                              showToast(`Marked ${guard.name} on leave`);
                              setActiveMenuGuardId(null);
                            }}
                            className="w-full px-3 py-2 text-amber-400 hover:bg-slate-800 flex items-center gap-2"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Mark On Leave
                          </button>
                          <button
                            onClick={() => {
                              showToast(`Loading duty history for ${guard.name}`);
                              setActiveMenuGuardId(null);
                            }}
                            className="w-full px-3 py-2 text-sky-400 hover:bg-slate-800 flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Post History
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* [+ Add Guard] Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGuard}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">+ Add New Security Guard</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Tanvir Hossain"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number:</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">National ID (NID):</label>
                  <input
                    type="text"
                    required
                    placeholder="1998XXXXXXXXX"
                    value={formNid}
                    onChange={(e) => setFormNid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Assignment Type:</label>
                  <select
                    value={formAssignmentType}
                    onChange={(e) => setFormAssignmentType(e.target.value as 'FIXED' | 'ROTATING')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="FIXED">🔒 Fixed Post</option>
                    <option value="ROTATING">🔁 Rotating Pool</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Location:</label>
                  <select
                    value={formLocation}
                    onChange={(e) => {
                      setFormLocation(e.target.value);
                      const loc = locations.find((l) => l.id === e.target.value);
                      if (loc && loc.posts.length > 0) {
                        setFormFixedPostId(loc.posts[0].id);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formAssignmentType === 'FIXED' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Home Fixed Post:</label>
                  <select
                    value={formFixedPostId}
                    onChange={(e) => setFormFixedPostId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    {activeSelectedLocation.posts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.postType})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Residential Address:</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow"
              >
                Save & Enroll Guard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
      />
    </div>
  );
};
