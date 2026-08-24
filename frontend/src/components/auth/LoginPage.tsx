'use client';

import React, { useState } from 'react';
import { Shield, Lock, User, Key, AlertCircle } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials } = useRoster();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); setLoading(true);
    try {
      const result = await loginWithCredentials(identifier, password);
      if (!result.success) setError(result.error || 'Login failed.');
    } finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-sky-500">
    <form onSubmit={submit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-amber-500 text-slate-950 flex items-center justify-center"><Shield className="w-8 h-8" /></div>
        <div><h1 className="text-2xl font-black tracking-wider text-white">SHIELD<span className="text-sky-400">OPS</span></h1><p className="text-xs text-slate-400 mt-1">Security Workforce Portal</p></div>
      </div>
      {error && <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      <div className="space-y-4 text-xs">
        <label className="block text-slate-300 font-bold">Official email<div className="relative mt-1.5"><User className="w-4 h-4 absolute left-3 top-3 text-slate-500" /><input required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="name@shieldops.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-white outline-none focus:border-sky-500" /></div></label>
        <label className="block text-slate-300 font-bold">Password<div className="relative mt-1.5"><Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" /><input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-white outline-none focus:border-sky-500" /></div></label>
      </div>
      <button disabled={loading} className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center justify-center gap-2"><Lock className="w-4 h-4" />{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
};
