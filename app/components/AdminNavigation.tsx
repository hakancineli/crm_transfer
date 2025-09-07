'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEmoji } from '@/app/contexts/EmojiContext';
import { useModule } from '@/app/hooks/useModule';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface AdminNavigationProps {
  onClose?: () => void;
}

const AdminNavigation = ({ onClose }: AdminNavigationProps) => {
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
      href: '/admin/new-reservation',
      icon: '➕',
      description: t('admin.navigation.newReservation'),
      module: 'transfer'
    },
    {
      name: 'Uçuş Durumu',
      href: '/admin/flight-status',
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
      href: '/admin/reports',
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
      name: 'Müşteri Kurulumu',
      href: '/admin/customer-setup',
      icon: '🏢',
      description: 'Yeni müşteri şirketi kurulumu',
      module: 'transfer'
    },
    {
      name: 'İzin Yönetimi',
      href: '/admin/permissions',
      icon: '🔐',
      description: 'Kullanıcı izinlerini yönet',
      module: 'system'
    },
    {
      name: 'Denetim Logları',
      href: '/admin/audit-logs',
      icon: '📋',
      description: 'Sistem aktivite logları',
      module: 'system'
    },
    {
      name: 'Konaklama',
      href: '/admin/accommodation',
      icon: '🏨',
      description: 'Otel rezervasyon yönetimi',
      module: 'accommodation'
    },
    {
      name: 'Konaklama Rezervasyonları',
      href: '/admin/accommodation/reservations',
      icon: '📋',
      description: 'Tüm otel rezervasyonlarını görüntüle',
      module: 'accommodation'
    },
    {
      name: 'Konaklama Raporları',
      href: '/admin/accommodation/reports',
      icon: '📊',
      description: 'Detaylı analiz ve raporlar',
      module: 'accommodation'
    },
    {
      name: 'Otel Fiyat Havuzu',
      href: '/admin/accommodation/price-pool',
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
    <div className="bg-white shadow-lg border-r border-gray-200 h-full w-64 flex flex-col overflow-hidden">
      {/* Mobile Close Button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">ProTransfer</span>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 pt-6 flex-1 overflow-y-auto pb-4">
        {menuItems.map((item) => {
          // Check if item should be shown based on user permissions
          let shouldShow = true;
          
          // SUPERUSER can see everything
          if (user?.role === 'SUPERUSER') {
            shouldShow = true;
          } else {
            // Check specific permissions for non-superusers
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
            } else if (item.name === 'Müşteri Kurulumu') {
              shouldShow = false; // Only SUPERUSER can see this
            }
          }
          
          // Hem modül durumu hem de izin kontrolü
          if (!item.visible || !shouldShow) {
            return null;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose && onClose()}
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
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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