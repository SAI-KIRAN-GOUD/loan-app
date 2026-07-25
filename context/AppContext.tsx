'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppData,
  Customer,
  Loan,
  Payment,
  Credentials,
  DashboardMetrics,
  Installment,
} from '@/types';
import {
  loadAppData,
  saveAppData,
  generateCustomerId,
  generateLoanId,
  generatePaymentId,
  calculateInstallments,
  DEFAULT_APP_DATA,
} from '@/lib/storage';
import { format, parseISO, isToday, addDays, isBefore, startOfDay } from 'date-fns';

interface AppContextType {
  data: AppData;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => boolean;
  logout: () => void;
  changePassword: (newPassword: string) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt'>) => { success: boolean; error?: string; customer?: Customer };
  updateCustomer: (customer: Customer) => { success: boolean; error?: string };
  addLoan: (loanData: Omit<Loan, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'createdAt' | 'installments'> & { installmentAmount: number }) => { success: boolean; error?: string; loan?: Loan };
  updateLoanStatus: (loanId: string, status: Loan['status']) => void;
  addPayment: (paymentData: Omit<Payment, 'id'>) => { success: boolean; error?: string; payment?: Payment };
  updateInstallmentStatus: (loanId: string, installmentNo: number, status: Installment['status']) => void;
  importData: (jsonData: string) => { success: boolean; error?: string };
  exportData: () => void;
  resetData: () => void;
  getDashboardMetrics: () => DashboardMetrics;
  getReminders: () => {
    todayDue: { loan: Loan; customer: Customer; installment: Installment }[];
    tomorrowDue: { loan: Loan; customer: Customer; installment: Installment }[];
    latePayments: { loan: Loan; customer: Customer; installment: Installment }[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadedData = loadAppData();
    setData(loadedData);

    // Check if auth session exists in sessionStorage
    const authSession = sessionStorage.getItem('loan_auth_session');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoaded(true);
  }, []);

