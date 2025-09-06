'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canViewReports, canViewAccounting, canManageUsers, canManageActivities } from '@/app/lib/permissions';

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('SUPERUSER'); // Default to superuser for now

  useEffect(() => {
    // Get user role from localStorage or context
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role || 'SUPERUSER');
    }
  }, []);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '📊',
      description: 'Genel durum ve istatistikler'
    },
    {
      name: 'Rezervasyonlar',
      href: '/reservations',
      icon: '📋',
      description: 'Tüm rezervasyonları yönet'
    },
    {
      name: 'Yeni Rezervasyon',
      href: '/new-reservation',
      icon: '➕',
      description: 'Yeni rezervasyon oluştur'
    },
    {
      name: 'Uçuş Durumu',
      href: '/flight-status',
      icon: '✈️',
      description: 'Uçuş takibi ve durumu'
    },
    {
      name: 'Şoförler',
      href: '/admin/drivers',
      icon: '👨‍✈️',
      description: 'Şoför yönetimi'
    },
    {
      name: 'Raporlar',
      href: '/reports',
      icon: '📈',
      description: 'Detaylı raporlar ve analizler',
      show: canViewReports(userRole)
    },
    {
      name: 'Muhasebe',
      href: '/admin/accounting',
      icon: '💰',
      description: 'Muhasebe ve ödeme yönetimi',
      show: canViewAccounting(userRole)
    },
    {
      name: 'Müşteriler',
      href: '/admin/customers',
      icon: '👥',
      description: 'Müşteri yönetimi'
    },
    {
      name: 'Son Aktiviteler',
      href: '/admin/activities',
      icon: '📋',
      description: 'Sistem logları ve aktiviteler',
      show: canManageActivities(userRole)
    },
    {
      name: 'Ayarlar',
      href: '/admin/settings',
      icon: '⚙️',
      description: 'Sistem ayarları'
    }
  ];

  return (
    <div className="bg-white shadow-lg border-r border-gray-200 min-h-screen w-64">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">ProTransfer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          // Check if item should be shown based on permissions
          if (item.show !== undefined && !item.show) {
            return null;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="text-xl">{item.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 group-hover:text-green-600">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">A</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">admin@protransfer.com</div>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
              // Activity log
              fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: 'admin', // This should be dynamic
                  action: 'LOGOUT',
                  entityType: 'SYSTEM',
                  description: 'Admin çıkış yaptı',
                  ipAddress: '127.0.0.1' // This should be dynamic
                })
              }).catch(console.error);
              
              // Clear session and redirect
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/';
            }
          }}
          className="w-full mt-3 text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"
          title="Çıkış Yap"
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default AdminNavigation;
