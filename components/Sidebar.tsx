'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Banknote,
  Receipt,
  BarChart3,
  Database,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Loans', href: '/loans', icon: Banknote },
  { name: 'Payments', href: '/payments', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 bg-slate-900/50 border-r border-slate-800/80 p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Navigation Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-blue-400' : 'text-slate-500')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Browser LocalStorage</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Data is persisted strictly in client JSON format. Backup & export available under Reports.
          </p>
        </div>
      </div>
    </aside>
  );
};
