'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/storage';
import { CollectPaymentModal } from '@/components/CollectPaymentModal';
import Link from 'next/link';
import {
  Receipt,
  Search,
  PlusCircle,
  IndianRupee,
  CreditCard,
  Building2,
  Wallet,
} from 'lucide-react';

export default function PaymentsPage() {
  const { data } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  const customerMap = new Map(data.customers.map((c) => [c.id, c]));

  const filteredPayments = data.payments.filter((payment) => {
    const customer = customerMap.get(payment.customerId);
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      payment.id.toLowerCase().includes(term) ||
      payment.loanId.toLowerCase().includes(term) ||
      (customer && customer.name.toLowerCase().includes(term)) ||
      (payment.remarks && payment.remarks.toLowerCase().includes(term));

    const matchesMethod = methodFilter === 'ALL' || payment.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalCollectedInList = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Payment Transactions Ledger</h1>
            <p className="text-xs text-slate-400">
              Complete repayment collection records ({data.payments.length} receipts logged)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollectModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition"
        >
          <Receipt className="w-4 h-4" />
          <span>Collect Payment</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt ID, customer, loan..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Payment Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Summary metric banner for filtered list */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Total Receipts Shown: <strong>{filteredPayments.length}</strong></span>
        <span className="text-slate-300 font-medium">
          Sum Amount: <strong className="text-emerald-400 text-sm">{formatCurrency(totalCollectedInList)}</strong>
        </span>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-semibold text-white">No Payments Recorded</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || methodFilter !== 'ALL'
              ? 'No transactions match your current search or method filter.'
              : 'Click Collect Payment to record your first loan repayment.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Receipt ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Loan ID</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map((p) => {
                const customer = customerMap.get(p.customerId);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{p.id}</td>
                    <td className="py-3.5 px-4">
                      {customer ? (
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-semibold text-slate-200 hover:text-blue-400 transition"
                        >
                          {customer.name}
                        </Link>
                      ) : (
                        'Unknown Customer'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/loans/${p.loanId}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {p.loanId}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.paymentDate}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.remarks || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CollectPaymentModal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
      />
    </div>
  );
}
