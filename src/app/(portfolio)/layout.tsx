import MainLayout from '@/components/MainLayout';
import React from 'react';

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
