'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '🏠',
      description: 'Ana sayfa'
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
      description: 'Detaylı raporlar ve analizler'
    },
    {
      name: 'Muhasebe',
      href: '/admin/accounting',
      icon: '💰',
      description: 'Muhasebe ve ödeme yönetimi'
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
      description: 'Sistem logları ve aktiviteler'
    },
    {
      name: 'Ayarlar',
      href: '/admin/settings',
      icon: '⚙️',
      description: 'Sistem ayarları'
    },
    {
      name: 'Kullanıcılar',
      href: '/admin/users',
      icon: '👤',
      description: 'Kullanıcı yönetimi'
    },
    {
      name: 'Modül Yönetimi',
      href: '/admin/modules',
      icon: '🔧',
      description: 'Modül ve firma yönetimi'
    },
    {
      name: 'Konaklama',
      href: '/accommodation',
      icon: '🏨',
      description: 'Otel rezervasyon yönetimi'
    },
    {
      name: 'Konaklama Rezervasyonları',
      href: '/accommodation/reservations',
      icon: '📋',
      description: 'Tüm otel rezervasyonlarını görüntüle'
    },
    {
      name: 'Konaklama Raporları',
      href: '/accommodation/reports',
      icon: '📊',
      description: 'Detaylı analiz ve raporlar'
    },
    {
      name: 'Otel Fiyat Havuzu',
      href: '/accommodation/price-pool',
      icon: '🏨',
      description: 'Tüm satış personelinin görebileceği fiyatlar'
    }
  ];

  return (
    <div className="bg-white shadow-lg border-r border-gray-200 h-screen w-64 fixed left-0 top-16 z-40 flex flex-col">
      {/* Navigation */}
      <nav className="p-4 space-y-2 pt-6 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Check if item should be shown based on user permissions
          let shouldShow = true;
          
          if (item.name === 'Yeni Rezervasyon') {
            shouldShow = user?.permissions?.some(p => 
              p.permission === 'VIEW_OWN_SALES' && p.isActive
            ) || false;
          } else if (item.name === 'Raporlar') {
            shouldShow = user?.permissions?.some(p => 
              p.permission === 'VIEW_REPORTS' && p.isActive
            ) || false;
          } else if (item.name === 'Muhasebe') {
            shouldShow = user?.permissions?.some(p => 
              p.permission === 'VIEW_ACCOUNTING' && p.isActive
            ) || false;
          } else if (item.name === 'Son Aktiviteler') {
            shouldShow = user?.permissions?.some(p => 
              p.permission === 'MANAGE_ACTIVITIES' && p.isActive
            ) || false;
          } else if (item.name === 'Kullanıcılar') {
            shouldShow = user?.permissions?.some(p => 
              p.permission === 'MANAGE_USERS' && p.isActive
            ) || false;
          }
          
          if (!shouldShow) {
            return null;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {user?.name || 'Admin User'}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email || 'admin@protransfer.com'}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
              logout();
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