'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/storage';
import { CustomerModal } from '@/components/CustomerModal';
import { LoanModal } from '@/components/LoanModal';
import { CollectPaymentModal } from '@/components/CollectPaymentModal';
import Link from 'next/link';
import {
  Users,
  Banknote,
  CheckCircle2,
  TrendingUp,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Receipt,
  PlusCircle,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { getDashboardMetrics, getReminders, data } = useApp();
  const metrics = getDashboardMetrics();
  const reminders = getReminders();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetPaymentLoanId, setTargetPaymentLoanId] = useState<string | undefined>();

  const customerMap = new Map(data.customers.map((c) => [c.id, c]));
  const loanMap = new Map(data.loans.map((l) => [l.id, l]));

  const openCollectForLoan = (loanId: string) => {
    setTargetPaymentLoanId(loanId);
    setIsPaymentModalOpen(true);
  };

  const cards = [
    {
      title: 'Total Customers',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Registered',
    },
    {
      title: 'Active Loans',
      value: metrics.activeLoans,
      icon: Banknote,
      color: 'from-amber-600 to-orange-600',
      badge: 'In Progress',
    },
    {
      title: 'Completed Loans',
      value: metrics.completedLoans,
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Fully Paid',
    },
    {
      title: 'Total Principal Given',
      value: formatCurrency(metrics.totalGiven),
      icon: TrendingUp,
      color: 'from-cyan-600 to-blue-600',
      badge: 'Capital Disbursed',
    },
    {
      title: 'Total Collected',
      value: formatCurrency(metrics.totalCollected),
      icon: ArrowDownRight,
      color: 'from-green-600 to-emerald-600',
      badge: 'Cash Inflow',
    },
    {
      title: 'Pending Outstanding',
      value: formatCurrency(metrics.pendingAmount),
      icon: Clock,
      color: 'from-rose-600 to-pink-600',
      badge: 'To Collect',
    },
    {
      title: "Today's Collection",
      value: formatCurrency(metrics.todayCollection),
      icon: Receipt,
      color: 'from-emerald-500 to-green-600',
      badge: 'Today Receipts',
    },
    {
      title: 'Overdue Loans',
      value: metrics.overdueLoans,
      icon: AlertTriangle,
      color: 'from-red-600 to-rose-700',
      badge: 'Action Required',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Lender Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time portfolio metrics, collections, and automated installment reminders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Loan</span>
          </button>

          <button
            onClick={() => {
              setTargetPaymentLoanId(undefined);
              setIsPaymentModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition"
          >
            <Receipt className="w-4 h-4" />
            <span>Collect Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg overflow-hidden flex flex-col justify-between hover:border-slate-700 transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 line-clamp-1">{card.title}</span>
                <div className={`hidden sm:flex p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md w-fit`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
                <div className="mt-1 sm:mt-2 flex items-center justify-between text-[9px] sm:text-[11px]">
                  <span className="text-slate-500 line-clamp-1">{card.badge}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notifications & Reminders Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Collection Reminders</h2>
              <p className="text-xs text-slate-400">Installments due today, tomorrow, and late payments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Due */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Today's Due ({reminders.todayDue.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {reminders.todayDue.length === 0 ? (
                <div className="p-4 bg-slate-950/40 rounded-xl text-center text-xs text-slate-500 border border-slate-800/60">
                  No installments due today
                </div>
              ) : (
                reminders.todayDue.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{item.customer.name}</p>
                      <p className="text-slate-400">
                        {item.loan.id} • Inst #{item.installment.installmentNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-400">{formatCurrency(item.installment.pending)}</p>
                      <button
                        onClick={() => openCollectForLoan(item.loan.id)}
                        className="text-[11px] font-semibold text-emerald-400 hover:underline mt-0.5 block"
                      >
                        Collect
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tomorrow's Due */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Tomorrow Due ({reminders.tomorrowDue.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {reminders.tomorrowDue.length === 0 ? (
                <div className="p-4 bg-slate-950/40 rounded-xl text-center text-xs text-slate-500 border border-slate-800/60">
                  No installments due tomorrow
                </div>
              ) : (
                reminders.tomorrowDue.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{item.customer.name}</p>
                      <p className="text-slate-400">
                        {item.loan.id} • Inst #{item.installment.installmentNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400">{formatCurrency(item.installment.pending)}</p>
                      <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 mt-1 inline-block">
                        Due Tomorrow
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Late Payments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Overdue & Late ({reminders.latePayments.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {reminders.latePayments.length === 0 ? (
                <div className="p-4 bg-slate-950/40 rounded-xl text-center text-xs text-slate-500 border border-slate-800/60">
                  No late payments! Portfolio clean.
                </div>
              ) : (
                reminders.latePayments.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{item.customer.name}</p>
                      <p className="text-rose-400">
                        Due: {item.installment.dueDate} ({item.loan.id})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-400">{formatCurrency(item.installment.pending)}</p>
                      <button
                        onClick={() => openCollectForLoan(item.loan.id)}
                        className="text-[11px] font-semibold text-emerald-400 hover:underline mt-0.5 block"
                      >
                        Collect Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Recent Payment Activity</span>
          </h2>
          <Link
            href="/payments"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All Payments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No payment transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Loan ID</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.payments.slice(0, 5).map((pay) => {
                  const customer = customerMap.get(pay.customerId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">{pay.id}</td>
                      <td className="py-3 px-4 text-slate-200">{customer?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-blue-400 font-medium">{pay.loanId}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{pay.paymentDate}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-400">
                        {formatCurrency(pay.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} />
      <LoanModal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} />
      <CollectPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultLoanId={targetPaymentLoanId}
      />
    </div>
  );
}
