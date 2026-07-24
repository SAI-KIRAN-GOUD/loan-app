'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { KeyRound, LogOut, Landmark, User, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, logout } = useApp();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                LoanMaster <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Single Lender</span>
              </h1>
              <p className="text-xs text-slate-400">Offline LocalStorage Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Logged in as: <strong className="text-white">{data.credentials.username}</strong></span>
            </div>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Password</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
