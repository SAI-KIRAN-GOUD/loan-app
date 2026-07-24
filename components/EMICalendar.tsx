'use client';

import React, { useState } from 'react';
import { Customer, Loan, Installment } from '@/types';
import { formatCurrency, getDynamicInstallmentStatusLabel } from '@/lib/storage';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface EMICalendarProps {
  customer: Customer;
  loans: Loan[];
  onCollectPayment?: (loanId: string) => void;
}

export const EMICalendar: React.FC<EMICalendarProps> = ({
  customer,
  loans,
  onCollectPayment,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDayInstallments, setSelectedDayInstallments] = useState<{
    date: string;
    items: { loan: Loan; installment: Installment }[];
  } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Map all installments by YYYY-MM-DD date
  const installmentMap = new Map<string, { loan: Loan; installment: Installment }[]>();

  loans.forEach((loan) => {
    loan.installments.forEach((inst) => {
      const list = installmentMap.get(inst.dueDate) || [];
      list.push({ loan, installment: inst });
      installmentMap.set(inst.dueDate, list);
    });
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Customer EMI Calendar</h3>
            <p className="text-xs text-slate-400">Installment schedule and due calendar for {customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition"
          >
            {format(currentMonth, 'MMMM yyyy')}
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 uppercase tracking-wider">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysInMonth.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayItems = installmentMap.get(dateStr) || [];
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          const hasPaid = dayItems.some((i) => i.installment.status === 'Paid');
          const hasLate = dayItems.some((i) => i.installment.status === 'Late');
          const hasPending = dayItems.some((i) => i.installment.status === 'Pending');

          return (
            <div
              key={dateStr}
              onClick={() => {
                if (dayItems.length > 0) {
                  setSelectedDayInstallments({ date: dateStr, items: dayItems });
                }
              }}
              className={clsx(
                'min-h-[70px] p-1.5 rounded-xl border flex flex-col justify-between transition cursor-pointer',
                isCurrentMonth ? 'bg-slate-950/70 border-slate-800/80' : 'bg-slate-950/30 border-slate-900/50 opacity-40',
                isDayToday && 'border-blue-500/60 shadow-md shadow-blue-500/10',
                dayItems.length > 0 && 'hover:border-blue-400 hover:bg-slate-800/60'
              )}
            >
              <div className="flex justify-between items-center">
                <span
                  className={clsx(
                    'text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full',
                    isDayToday ? 'bg-blue-600 text-white' : 'text-slate-400'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayItems.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    {dayItems.length}
                  </span>
                )}
              </div>

              {dayItems.length > 0 && (
                <div className="space-y-0.5 mt-1">
                  {dayItems.slice(0, 2).map((item, idx) => {
                    const statusInfo = getDynamicInstallmentStatusLabel(item.installment);
                    return (
                      <div
                        key={idx}
                        className={clsx(
                          'text-[10px] font-semibold px-1 py-0.5 rounded truncate flex items-center justify-between',
                          statusInfo.badgeClass
                        )}
                      >
                        <span>{item.loan.id}</span>
                        <span>{formatCurrency(item.installment.amount)}</span>
                      </div>
                    );
                  })}
                  {dayItems.length > 2 && (
                    <p className="text-[9px] text-slate-500 font-semibold text-right">+{dayItems.length - 2} more</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Installments Drawer / Modal Preview */}
      {selectedDayInstallments && (
        <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-sm text-white">
              Due Installments on {format(parseISO(selectedDayInstallments.date), 'dd MMMM yyyy')}
            </h4>
            <button
              onClick={() => setSelectedDayInstallments(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {selectedDayInstallments.items.map((item, index) => {
              const statusInfo = getDynamicInstallmentStatusLabel(item.installment);
              return (
                <div
                  key={index}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.loan.id}</span>
                      <span className="text-xs text-slate-400">Inst #{item.installment.installmentNo}</span>
                      <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', statusInfo.badgeClass)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Amount: <strong className="text-slate-200">{formatCurrency(item.installment.amount)}</strong> | Paid:{' '}
                      <strong className="text-emerald-400">{formatCurrency(item.installment.paid)}</strong> | Pending:{' '}
                      <strong className="text-amber-400">{formatCurrency(item.installment.pending)}</strong>
                    </p>
                  </div>

                  {item.installment.pending > 0 && onCollectPayment && (
                    <button
                      onClick={() => onCollectPayment(item.loan.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
                    >
                      Collect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
