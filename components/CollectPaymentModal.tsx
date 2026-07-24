'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Loan, PaymentMethod } from '@/types';
import { formatCurrency } from '@/lib/storage';
import { X, Receipt, IndianRupee, CreditCard, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLoanId?: string;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultLoanId,
}) => {
  const { data, addPayment } = useApp();
  const [selectedLoanId, setSelectedLoanId] = useState<string>(defaultLoanId || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');

  const activeLoans = data.loans.filter((l) => l.status === 'Active' && l.remainingAmount > 0);
  const selectedLoan = data.loans.find((l) => l.id === selectedLoanId);
  const customerMap = new Map(data.customers.map((c) => [c.id, c]));

  useEffect(() => {
    if (defaultLoanId) {
      setSelectedLoanId(defaultLoanId);
    } else if (activeLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(activeLoans[0].id);
    }
  }, [defaultLoanId, activeLoans]);

  useEffect(() => {
    if (selectedLoan) {
      // Suggest installment amount as default
      const defaultPay = Math.min(selectedLoan.installmentAmount, selectedLoan.remainingAmount);
      setAmount(defaultPay.toString());
    }
  }, [selectedLoanId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedLoan) {
      setError('Please select an active loan.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (numAmount > selectedLoan.remainingAmount) {
      setError(`Payment amount cannot exceed remaining loan balance (${formatCurrency(selectedLoan.remainingAmount)}).`);
      return;
    }

    const res = addPayment({
      loanId: selectedLoan.id,
      customerId: selectedLoan.customerId,
      amount: numAmount,
      paymentMethod,
      paymentDate,
      remarks,
    });

    if (!res.success) {
      setError(res.error || 'Failed to process payment.');
      return;
    }

    onClose();
  };

  const numAmount = parseFloat(amount) || 0;
  const newRemaining = selectedLoan ? Math.max(0, selectedLoan.remainingAmount - numAmount) : 0;
  const newPaid = selectedLoan ? selectedLoan.paidAmount + numAmount : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Collect Payment</h2>
            <p className="text-sm text-slate-400">Record repayment for an active loan</p>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-6 bg-slate-950/60 rounded-xl text-center border border-slate-800 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-white font-medium">No Active Loans Found</p>
            <p className="text-xs text-slate-400">Create a loan first before collecting payments.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Active Loan
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
              >
                {activeLoans.map((loan) => {
                  const customer = customerMap.get(loan.customerId);
                  return (
                    <option key={loan.id} value={loan.id}>
                      {loan.id} - {customer?.name || 'Unknown'} (Pending: {formatCurrency(loan.remainingAmount)})
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedLoan && (
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Total Repayment:</span>
                  <p className="font-semibold text-slate-200">{formatCurrency(selectedLoan.repaymentAmount)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Current Remaining:</span>
                  <p className="font-semibold text-amber-400">{formatCurrency(selectedLoan.remainingAmount)}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Payment Amount ({data.settings.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-semibold text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
                <IndianRupee className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payment Date 📅</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Remarks / Notes (Optional)
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Transaction ID, note, etc."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {selectedLoan && numAmount > 0 && (
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl space-y-1 text-xs">
                <p className="font-semibold text-blue-300">Live Post-Payment Preview:</p>
                <div className="flex justify-between text-slate-300">
                  <span>New Total Paid:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(newPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Remaining Balance:</span>
                  <span className="font-bold text-amber-400">{formatCurrency(newRemaining)}</span>
                </div>
                {newRemaining === 0 && (
                  <p className="text-emerald-400 font-bold pt-1 text-[11px]">
                    🎉 This payment will complete and CLOSE the loan!
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/25 transition"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
