'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/storage';
import { CustomerModal } from '@/components/CustomerModal';
import Link from 'next/link';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MapPin,
  Banknote,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function CustomersPage() {
  const { data } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map active loan counts & outstanding per customer
  const customerLoanStats = new Map<string, { activeLoansCount: number; totalPending: number }>();
  data.loans.forEach((loan) => {
    const stats = customerLoanStats.get(loan.customerId) || { activeLoansCount: 0, totalPending: 0 };
    if (loan.status === 'Active') {
      stats.activeLoansCount += 1;
      stats.totalPending += loan.remainingAmount;
    }
    customerLoanStats.set(loan.customerId, stats);
  });

  const filteredCustomers = data.customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Customer Directory</h1>
            <p className="text-xs text-slate-400">
              Manage borrowers, KYC documents, and profiles ({data.customers.length} registered)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or ID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-semibold text-white">No Customers Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first borrower customer.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
            >
              <UserPlus className="w-4 h-4" /> Create Customer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const stats = customerLoanStats.get(customer.id) || { activeLoansCount: 0, totalPending: 0 };
            return (
              <div
                key={customer.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-lg flex-shrink-0">
                      {customer.photo ? (
                        <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" />
                      ) : (
                        customer.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition">
                        {customer.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {customer.id}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {customer.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {(customer.city || customer.address) && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{customer.city || customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Active Loans:</span>
                    <span className="font-bold text-white">{stats.activeLoansCount} active</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Outstanding:</span>
                    <span className="font-extrabold text-amber-400">
                      {formatCurrency(stats.totalPending)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    View Full Profile & EMI Calendar <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
