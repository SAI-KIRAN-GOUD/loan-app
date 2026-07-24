'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/storage';
import { CustomerModal } from '@/components/CustomerModal';
import { LoanModal } from '@/components/LoanModal';
import { CollectPaymentModal } from '@/components/CollectPaymentModal';
import { EMICalendar } from '@/components/EMICalendar';
import Link from 'next/link';
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Banknote,
  Receipt,
  Edit,
  PlusCircle,
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  const { data } = useApp();

  const customer = data.customers.find((c) => c.id === customerId);
  const loans = data.loans.filter((l) => l.customerId === customerId);
  const payments = data.payments.filter((p) => p.customerId === customerId);

  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [selectedLoanForCollect, setSelectedLoanForCollect] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'loans' | 'calendar' | 'payments' | 'docs'>('loans');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!customer) {
    return (
      <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <User className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Customer Not Found</h2>
        <p className="text-sm text-slate-400">No borrower customer found matching ID {customerId}.</p>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers Directory
        </Link>
      </div>
    );
  }

  const activeLoans = loans.filter((l) => l.status === 'Active');
  const completedLoans = loans.filter((l) => l.status === 'Closed');
  const totalPrincipal = loans.reduce((sum, l) => sum + l.loanAmount, 0);
  const totalRepayment = loans.reduce((sum, l) => sum + l.repaymentAmount, 0);
  const totalPaid = loans.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + l.remainingAmount, 0);

  const openCollectModal = (loanId?: string) => {
    setSelectedLoanForCollect(loanId);
    setIsCollectPaymentOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditCustomerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button
            onClick={() => setIsNewLoanOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" /> Issue New Loan
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div
              onClick={() => customer.photo && setPreviewImage(customer.photo)}
              className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-2xl cursor-pointer hover:border-blue-500 transition flex-shrink-0"
            >
              {customer.photo ? (
                <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                customer.name.substring(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white">{customer.name}</h1>
                <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-bold">
                  {customer.id}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {customer.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-300">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Phone: <strong>{customer.phone}</strong></span>
                  </div>
                )}
                {customer.fatherName && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Father: {customer.fatherName}</span>
                  </div>
                )}
                {(customer.address || customer.city) && (
                  <div className="flex items-center gap-2 text-slate-400 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {[customer.address, customer.village, customer.city, customer.state, customer.pin]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Financial Summary */}
          <div className="w-full lg:w-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Loans:</span>
              <span className="font-bold text-white text-base">{loans.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Completed:</span>
              <span className="font-bold text-emerald-400 text-base">{completedLoans.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Paid:</span>
              <span className="font-bold text-emerald-400 text-base">{formatCurrency(totalPaid)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Outstanding:</span>
              <span className="font-extrabold text-amber-400 text-base">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>
        </div>

        {/* Extended Details Collapse */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block text-[11px]">Aadhaar:</span>
            <span className="text-slate-200 font-mono">{customer.aadhaar || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">PAN:</span>
            <span className="text-slate-200 font-mono">{customer.pan || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Occupation:</span>
            <span className="text-slate-200">{customer.occupation || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Monthly Income:</span>
            <span className="text-slate-200 font-semibold">{formatCurrency(customer.monthlyIncome || 0)}</span>
          </div>
        </div>
      </div>

      {/* Tabs View Navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('loans')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition',
            activeTab === 'loans'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          )}
        >
          <Banknote className="w-4 h-4" />
          <span>Customer Loans ({loans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition',
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Interactive EMI Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition',
            activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          )}
        >
          <Receipt className="w-4 h-4" />
          <span>Payment History ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition',
            activeTab === 'docs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          )}
        >
          <ImageIcon className="w-4 h-4" />
          <span>KYC Proofs & Documents</span>
        </button>
      </div>

      {/* Tab 1: Customer Loans */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {loans.length === 0 ? (
            <div className="p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
              <Banknote className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-white font-semibold">No Loans Issued Yet</p>
              <p className="text-xs text-slate-400">Issue a new loan for {customer.name} to start tracking repayments.</p>
              <button
                onClick={() => setIsNewLoanOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4" /> Issue First Loan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-base">{loan.id}</span>
                      <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                        {loan.repaymentType} Schedule
                      </span>
                    </div>
                    <span
                      className={clsx(
                        'text-xs font-bold px-2.5 py-0.5 rounded-full',
                        loan.status === 'Active' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                        loan.status === 'Closed' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                        loan.status === 'Defaulted' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      )}
                    >
                      {loan.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Principal Given:</span>
                      <span className="font-semibold text-white">{formatCurrency(loan.loanAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Repayment:</span>
                      <span className="font-semibold text-white">{formatCurrency(loan.repaymentAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Paid Amount:</span>
                      <span className="font-semibold text-emerald-400">{formatCurrency(loan.paidAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Remaining Balance:</span>
                      <span className="font-bold text-amber-400">{formatCurrency(loan.remainingAmount)}</span>
                    </div>
                  </div>

                  {/* Loan Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Repayment Progress</span>
                      <span>{Math.round((loan.paidAmount / loan.repaymentAmount) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (loan.paidAmount / loan.repaymentAmount) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="text-xs font-semibold text-blue-400 hover:underline"
                    >
                      View Detailed Schedule & Breakdown →
                    </Link>

                    {loan.status === 'Active' && (
                      <button
                        onClick={() => openCollectModal(loan.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
                      >
                        Collect Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Customer EMI Calendar */}
      {activeTab === 'calendar' && (
        <EMICalendar customer={customer} loans={loans} onCollectPayment={openCollectModal} />
      )}

      {/* Tab 3: Customer Payment History */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">All Payment Transactions</h3>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No payments recorded yet for this customer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Receipt ID</th>
                    <th className="py-3 px-4">Loan ID</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">{p.id}</td>
                      <td className="py-3 px-4 text-blue-400 font-medium">{p.loanId}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{p.paymentDate}</td>
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
      )}

      {/* Tab 4: KYC & Proofs */}
      {activeTab === 'docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base">KYC Uploaded Base64 Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Customer Profile Photo</h4>
              {customer.photo ? (
                <div
                  onClick={() => setPreviewImage(customer.photo!)}
                  className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-blue-500 transition"
                >
                  <img src={customer.photo} alt="Customer Photo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="h-48 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                  No profile photo uploaded
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">ID Proof Document</h4>
              {customer.idProof ? (
                <div
                  onClick={() => setPreviewImage(customer.idProof!)}
                  className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-blue-500 transition"
                >
                  <img src={customer.idProof} alt="ID Proof" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="h-48 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                  No ID proof image uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
        >
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}

      {/* Modals */}
      <CustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        customerToEdit={customer}
      />
      <LoanModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        defaultCustomerId={customer.id}
      />
      <CollectPaymentModal
        isOpen={isCollectPaymentOpen}
        onClose={() => setIsCollectPaymentOpen(false)}
        defaultLoanId={selectedLoanForCollect}
      />
    </div>
  );
}
