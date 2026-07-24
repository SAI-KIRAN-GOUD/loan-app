'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { RepaymentType } from '@/types';
import { formatCurrency, calculateInstallments } from '@/lib/storage';
import { X, Banknote, AlertCircle, Calendar, Calculator } from 'lucide-react';
import { format, addMonths, addDays } from 'date-fns';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  defaultCustomerId,
}) => {
  const { data, addLoan } = useApp();

  const [customerId, setCustomerId] = useState<string>(defaultCustomerId || '');
  const [loanAmount, setLoanAmount] = useState<string>('10000');
  const [repaymentAmount, setRepaymentAmount] = useState<string>('12000');
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('Daily');
  const [installmentAmount, setInstallmentAmount] = useState<string>('120');
  const [isManualInstallment, setIsManualInstallment] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState<string>(format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (defaultCustomerId) {
      setCustomerId(defaultCustomerId);
    } else if (data.customers.length > 0 && !customerId) {
      setCustomerId(data.customers[0].id);
    }
  }, [defaultCustomerId, data.customers]);

  // Recalculate automatic installment amount when loan/repayment changes if not overridden
  useEffect(() => {
    const rep = parseFloat(repaymentAmount) || 0;
    if (!isManualInstallment && rep > 0) {
      let defaultCount = repaymentType === 'Daily' ? 100 : repaymentType === 'Weekly' ? 20 : 6;
      let calculatedInst = Math.ceil(rep / defaultCount);
      setInstallmentAmount(calculatedInst.toString());
    }
  }, [repaymentAmount, repaymentType, isManualInstallment]);

  if (!isOpen) return null;

  const numLoan = parseFloat(loanAmount) || 0;
  const numRepayment = parseFloat(repaymentAmount) || 0;
  const numInstallment = parseFloat(installmentAmount) || 1;

  const schedulePreview = calculateInstallments(numRepayment, repaymentType, numInstallment, startDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer for this loan.');
      return;
    }

    if (numLoan <= 0) {
      setError('Loan amount must be greater than zero.');
      return;
    }

    if (numRepayment <= numLoan) {
      setError('Repayment amount must be strictly greater than loan amount.');
      return;
    }

    if (numInstallment <= 0) {
      setError('Installment amount must be greater than zero.');
      return;
    }

    const res = addLoan({
      customerId,
      loanAmount: numLoan,
      repaymentAmount: numRepayment,
      repaymentType,
      installmentAmount: numInstallment,
      totalInstallments: schedulePreview.totalInstallments,
      startDate,
      dueDate,
      notes: notes.trim(),
    });

    if (!res.success) {
      setError(res.error || 'Failed to create loan.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Issue New Loan</h2>
            <p className="text-sm text-slate-400">Generate custom repayment schedule and track installments</p>
          </div>
        </div>

        {data.customers.length === 0 ? (
          <div className="p-6 bg-slate-950/60 rounded-xl text-center border border-slate-800 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-white font-medium">No Customers Found</p>
            <p className="text-xs text-slate-400">Please register at least one customer before issuing loans.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Customer <span className="text-rose-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                required
              >
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Loan Principal Amount ({data.settings.currency}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Total Repayment Amount ({data.settings.currency}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Repayment Type
                </label>
                <select
                  value={repaymentType}
                  onChange={(e) => setRepaymentType(e.target.value as RepaymentType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Installment Amount ({data.settings.currency})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManualInstallment(!isManualInstallment)}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    {isManualInstallment ? 'Auto Calculate' : 'Manual Override'}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  value={installmentAmount}
                  onChange={(e) => {
                    setIsManualInstallment(true);
                    setInstallmentAmount(e.target.value);
                  }}
                  placeholder="e.g. 120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Loan Start Date 📅</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Final Due Date 📅</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Generated Schedule Box */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-blue-400">
                <Calculator className="w-4 h-4" />
                <span>Auto-Generated Schedule Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">Interest Amount:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(Math.max(0, numRepayment - numLoan))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Installments:</span>
                  <span className="font-semibold text-white">{schedulePreview.totalInstallments}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Per Installment:</span>
                  <span className="font-semibold text-white">{formatCurrency(numInstallment)} / {repaymentType}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Notes / Purpose
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Loan purpose, terms, collateral if any"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition"
              >
                Issue Loan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
