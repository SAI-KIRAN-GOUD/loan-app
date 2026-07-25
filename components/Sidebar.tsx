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
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 lg:relative lg:w-64 lg:bg-slate-900/50 lg:border-t-0 lg:border-r lg:border-slate-800/80 lg:p-4 flex lg:flex-col justify-between">
      <div className="w-full lg:w-auto flex flex-row lg:flex-col justify-around lg:justify-start lg:space-y-1 p-2 lg:p-0">
        <p className="hidden lg:block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
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
                'flex flex-col lg:flex-row items-center gap-1 lg:gap-3 p-2 lg:px-3.5 lg:py-2.5 rounded-xl font-medium text-[10px] lg:text-sm transition flex-1 lg:flex-none justify-center',
                isActive
                  ? 'text-blue-400 lg:bg-blue-600/15 lg:border lg:border-blue-500/25 lg:font-semibold'
                  : 'text-slate-400 hover:text-slate-200 lg:hover:bg-slate-800/50'
              )}
            >
              <Icon className={clsx('w-5 h-5 lg:w-5 lg:h-5', isActive ? 'text-blue-400' : 'text-slate-500')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="hidden lg:block pt-4 border-t border-slate-800/80">
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
