# 🏦 Loan Management System (Single Lender)

A modern, offline-first **Loan Management System** built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**. Designed for personal single-lender operations with **100% browser LocalStorage persistence** and zero external database/API dependencies.

---

## ✨ Features

- **🔐 Local Storage Authentication**: Default credentials (`admin` / `admin123`) auto-created in browser storage. Includes live admin password change and logout.
- **📊 Lender Dashboard**: 8 KPI cards (Total Customers, Active/Completed Loans, Total Given, Collected, Pending Balance, Today's Collection, Overdue Loans) + Collection Reminders for Today's Due, Tomorrow Due, and Late Payments.
- **👥 Customer Directory & Profiles**:
  - Mandatory Name check + Unique Phone Number validation.
  - Base64 Customer Photo & ID Proof Document Upload.
  - Full customer profiles with interactive **EMI Calendar View**.
- **💰 Loan Issuance & Repayment Schedules**:
  - Support for `Daily`, `Weekly`, and `Monthly` repayment types.
  - Automatic installment schedule generation with day-0/today alignment.
  - Sequential ID generation (`CUS-000001`, `LN-000001`, `PAY-000001`).
  - Repayment amount validation rule (`Repayment > Principal`).
- **💳 Payment Collection Ledger**:
  - Collect payments via Cash, UPI, or Bank Transfer.
  - Real-time balance deduction, paid amount accumulation, and automatic loan closure upon zero balance.
- **📈 Reports & Data Backup Engine**:
  - Today/Week/Month collection metrics.
  - Customer-wise collection ledger summary.
  - One-click **JSON Backup Export** & **JSON Backup Restore** engine.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Storage**: Browser `LocalStorage` (JSON Format)

---

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/SAI-KIRAN-GOUD/loan-app.git

# Navigate into project directory
cd loan-app

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Default login:
- **Username**: `admin`
- **Password**: `admin123`

---

## ☁️ Deployment on Vercel

1. Push code to your GitHub repository.
2. Import project into [Vercel](https://vercel.com).
3. Click **Deploy** (No environment variables or cloud databases required).
