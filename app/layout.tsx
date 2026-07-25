import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import LayoutContent from './layout-content';

export const metadata: Metadata = {
  title: 'Loan Management System | Offline LocalStorage App',
  description: 'Modern single lender loan management system powered by browser LocalStorage JSON store.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen" suppressHydrationWarning>
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}
