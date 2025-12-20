import React from 'react';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      <Header />
      
      <main className="ml-64 pt-16">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}