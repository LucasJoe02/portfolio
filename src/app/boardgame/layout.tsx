import Navbar from '@/components/Navbar';
import React from 'react';

export default function BoardgameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
