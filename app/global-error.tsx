'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen items-center justify-center p-6 text-center antialiased">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="inline-flex p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Root Application Error</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error?.message || 'A root-level error occurred. Click below to recover.'}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
