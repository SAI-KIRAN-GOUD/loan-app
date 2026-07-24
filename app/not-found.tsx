import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white">404 - Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-md">The page or resource you requested could not be located.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}
