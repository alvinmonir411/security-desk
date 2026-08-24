'use client';

import React, { useState } from 'react';
import { useRoster, OFFICIAL_ACCOUNTS, UserAccount } from '../../context/RosterContext';
import { Shield, Lock, User, Key, AlertCircle, CheckCircle2, ChevronRight, Fingerprint } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials } = useRoster();
  const [identifier, setIdentifier] = useState('manager@shieldops.com');
  const [password, setPassword] = useState('mgr@2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithCredentials(identifier, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      }
      setIsLoading(false);
    }, 300);
  };

  const handleSelectAccount = (acc: UserAccount) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-sky-500 selection:text-slate-950">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & 5 Official Accounts Credentials Guide */}
        <div className="md:col-span-6 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-sky-500/10">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider">
                SHIELD<span className="text-sky-400">OPS</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Enterprise Security Workforce
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  5 Authorized Role Accounts
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                RBAC Enforced
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click any account below to autofill its official ID & Password for testing, or type them manually:
            </p>

            <div className="space-y-2">
              {OFFICIAL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className={`w-full p-3 rounded-xl border text-left transition hover:scale-[1.01] shadow cursor-pointer group flex items-center justify-between ${acc.color}`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-white">{acc.badge}</span>
                      <span className="text-[10px] font-mono bg-slate-950/80 px-1.5 py-0.2 rounded text-sky-300 border border-slate-750">
                        ID: {acc.username}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200">{acc.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Email: <span className="text-slate-300">{acc.email}</span> | Pass:{' '}
                      <span className="text-amber-300 font-bold">{acc.password}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Credential Login Form */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-500"></div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Security Portal Login</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your authorized ID / Email and security password to access your role workspace.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Official User ID or Email:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. dgm01 or dgm@shieldops.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white font-medium outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition placeholder:text-slate-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Password:</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white font-medium outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition placeholder:text-slate-600 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 active:scale-[0.99] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Sign In to Workspace
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Strict Role Isolation Enforced
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Each user only has access to their authorized operational modules. Switching between roles requires signing out and providing valid credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
