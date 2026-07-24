'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatCurrency, getDynamicInstallmentStatusLabel } from '@/lib/storage';
import { CollectPaymentModal } from '@/components/CollectPaymentModal';
import Link from 'next/link';
import {
  Banknote,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import { InstallmentStatus, LoanStatus } from '@/types';

export default function LoanDetailPage() {
  const params = useParams();
  const loanId = params.id as string;
  const { data, updateInstallmentStatus, updateLoanStatus } = useApp();

  const loan = data.loans.find((l) => l.id === loanId);
  const customer = loan ? data.customers.find((c) => c.id === loan.customerId) : null;
  const payments = data.payments.filter((p) => p.loanId === loanId);

  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);

  if (!loan) {
    return (
      <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <Banknote className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Loan Record Not Found</h2>
        <p className="text-sm text-slate-400">No loan matching ID {loanId} was found in LocalStorage.</p>
        <Link
          href="/loans"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Loans
        </Link>
      </div>
    );
  }

  const progress = Math.round((loan.paidAmount / loan.repaymentAmount) * 100);

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/loans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Loans
        </Link>

        {loan.status === 'Active' && (
          <button
            onClick={() => setIsCollectPaymentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition"
          >
            <Receipt className="w-4 h-4" /> Collect Payment
          </button>
        )}
      </div>

      {/* Loan Summary Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">{loan.id}</h1>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {loan.repaymentType} Schedule
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={loan.status}
                  onChange={(e) => updateLoanStatus(loan.id, e.target.value as LoanStatus)}
                  className="bg-slate-950 border border-slate-800 text-xs font-bold px-3 py-1 rounded-full text-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                  <option value="Defaulted">Defaulted</option>
                </select>
              </div>
            </div>

            {customer && (
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center gap-1.5 font-bold text-blue-400 hover:underline"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Borrower: {customer.name} ({customer.id})</span>
                </Link>
                {customer.phone && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Principal Amount:</span>
              <span className="font-semibold text-white text-base">{formatCurrency(loan.loanAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Repayment:</span>
              <span className="font-semibold text-white text-base">{formatCurrency(loan.repaymentAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Collected:</span>
              <span className="font-bold text-emerald-400 text-base">{formatCurrency(loan.paidAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Pending Balance:</span>
              <span className="font-extrabold text-amber-400 text-base">{formatCurrency(loan.remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs text-slate-300 font-semibold">
            <span>Overall Loan Repayment Progress</span>
            <span className="text-emerald-400">{progress}% Complete</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Installment Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Installment Schedule Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400">
              {loan.totalInstallments} total installments ({formatCurrency(loan.installmentAmount)} / {loan.repaymentType})
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Inst #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loan.installments.map((inst) => {
                const statusInfo = getDynamicInstallmentStatusLabel(inst);
                return (
                  <tr key={inst.installmentNo} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">#{inst.installmentNo}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{inst.dueDate}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{formatCurrency(inst.amount)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{formatCurrency(inst.paid)}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">{formatCurrency(inst.pending)}</td>
                    <td className="py-3 px-4">
                      <span className={clsx('text-[10px] font-bold px-2.5 py-0.5 rounded-full', statusInfo.badgeClass)}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={inst.status}
                        onChange={(e) =>
                          updateInstallmentStatus(loan.id, inst.installmentNo, e.target.value as InstallmentStatus)
                        }
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Late">Late</option>
                        <option value="Skipped">Skipped</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History for Loan */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-400" />
          <span>Payment History for Loan {loan.id}</span>
        </h2>

        {payments.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No payment transactions recorded for this loan yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{p.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-semibold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.paymentDate}</td>
                    <td className="py-3 px-4 text-slate-400">{p.remarks || '-'}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CollectPaymentModal
        isOpen={isCollectPaymentOpen}
        onClose={() => setIsCollectPaymentOpen(false)}
        defaultLoanId={loan.id}
      />
    </div>
  );
}
