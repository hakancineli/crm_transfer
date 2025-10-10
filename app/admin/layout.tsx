'use client';

import AdminNavigation from '@/app/components/AdminNavigation';
import Header from '@/app/components/ui/Header';
import { TenantProvider } from '@/app/contexts/TenantContext';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      setSidebarOpen(isDesktop);
    }
  }, []);

  return (
    <TenantProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Global Header with sidebar toggle */}
      <Header 
        showSidebarToggle={true}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Overlay when sidebar is open - only on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-40 lg:hidden transition-opacity duration-500 ease-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 w-64 bg-white shadow-2xl transform transition-all duration-700 ease-out will-change-transform z-30 print:hidden ${
        sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full shadow-none'
      }`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
        <AdminNavigation onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'} min-h-screen overflow-x-hidden pt-16 transition-all duration-700 ease-out`}>
        <div className={`${sidebarOpen ? 'lg:px-6 px-4' : 'px-6'} max-w-7xl mx-auto`}>
          {children}
        </div>
      </main>
    </div>
    </TenantProvider>
  );
}
