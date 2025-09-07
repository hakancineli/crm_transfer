'use client';

import AdminNavigation from '@/app/components/AdminNavigation';
import Header from '@/app/components/ui/Header';
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
    <div className="min-h-screen bg-gray-50">
      {/* Global Header with sidebar toggle */}
      <Header 
        showSidebarToggle={true}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Overlay when sidebar is open - only on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
        <AdminNavigation onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : ''} min-h-screen overflow-x-hidden pt-16`}>
        {children}
      </main>
    </div>
  );
}
