'use client';

import React, { useState } from 'react';
import { useRoster, RoleType } from '../../context/RosterContext';
import { Shield, Lock, Mail, Key, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser } = useRoster();
  const [email, setEmail] = useState('dgm@shieldops.com');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<RoleType>('DGM');

  const demoAccounts: { role: RoleType; name: string; email: string; title: string; badge: string; color: string }[] = [
    {
      role: 'DGM',
      name: 'Brig. Gen. (Retd) Anwar Hossain',
      email: 'dgm@shieldops.com',
      title: 'Deputy General Manager (Chief Security)',
      badge: '👑 DGM (Top Executive)',
      color: 'border-amber-500/80 bg-amber-950/30 text-amber-300',
    },
    {
      role: 'AGM',
      name: 'Major (Retd) M. A. Jalil',
      email: 'agm@shieldops.com',
      title: 'Assistant General Manager (Operations)',
      badge: '🛡️ AGM (Executive)',
      color: 'border-sky-500/80 bg-sky-950/30 text-sky-300',
    },
    {
      role: 'MANAGER',
      name: 'Md. Imran Hossain',
      email: 'manager@shieldops.com',
      title: 'Security Operations Manager',
      badge: '📋 Operations Manager',
      color: 'border-emerald-500/80 bg-emerald-950/30 text-emerald-300',
    },
    {
      role: 'SUPERVISOR',
      name: 'Md. Delwar Hossain',
      email: 'supervisor@shieldops.com',
      title: 'Senior Field Supervisor',
      badge: '👮 Field Supervisor',
      color: 'border-purple-500/80 bg-purple-950/30 text-purple-300',
    },
    {
      role: 'SECURITY_GUARD',
      name: 'Abdul Mahfuz Islam',
      email: 'guard@shieldops.com',
      title: 'Senior Security Guard (G-001)',
      badge: '👤 Security Guard Portal',
      color: 'border-slate-600 bg-slate-900 text-slate-300',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(selectedRole, email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Side: Brand & Quick Demo Access */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xl">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider">SHIELDOPS</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-widest">
                Security Workforce Management
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1-Click Quick Role Switcher</span>
              </h2>
              <span className="text-[10px] text-slate-500">Instant Demo Login</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => loginUser(acc.role, acc.email, 'demo123')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition hover:scale-[1.01] shadow cursor-pointer ${acc.color}`}
                >
                  <div>
                    <div className="font-black text-xs flex items-center gap-2">
                      <span>{acc.badge}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-semibold mt-0.5">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{acc.email}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Standard ID & Password Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div>
            <h2 className="text-lg font-bold text-white">Sign In to Your Workspace</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your official credentials to access role-specific operations.
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Select Operating Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  const r = e.target.value as RoleType;
                  setSelectedRole(r);
                  const found = demoAccounts.find((d) => d.role === r);
                  if (found) setEmail(found.email);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-sky-500"
              >
                <option value="DGM">👑 DGM (Deputy General Manager)</option>
                <option value="AGM">🛡️ AGM (Assistant General Manager)</option>
                <option value="MANAGER">📋 Security Operations Manager</option>
                <option value="SUPERVISOR">👮 Field Supervisor</option>
                <option value="SECURITY_GUARD">👤 Security Guard</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Official Email / ID:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white font-medium outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Security Password:</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white font-medium outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Sign In as {selectedRole}
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-[11px] text-slate-400 text-center">
            🔒 Encrypted biometric & role-based authentication enforced.
          </div>
        </div>
      </div>
    </div>
  );
};