  const updateState = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  const login = (credentials: Credentials): boolean => {
    if (
      credentials.username === data.credentials.username &&
      credentials.password === data.credentials.password
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('loan_auth_session', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('loan_auth_session');
  };

  const changePassword = (newPassword: string) => {
    const updated: AppData = {
      ...data,
      credentials: {
        ...data.credentials,
        password: newPassword,
      },
    };
    updateState(updated);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    // Validation: Phone uniqueness if entered
    if (customerData.phone && customerData.phone.trim() !== '') {
      const existingPhone = data.customers.find(
        (c) => c.phone && c.phone.trim() === customerData.phone?.trim()
      );
      if (existingPhone) {
        return { success: false, error: `Phone number '${customerData.phone}' is already registered to ${existingPhone.name}.` };
      }
    }

    const newId = generateCustomerId(data.customers);
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
      status: customerData.status || 'Active',
    };

    const updated: AppData = {
      ...data,
      customers: [newCustomer, ...data.customers],
    };

    updateState(updated);
    return { success: true, customer: newCustomer };
  };

  const updateCustomer = (updatedCust: Customer) => {
    if (updatedCust.phone && updatedCust.phone.trim() !== '') {
      const phoneTrimmed = updatedCust.phone.trim();
      const existingPhone = data.customers.find(
        (c) => c.id !== updatedCust.id && c.phone && c.phone.trim() === phoneTrimmed
      );
      if (existingPhone) {
        return { success: false, error: `Phone number '${updatedCust.phone}' is already used by ${existingPhone.name}.` };
      }
    }

    const updatedCustomers = data.customers.map((c) => (c.id === updatedCust.id ? updatedCust : c));
    updateState({ ...data, customers: updatedCustomers });
    return { success: true };
  };

  const addLoan = (
    loanData: Omit<Loan, 'id' | 'paidAmount' | 'remainingAmount' | 'status' | 'createdAt' | 'installments'> & { installmentAmount: number }
  ) => {
    if (loanData.repaymentAmount < loanData.loanAmount) {
      return { success: false, error: 'Repayment amount cannot be less than loan amount.' };
    }

    // Generate schedule
    const { totalInstallments, installments } = calculateInstallments(
      loanData.repaymentAmount,
      loanData.repaymentType,
      loanData.installmentAmount,
      loanData.startDate
    );

    const newLoanId = generateLoanId(data.loans);
    const newLoan: Loan = {
      ...loanData,
      id: newLoanId,
      totalInstallments,
      paidAmount: 0,
      remainingAmount: loanData.repaymentAmount,
      status: 'Active',
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
      installments,
    };

    const updated: AppData = {
      ...data,
      loans: [newLoan, ...data.loans],
    };

    updateState(updated);
    return { success: true, loan: newLoan };
  };

  const updateLoanStatus = (loanId: string, status: Loan['status']) => {
    const updatedLoans = data.loans.map((l) => {
      if (l.id === loanId) {
        let remainingAmount = l.remainingAmount;
        if (status === 'Closed') {
          remainingAmount = 0;
        }
        return { ...l, status, remainingAmount };
      }
      return l;
    });
    updateState({ ...data, loans: updatedLoans });
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const targetLoan = data.loans.find((l) => l.id === paymentData.loanId);
    if (!targetLoan) {
      return { success: false, error: 'Target loan not found.' };
    }

    if (paymentData.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    if (paymentData.amount > targetLoan.remainingAmount) {
      return { success: false, error: `Payment amount (${paymentData.amount}) cannot exceed remaining balance (${targetLoan.remainingAmount}).` };
    }

    const newPaymentId = generatePaymentId(data.payments);
    const newPayment: Payment = {
      ...paymentData,
      id: newPaymentId,
    };

    const newPaidAmount = targetLoan.paidAmount + paymentData.amount;
    const newRemainingAmount = Math.max(0, targetLoan.repaymentAmount - newPaidAmount);
    const isFullyPaid = newRemainingAmount === 0;

    // Apply payment sequentially across installments
    let remainingToApply = paymentData.amount;
    const updatedInstallments = targetLoan.installments.map((inst) => {
      if (remainingToApply <= 0 || inst.pending <= 0) {
        return inst;
      }
      const applied = Math.min(remainingToApply, inst.pending);
      remainingToApply -= applied;
      const newPaid = inst.paid + applied;
      const newPending = inst.pending - applied;
      const newStatus: Installment['status'] = newPending === 0 ? 'Paid' : inst.status;

      return {
        ...inst,
        paid: newPaid,
        pending: newPending,
        status: newStatus,
      };
    });

    const updatedLoan: Loan = {
      ...targetLoan,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: isFullyPaid ? 'Closed' : targetLoan.status,
      installments: updatedInstallments,
    };

    const updatedLoans = data.loans.map((l) => (l.id === updatedLoan.id ? updatedLoan : l));
    const updatedPayments = [newPayment, ...data.payments];

    updateState({
      ...data,
      loans: updatedLoans,
      payments: updatedPayments,
    });

    return { success: true, payment: newPayment };
  };

  const updateInstallmentStatus = (loanId: string, installmentNo: number, status: Installment['status']) => {
    const updatedLoans = data.loans.map((l) => {
      if (l.id === loanId) {
        const updatedInsts = l.installments.map((inst) => {
          if (inst.installmentNo === installmentNo) {
            return { ...inst, status };
          }
          return inst;
        });
        return { ...l, installments: updatedInsts };
      }
      return l;
    });
    updateState({ ...data, loans: updatedLoans });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.credentials || !Array.isArray(parsed.customers) || !Array.isArray(parsed.loans)) {
        return { success: false, error: 'Invalid JSON format. Missing required root keys.' };
      }
      updateState(parsed as AppData);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: `JSON Parse error: ${e.message}` };
    }
  };

  const exportData = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan_system_backup_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetData = () => {
    updateState(DEFAULT_APP_DATA);
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const totalCustomers = data.customers.length;
    const activeLoans = data.loans.filter((l) => l.status === 'Active').length;
    const completedLoans = data.loans.filter((l) => l.status === 'Closed').length;

    const totalGiven = data.loans.reduce((acc, l) => acc + (l.loanAmount || 0), 0);
    const totalCollected = data.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingAmount = data.loans.reduce((acc, l) => acc + (l.remainingAmount || 0), 0);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayCollection = data.payments
      .filter((p) => p.paymentDate && p.paymentDate.startsWith(todayStr))
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const todayObj = startOfDay(new Date());
    const overdueLoans = (data.loans || []).filter((l) => {
      if (!l || l.status !== 'Active') return false;
      const insts = l.installments || [];
      return insts.some((inst) => {
        if (!inst || inst.pending <= 0 || !inst.dueDate) return false;
        try {
          const dueObj = parseISO(inst.dueDate);
          if (isNaN(dueObj.getTime())) return false;
          return isBefore(startOfDay(dueObj), todayObj);
        } catch (e) {
          return false;
        }
      });
    }).length;

    return {
      totalCustomers,
      activeLoans,
      completedLoans,
      totalGiven,
      totalCollected,
      pendingAmount,
      todayCollection,
      overdueLoans,
    };
  };

  const getReminders = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const todayObj = startOfDay(new Date());

    const customerMap = new Map((data.customers || []).map((c) => [c.id, c]));

    const todayDue: { loan: Loan; customer: Customer; installment: Installment }[] = [];
    const tomorrowDue: { loan: Loan; customer: Customer; installment: Installment }[] = [];
    const latePayments: { loan: Loan; customer: Customer; installment: Installment }[] = [];

    (data.loans || []).forEach((loan) => {
      if (!loan || loan.status !== 'Active') return;
      const customer = customerMap.get(loan.customerId);
      if (!customer) return;

      const insts = loan.installments || [];
      insts.forEach((inst) => {
        if (!inst || inst.pending <= 0 || !inst.dueDate) return;

        if (inst.dueDate === todayStr) {
          todayDue.push({ loan, customer, installment: inst });
        } else if (inst.dueDate === tomorrowStr) {
          tomorrowDue.push({ loan, customer, installment: inst });
        } else {
          try {
            const dueObj = parseISO(inst.dueDate);
            if (!isNaN(dueObj.getTime()) && isBefore(startOfDay(dueObj), todayObj)) {
              latePayments.push({ loan, customer, installment: inst });
            }
          } catch (e) {
            // ignore invalid dates
          }
        }
      });
    });

    return { todayDue, tomorrowDue, latePayments };
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        data,
        isAuthenticated,
        login,
        logout,
        changePassword,
        addCustomer,
        updateCustomer,
        addLoan,
        updateLoanStatus,
        addPayment,
        updateInstallmentStatus,
        importData,
        exportData,
        resetData,
        getDashboardMetrics,
        getReminders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
