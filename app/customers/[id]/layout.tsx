import React from 'react';

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function CustomerDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
