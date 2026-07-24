export type RepaymentType = 'Daily' | 'Weekly' | 'Monthly';

export type LoanStatus = 'Active' | 'Closed' | 'Defaulted';

export type InstallmentStatus = 'Paid' | 'Pending' | 'Late' | 'Skipped';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank';

export type CustomerStatus = 'Active' | 'Inactive';

export interface Credentials {
  username: string;
  password: string;
}

export interface Customer {
  id: string; // CUS-000001
  name: string;
  phone?: string;
  fatherName?: string;
  address?: string;
  village?: string;
  city?: string;
  state?: string;
  pin?: string;
  aadhaar?: string;
  pan?: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  referencePerson?: string;
  referencePhone?: string;
  notes?: string;
  photo?: string; // Base64
  idProof?: string; // Base64
  createdAt: string;
  status: CustomerStatus;
}

export interface Installment {
  installmentNo: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  paid: number;
  pending: number;
  status: InstallmentStatus;
}

export interface Loan {
  id: string; // LN-000001
  customerId: string;
  loanAmount: number;
  repaymentAmount: number;
  repaymentType: RepaymentType;
  installmentAmount: number;
  totalInstallments: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: LoanStatus;
  notes?: string;
  createdAt: string;
  installments: Installment[];
}

export interface Payment {
  id: string; // PAY-000001
  loanId: string;
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string; // YYYY-MM-DD or ISO string
  remarks?: string;
}

export interface AppSettings {
  currency: string;
}

export interface AppData {
  credentials: Credentials;
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  settings: AppSettings;
}

export interface DashboardMetrics {
  totalCustomers: number;
  activeLoans: number;
  completedLoans: number;
  totalGiven: number;
  totalCollected: number;
  pendingAmount: number;
  todayCollection: number;
  overdueLoans: number;
}
