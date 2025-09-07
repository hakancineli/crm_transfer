'use client';

import AdminNavigation from '@/app/components/AdminNavigation';
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
      {/* Hamburger button - positioned below global header */}
      <div className="fixed top-20 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white shadow-md border border-gray-200"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
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
