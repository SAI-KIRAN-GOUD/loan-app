import {
  AppData,
  Customer,
  Loan,
  Payment,
  Installment,
  RepaymentType,
  LoanStatus,
  InstallmentStatus,
} from '@/types';
import { format, addDays, addWeeks, addMonths, isBefore, isToday, parseISO, startOfDay } from 'date-fns';

export const STORAGE_KEY = 'loan_system_data';

const todayStr = format(new Date(), 'yyyy-MM-dd');

const initialInstallments = calculateInstallments(12000, 'Daily', 120, todayStr).installments.map((inst, idx) => {
  if (idx === 0) {
    return { ...inst, paid: 120, pending: 0, status: 'Paid' as const };
  }
  return inst;
});

export const DEFAULT_APP_DATA: AppData = {
  credentials: {
    username: 'admin',
    password: 'admin123',
  },
  customers: [
    {
      id: 'CUS-000001',
      name: 'Sai',
      phone: '9876543210',
      fatherName: 'Ramesh',
      address: 'Plot 12, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pin: '500033',
      occupation: 'Business',
      monthlyIncome: 50000,
      notes: 'Verified borrower',
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
      status: 'Active',
    },
  ],
  loans: [
    {
      id: 'LN-000001',
      customerId: 'CUS-000001',
      loanAmount: 10000,
      repaymentAmount: 12000,
      repaymentType: 'Daily',
      installmentAmount: 120,
      totalInstallments: 100,
      paidAmount: 120,
      remainingAmount: 11880,
      startDate: todayStr,
      dueDate: format(addDays(new Date(), 99), 'yyyy-MM-dd'),
      status: 'Active',
      notes: 'Daily collection loan',
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
      installments: initialInstallments,
    },
  ],
  payments: [
    {
      id: 'PAY-000001',
      loanId: 'LN-000001',
      customerId: 'CUS-000001',
      amount: 120,
      paymentMethod: 'Cash',
      paymentDate: todayStr,
      remarks: 'Day 1 initial collection',
    },
  ],
  settings: {
    currency: 'INR',
  },
};

export function loadAppData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_APP_DATA;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APP_DATA));
      return DEFAULT_APP_DATA;
    }
    const parsed = JSON.parse(raw);

    const parsedCustomers = Array.isArray(parsed.customers) ? parsed.customers : [];
    const parsedLoans = Array.isArray(parsed.loans) ? parsed.loans : [];
    const parsedPayments = Array.isArray(parsed.payments) ? parsed.payments : [];

    // If storage has no customers or loans yet, seed default initial data
    if (parsedCustomers.length === 0 && parsedLoans.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APP_DATA));
      return DEFAULT_APP_DATA;
    }

    const safeCustomers: Customer[] = parsedCustomers.map((c: any) => ({
      ...c,
      status: c.status || 'Active',
    }));

    const safeLoans: Loan[] = parsedLoans.map((l: any) => ({
      ...l,
      installments: Array.isArray(l.installments) ? l.installments : [],
      paidAmount: l.paidAmount ?? 0,
      remainingAmount: l.remainingAmount ?? (l.repaymentAmount || 0),
      status: l.status || 'Active',
    }));

    const safePayments: Payment[] = parsedPayments.map((p: any) => ({
      ...p,
      amount: p.amount ?? 0,
    }));

    return {
      credentials: parsed.credentials || DEFAULT_APP_DATA.credentials,
      customers: safeCustomers,
      loans: safeLoans,
      payments: safePayments,
      settings: parsed.settings || DEFAULT_APP_DATA.settings,
    };
  } catch (error) {
    console.error('Failed to load LocalStorage data:', error);
    return DEFAULT_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to LocalStorage:', error);
  }
}

// Sequential ID Generators
export function generateNextId(prefix: string, items: { id: string }[]): string {
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)$`);
  
  items.forEach((item) => {
    const match = item.id.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  return `${prefix}-${String(nextNum).padStart(6, '0')}`;
}

export function generateCustomerId(customers: Customer[]): string {
  return generateNextId('CUS', customers);
}

export function generateLoanId(loans: Loan[]): string {
  return generateNextId('LN', loans);
}

export function generatePaymentId(payments: Payment[]): string {
  return generateNextId('PAY', payments);
}

// Installments Schedule Generator
export function calculateInstallments(
  repaymentAmount: number,
  repaymentType: RepaymentType,
  installmentAmount: number,
  startDateStr: string
): { totalInstallments: number; installments: Installment[] } {
  if (!installmentAmount || installmentAmount <= 0) {
    installmentAmount = repaymentType === 'Daily' ? 100 : repaymentType === 'Weekly' ? 500 : 2000;
  }

  const totalInstallments = Math.max(1, Math.ceil(repaymentAmount / installmentAmount));
  const startDate = startDateStr ? parseISO(startDateStr) : new Date();
  const installments: Installment[] = [];

  let accumulated = 0;
  const today = startOfDay(new Date());

  for (let i = 1; i <= totalInstallments; i++) {
    let nextDueDate: Date;
    if (repaymentType === 'Daily') {
      nextDueDate = addDays(startDate, i - 1);
    } else if (repaymentType === 'Weekly') {
      nextDueDate = addWeeks(startDate, i - 1);
    } else {
      nextDueDate = addMonths(startDate, i - 1);
    }

    const currentAmount = i === totalInstallments ? repaymentAmount - accumulated : Math.min(installmentAmount, repaymentAmount - accumulated);
    accumulated += currentAmount;

    const dueDateStr = format(nextDueDate, 'yyyy-MM-dd');
    let status: InstallmentStatus = 'Pending';
    if (isBefore(startOfDay(nextDueDate), today)) {
      status = 'Late';
    }

    installments.push({
      installmentNo: i,
      dueDate: dueDateStr,
      amount: currentAmount,
      paid: 0,
      pending: currentAmount,
      status,
    });
  }

  return { totalInstallments, installments };
}

export function getDynamicInstallmentStatusLabel(inst: Installment): {
  label: 'Paid' | 'Due Today' | 'Overdue' | 'Upcoming' | 'Skipped';
  badgeClass: string;
} {
  if (inst.pending <= 0 || inst.paid >= inst.amount) {
    return { label: 'Paid', badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' };
  }
  if (inst.status === 'Skipped') {
    return { label: 'Skipped', badgeClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/20' };
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  if (inst.dueDate < todayStr) {
    return { label: 'Overdue', badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold animate-pulse' };
  }
  if (inst.dueDate === todayStr) {
    return { label: 'Due Today', badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold' };
  }
  return { label: 'Upcoming', badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/20' };
}

// Helper to update installment statuses based on current date and payments
export function updateLoanInstallmentStatuses(loan: Loan): Loan {
  const today = startOfDay(new Date());

  const updatedInstallments = loan.installments.map((inst) => {
    if (inst.pending <= 0) {
      return { ...inst, status: 'Paid' as InstallmentStatus };
    }
    
    if (inst.status !== 'Skipped') {
      const instDueDate = parseISO(inst.dueDate);
      if (isBefore(startOfDay(instDueDate), today)) {
        return { ...inst, status: 'Late' as InstallmentStatus };
      }
    }
    return inst;
  });

  return {
    ...loan,
    installments: updatedInstallments,
  };
}

// Format Currency
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
