'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Landmark, Lock, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, data } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login({ username, password });
    if (!success) {
      setError('Invalid username or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/25 text-white mb-2">
            <Landmark className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Loan Management</h1>
          <p className="text-sm text-slate-400">Single Lender Personal Operations Platform</p>
        </div>

        {/* Default credentials banner */}
        <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>Default LocalStorage Credentials</span>
          </div>
          <p className="text-slate-300">
            Username: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300 font-mono">admin</code> | Password:{' '}
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300 font-mono">{data.credentials.password || 'admin123'}</code>
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-[0.99]"
          >
            Sign In to Dashboard
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          Zero Cloud Database • 100% Client LocalStorage JSON Storage
        </div>
      </div>
    </div>
  );
}
