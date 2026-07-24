'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/storage';
import {
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Receipt,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileJson,
} from 'lucide-react';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';

export default function ReportsPage() {
  const { data, exportData, importData, resetData } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const customerMap = new Map(data.customers.map((c) => [c.id, c]));

  // Date-wise collection calculations
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  let todayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;
  let grandTotal = 0;

  data.payments.forEach((p) => {
    const amt = p.amount || 0;
    grandTotal += amt;

    if (p.paymentDate) {
      if (p.paymentDate.startsWith(todayStr)) {
        todayTotal += amt;
      }
      try {
        const d = parseISO(p.paymentDate);
        if (isThisWeek(d)) {
          weekTotal += amt;
        }
        if (isThisMonth(d)) {
          monthTotal += amt;
        }
      } catch (e) {
        // ignore date parse issues
      }
    }
  });

  const totalPendingCollection = data.loans.reduce((acc, l) => acc + (l.remainingAmount || 0), 0);

  // Customer-wise aggregation
  const customerSummaryMap = new Map<
    string,
    { customerName: string; totalGiven: number; totalCollected: number; totalPending: number; activeLoans: number }
  >();

  data.customers.forEach((c) => {
    customerSummaryMap.set(c.id, {
      customerName: c.name,
      totalGiven: 0,
      totalCollected: 0,
      totalPending: 0,
      activeLoans: 0,
    });
  });

  data.loans.forEach((l) => {
    const entry = customerSummaryMap.get(l.customerId) || {
      customerName: 'Unknown',
      totalGiven: 0,
      totalCollected: 0,
      totalPending: 0,
      activeLoans: 0,
    };
    entry.totalGiven += l.loanAmount;
    entry.totalCollected += l.paidAmount;
    entry.totalPending += l.remainingAmount;
    if (l.status === 'Active') entry.activeLoans += 1;

    customerSummaryMap.set(l.customerId, entry);
  });

  const customerReportList = Array.from(customerSummaryMap.entries()).map(([id, info]) => ({
    customerId: id,
    ...info,
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const res = importData(content);
          if (res.success) {
            setImportStatus({ success: true, message: 'LocalStorage backup restored successfully!' });
          } else {
            setImportStatus({ success: false, message: res.error || 'Failed to parse JSON file.' });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTextImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    const res = importData(importJsonText);
    if (res.success) {
      setImportStatus({ success: true, message: 'LocalStorage backup restored successfully!' });
      setImportJsonText('');
    } else {
      setImportStatus({ success: false, message: res.error || 'Invalid JSON backup string.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Financial Reports & Data Backup</h1>
            <p className="text-xs text-slate-400">
              Collection analytics, customer ledger breakdowns, and LocalStorage JSON export/import
            </p>
          </div>
        </div>

        <button
          onClick={exportData}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Backup JSON Export</span>
        </button>
      </div>

      {/* Collection Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-slate-500 text-[11px] font-semibold block">Today's Collection</span>
          <p className="text-xl font-extrabold text-emerald-400">{formatCurrency(todayTotal)}</p>
          <span className="text-[10px] text-slate-500">Collected today</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-slate-500 text-[11px] font-semibold block">This Week's Collection</span>
          <p className="text-xl font-extrabold text-teal-400">{formatCurrency(weekTotal)}</p>
          <span className="text-[10px] text-slate-500">Current calendar week</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-slate-500 text-[11px] font-semibold block">This Month's Collection</span>
          <p className="text-xl font-extrabold text-blue-400">{formatCurrency(monthTotal)}</p>
          <span className="text-[10px] text-slate-500">Current calendar month</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-slate-500 text-[11px] font-semibold block">Total Collection</span>
          <p className="text-xl font-extrabold text-green-400">{formatCurrency(grandTotal)}</p>
          <span className="text-[10px] text-slate-500">All-time receipts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-slate-500 text-[11px] font-semibold block">Pending Collection</span>
          <p className="text-xl font-extrabold text-amber-400">{formatCurrency(totalPendingCollection)}</p>
          <span className="text-[10px] text-slate-500">Remaining balances</span>
        </div>
      </div>

      {/* Customer-wise Collection Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span>Customer-wise Collection Summary</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Active Loans</th>
                <th className="py-3.5 px-4">Total Principal Given</th>
                <th className="py-3.5 px-4">Total Collected</th>
                <th className="py-3.5 px-4 text-right">Pending Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customerReportList.map((row) => (
                <tr key={row.customerId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-400">{row.customerId}</td>
                  <td className="py-3 px-4 font-bold text-white">{row.customerName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 font-semibold text-slate-300">
                      {row.activeLoans} active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">{formatCurrency(row.totalGiven)}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">{formatCurrency(row.totalCollected)}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-400">
                    {formatCurrency(row.totalPending)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LocalStorage Data Backup & Restore Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <FileJson className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">LocalStorage Data Management</h2>
            <p className="text-xs text-slate-400">
              Export, import, restore backup, or reset browser storage
            </p>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export & File Upload Import */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export & Import JSON Files</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download your entire system data (customers, loans, payments, and credentials) as a single JSON file. You can restore this backup anytime on any browser.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
              >
                <Download className="w-4 h-4" /> Download Backup JSON
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload JSON Backup</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Paste JSON Raw Restore */}
          <form onSubmit={handleTextImport} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Paste Raw JSON Backup</span>
            </h3>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON string here to restore..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!importJsonText.trim()}
                className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Restore Raw JSON
              </button>
            </div>
          </form>
        </div>

        {/* Database Reset Danger Zone */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-400">Reset LocalStorage Database</h4>
            <p className="text-[11px] text-slate-500">Clears all customers, loans, and payments from this browser.</p>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                  setImportStatus({ success: true, message: 'Database reset to default settings.' });
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow"
              >
                Confirm Clear All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-300 hover:text-white text-xs font-semibold rounded-xl transition"
            >
              Reset Database
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
