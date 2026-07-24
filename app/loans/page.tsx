'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/storage';
import { LoanModal } from '@/components/LoanModal';
import { CollectPaymentModal } from '@/components/CollectPaymentModal';
import Link from 'next/link';
import {
  Banknote,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function LoansPage() {
  const { data } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState<string | undefined>();

  const customerMap = new Map(data.customers.map((c) => [c.id, c]));

  const filteredLoans = data.loans.filter((loan) => {
    const customer = customerMap.get(loan.customerId);
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      loan.id.toLowerCase().includes(term) ||
      loan.status.toLowerCase().includes(term) ||
      (customer && customer.name.toLowerCase().includes(term)) ||
      (customer && customer.phone && customer.phone.includes(term));

    const matchesType = typeFilter === 'ALL' || loan.repaymentType === typeFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      loan.status === statusFilter ||
      (statusFilter === 'Completed' && loan.status === 'Closed');

    return matchesSearch && matchesType && matchesStatus;
  });

  const openCollect = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsCollectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Loans & Schedules</h1>
            <p className="text-xs text-slate-400">
              Active loan portfolio, daily/weekly/monthly schedules ({data.loans.length} total loans)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsLoanModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, phone, loan ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Repayment Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed / Closed</option>
              <option value="Defaulted">Defaulted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      {filteredLoans.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
          <Banknote className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-semibold text-white">No Loans Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No loans match your applied search and filters.'
              : 'Start by issuing a loan for a customer.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => {
            const customer = customerMap.get(loan.customerId);
            const progress = Math.round((loan.paidAmount / loan.repaymentAmount) * 100);

            return (
              <div
                key={loan.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base group-hover:text-blue-400 transition">
                        {loan.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {loan.repaymentType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      {customer?.name || 'Unknown Borrower'}
                    </p>
                    {customer?.phone && (
                      <p className="text-[11px] text-slate-500">{customer.phone}</p>
                    )}
                  </div>

                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                      loan.status === 'Active' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                      loan.status === 'Closed' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                      loan.status === 'Defaulted' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    )}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Loan Principal:</span>
                    <span className="font-semibold text-white">{formatCurrency(loan.loanAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Total Repayment:</span>
                    <span className="font-semibold text-white">{formatCurrency(loan.repaymentAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Paid:</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(loan.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Pending:</span>
                    <span className="font-extrabold text-amber-400">{formatCurrency(loan.remainingAmount)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Progress ({loan.installments.filter((i) => i.status === 'Paid').length} / {loan.totalInstallments} Inst)</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/loans/${loan.id}`}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Installments Schedule <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {loan.status === 'Active' && (
                    <button
                      onClick={() => openCollect(loan.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
                    >
                      Collect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <LoanModal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} />
      <CollectPaymentModal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        defaultLoanId={targetLoanId}
      />
    </div>
  );
}
