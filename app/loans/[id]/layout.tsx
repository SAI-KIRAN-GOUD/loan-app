import React from 'react';

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function LoanDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
