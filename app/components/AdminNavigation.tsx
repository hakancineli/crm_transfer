'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEmoji } from '@/app/contexts/EmojiContext';
import { useModule } from '@/app/hooks/useModule';
import { useLanguage } from '@/app/contexts/LanguageContext';

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user, logout } = useAuth();
  const { emojisEnabled } = useEmoji();
  const { t, dir } = useLanguage();
  const accommodationEnabled = useModule('accommodation');
  const flightEnabled = useModule('flight');


  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);


  const allMenuItems = [
    {
      name: t('admin.navigation.dashboard'),
      href: '/admin',
      icon: '🏠',
      description: t('admin.navigation.dashboard'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.reservations'),
      href: '/admin/reservations',
      icon: '📋',
      description: t('admin.navigation.reservations'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.newReservation'),
      href: '/new-reservation',
      icon: '➕',
      description: t('admin.navigation.newReservation'),
      module: 'transfer'
    },
    {
      name: 'Uçuş Durumu',
      href: '/flight-status',
      icon: '✈️',
      description: 'Uçuş takibi ve durumu',
      module: 'flight'
    },
    {
      name: t('admin.navigation.drivers'),
      href: '/admin/drivers',
      icon: '👨‍✈️',
      description: t('admin.navigation.drivers'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.reports'),
      href: '/reports',
      icon: '📈',
      description: t('admin.navigation.reports'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.accounting'),
      href: '/admin/accounting',
      icon: '💰',
      description: t('admin.navigation.accounting'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.customers'),
      href: '/admin/customers',
      icon: '👥',
      description: t('admin.navigation.customers'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.activities'),
      href: '/admin/activities',
      icon: '📋',
      description: t('admin.navigation.activities'),
      module: 'transfer'
    },
    {
      name: t('admin.navigation.users'),
      href: '/admin/users',
      icon: '👤',
      description: t('admin.navigation.users'),
      module: 'transfer'
    },
    {
      name: 'Konaklama',
      href: '/accommodation',
      icon: '🏨',
      description: 'Otel rezervasyon yönetimi',
      module: 'accommodation'
    },
    {
      name: 'Konaklama Rezervasyonları',
      href: '/accommodation/reservations',
      icon: '📋',
      description: 'Tüm otel rezervasyonlarını görüntüle',
      module: 'accommodation'
    },
    {
      name: 'Konaklama Raporları',
      href: '/accommodation/reports',
      icon: '📊',
      description: 'Detaylı analiz ve raporlar',
      module: 'accommodation'
    },
    {
      name: 'Otel Fiyat Havuzu',
      href: '/accommodation/price-pool',
      icon: '🏨',
      description: 'Tüm satış personelinin görebileceği fiyatlar',
      module: 'accommodation'
    },
    {
      name: t('admin.navigation.settings'),
      href: '/admin/settings',
      icon: '⚙️',
      description: t('admin.navigation.settings'),
      module: 'transfer'
    }
  ];

  // Modül durumuna göre menü öğelerini filtrele
  // Sıralamayı sabit tutmak için filter yerine map kullan
  const menuItems = allMenuItems.map(item => ({
    ...item,
    visible: item.module === 'transfer' || 
             (item.module === 'accommodation' && accommodationEnabled) ||
             (item.module === 'flight' && flightEnabled)
  }));

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
          
          // Hem modül durumu hem de izin kontrolü
          if (!item.visible || !shouldShow) {
            return null;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-2xl">{isClient && emojisEnabled ? item.icon : ''}</span>
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
        {user ? (
          <>
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
                if (confirm(t('admin.navigation.logout'))) {
                  logout();
                }
              }}
              className="w-full mt-3 text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"
              title={t('admin.navigation.logout')}
            >
              {isClient && emojisEnabled ? '🚪 ' : ''}{t('admin.navigation.logout')}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-3">
              Giriş yapmamışsınız
            </div>
            <a
              href="/admin-login"
              className="w-full inline-block bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isClient && emojisEnabled ? '🔑 ' : ''}Giriş Yap
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavigation;