'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEmoji } from '@/app/contexts/EmojiContext';
import { useModule } from '@/app/hooks/useModule';
import { useLanguage } from '@/app/contexts/LanguageContext';
import ReservationTypeSelector from './ReservationTypeSelector';
import { useTenant } from '@/app/contexts/TenantContext';

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
  const tourEnabled = useModule('tour');
  const websiteEnabled = useModule('website');
  const { selectedTenantId, setSelectedTenantId, tenants, refreshTenants } = useTenant();


  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user?.role === 'SUPERUSER') refreshTenants();
  }, [user?.role, refreshTenants]);


  // Rol bazlı menü sıralaması - Yeniden düzenlenmiş
  const getMenuItemsByRole = (role: string) => {
    const baseMenuItems = [
      // 1. Dashboard - Her zaman en üstte
      {
        name: t('admin.navigation.dashboard'),
        href: '/admin',
        icon: '🏠',
        description: t('admin.navigation.dashboard'),
        module: 'transfer',
        order: 1
      },
      // 2. Yeni Rezervasyon - En sık kullanılan
      {
        name: t('admin.navigation.newReservation'),
        href: '/admin/new-reservation',
        icon: '➕',
        description: t('admin.navigation.newReservation'),
        module: 'transfer',
        order: 2,
        isSpecial: true // Özel component kullanılacak
      },
      // 3. Tüm Rezervasyonlar - Rezervasyon yönetimi
      {
        name: role === 'SUPERUSER' ? t('admin.navigation.allReservations') : t('admin.navigation.reservations'),
        href: '/admin/reservations',
        icon: '📋',
        description: t('admin.navigation.reservations'),
        module: 'transfer',
        order: 3
      },
      // 4. Müşteriler - Müşteri yönetimi
      {
        name: t('admin.navigation.customers'),
        href: '/admin/customers',
        icon: '👥',
        description: t('admin.navigation.customers'),
        module: 'transfer',
        order: 4
      },
      // 5. Şoförler - Şoför yönetimi
      {
        name: t('admin.navigation.drivers'),
        href: '/admin/drivers',
        icon: '👨‍✈️',
        description: t('admin.navigation.drivers'),
        module: 'transfer',
        order: 5
      },
      // 6. Muhasebe - Finansal işlemler
      {
        name: t('admin.navigation.accounting'),
        href: '/admin/accounting',
        icon: '💰',
        description: t('admin.navigation.accounting'),
        module: 'transfer',
        order: 6
      },
      // 7. Raporlar - Analiz ve raporlar
      {
        name: t('admin.navigation.reports'),
        href: '/admin/reports',
        icon: '📈',
        description: t('admin.navigation.reports'),
        module: 'transfer',
        order: 7
      },
      // 8. Uçuş Durumu - Uçuş takibi
      {
        name: t('admin.navigation.flightStatus'),
        href: '/admin/flight-status',
        icon: '✈️',
        description: t('admin.navigation.flightStatusDesc'),
        module: 'flight',
        order: 8
      },
      // 9. Son Aktiviteler - Sistem aktiviteleri
      {
        name: t('admin.navigation.activities'),
        href: '/admin/activities',
        icon: '📋',
        description: t('admin.navigation.activities'),
        module: 'transfer',
        order: role === 'SUPERUSER' ? 9 : 999
      },
      // 10. Kullanıcılar - Kullanıcı yönetimi (sadece yetkili roller)
      {
        name: t('admin.navigation.users'),
        href: '/admin/users',
        icon: '👤',
        description: t('admin.navigation.users'),
        module: 'transfer',
        order: role === 'SUPERUSER' ? 10 : (role === 'AGENCY_ADMIN' ? 10 : 999)
      },
      // 11. Şirketler - Şirket yönetimi (sadece SUPERUSER)
      {
        name: t('admin.navigation.companies'),
        href: '/admin/companies',
        icon: '🏢',
        description: t('admin.navigation.companiesDesc'),
        module: 'system',
        order: role === 'SUPERUSER' ? 11 : 999
      },
      // 12. Denetim Logları - Sistem logları (sadece SUPERUSER)
      {
        name: t('admin.navigation.auditLogs'),
        href: '/admin/audit-logs',
        icon: '📋',
        description: t('admin.navigation.auditLogsDesc'),
        module: 'system',
        order: role === 'SUPERUSER' ? 12 : 999
      },
      // 13. Personel Performansı - Performans analizi
      {
        name: t('admin.navigation.performance'),
        href: '/admin/performance',
        icon: '📊',
        description: t('admin.navigation.performanceDesc'),
        module: 'system',
        order: role === 'SUPERUSER' ? 13 : (role === 'AGENCY_ADMIN' ? 13 : 999)
      },
      // 14. Konaklama - Otel rezervasyon yönetimi
      {
        name: 'Konaklama',
        href: '/admin/accommodation',
        icon: '🏨',
        description: 'Otel rezervasyon yönetimi',
        module: 'accommodation',
        order: 14
      },
      // 15. Konaklama Rezervasyonları
      {
        name: 'Konaklama Rezervasyonları',
        href: '/admin/accommodation/reservations',
        icon: '📋',
        description: 'Tüm otel rezervasyonlarını görüntüle',
        module: 'accommodation',
        order: 15
      },
      // 16. Konaklama Raporları
      {
        name: 'Konaklama Raporları',
        href: '/admin/accommodation/reports',
        icon: '📊',
        description: 'Detaylı analiz ve raporlar',
        module: 'accommodation',
        order: 16
      },
      // 17. Otel Fiyat Havuzu
      {
        name: 'Otel Fiyat Havuzu',
        href: '/admin/accommodation/price-pool',
        icon: '🏨',
        description: 'Tüm satış personelinin görebileceği fiyatlar',
        module: 'accommodation',
        order: 17
      },
      // 18. Website - Website yönetimi
      {
        name: t('admin.navigation.website'),
        href: '/admin/website',
        icon: '🌐',
        description: t('admin.navigation.websiteDesc'),
        module: 'website',
        order: 18
      },
      // 19. Tur - Tur yönetimi
      {
        name: t('admin.navigation.tour'),
        href: '/admin/tour',
        icon: '🚌',
        description: t('admin.navigation.tourDesc'),
        module: 'tour',
        order: 19
      },
      // 20. Tur Rezervasyonları
      {
        name: t('admin.navigation.tourReservations'),
        href: '/admin/tour/reservations',
        icon: '📋',
        description: t('admin.navigation.tourReservationsDesc'),
        module: 'tour',
        order: 20
      },
      // 21. Tur Rotaları
      {
        name: t('admin.navigation.tourRoutes'),
        href: '/admin/tour/routes',
        icon: '🗺️',
        description: t('admin.navigation.tourRoutesDesc'),
        module: 'tour',
        order: 21
      },
      // 22. Tur Araçları
      {
        name: t('admin.navigation.tourVehicles'),
        href: '/admin/tour/vehicles',
        icon: '🚐',
        description: t('admin.navigation.tourVehiclesDesc'),
        module: 'tour',
        order: 22
      },
      // 23. U-ETDS - Ulaştırma sistemi
      {
        name: t('admin.navigation.uetds'),
        href: '/admin/uetds',
        icon: '🚌',
        description: t('admin.navigation.uetdsDesc'),
        module: 'transfer',
        order: 23
      },
      // 24. Modül Yönetimi - Sistem modülleri (sadece SUPERUSER)
      {
        name: t('admin.navigation.modules'),
        href: '/admin/modules',
        icon: '🔧',
        description: t('admin.navigation.modulesDesc'),
        module: 'system',
        order: role === 'SUPERUSER' ? 24 : 999
      },
      // 25. Ayarlar - Sistem ayarları (sadece SUPERUSER)
      {
        name: t('admin.navigation.settings'),
        href: '/admin/settings',
        icon: '⚙️',
        description: t('admin.navigation.settingsDesc'),
        module: 'transfer',
        order: role === 'SUPERUSER' ? 25 : 999
      },
      // 26. Acente Ayarları - Acente özel ayarları
      {
        name: t('admin.navigation.tenantSettings'),
        href: '/admin/tenant-settings',
        icon: '🏢',
        description: t('admin.navigation.tenantSettingsDesc'),
        module: 'transfer',
        order: role === 'SUPERUSER' ? 26 : (role === 'AGENCY_ADMIN' ? 26 : 999)
      }
    ];

    // Order'a göre sırala ve 999 olanları filtrele
    return baseMenuItems
      .filter(item => item.order < 999)
      .sort((a, b) => a.order - b.order);
  };

  const allMenuItems = getMenuItemsByRole(user?.role || '');

  // Modül durumuna göre menü öğelerini filtrele
  // Sıralamayı sabit tutmak için filter yerine map kullan
  const menuItems = allMenuItems.map(item => ({
    ...item,
    visible: item.module === 'transfer' || 
             item.module === 'system' ||
             (item.module === 'accommodation' && accommodationEnabled) ||
             (item.module === 'flight' && flightEnabled) ||
             (item.module === 'tour' && tourEnabled) ||
             (item.module === 'website' && websiteEnabled)
  }));

  return (
    <div className="bg-white shadow-lg border-r border-gray-200 h-full w-64 flex flex-col overflow-hidden">
      {/* Mobile Close Button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">ProTransfer</span>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 pt-6 flex-1 overflow-y-auto pb-4">
        {user?.role === 'SUPERUSER' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-xs text-amber-700 mb-2">Tenant Seçimi (Sadece SUPERUSER)</div>
            <select
              className="w-full border border-amber-300 rounded-md text-sm px-2 py-1 bg-white"
              value={selectedTenantId || ''}
              onChange={(e) => setSelectedTenantId(e.target.value || null)}
            >
              <option value="">— Tenant seçiniz —</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.companyName}
                </option>
              ))}
            </select>
          </div>
        )}
        {menuItems.map((item) => {
          // Check if item should be shown based on user permissions
          let shouldShow = true;
          
          
          // SUPERUSER can see everything
          if (user?.role === 'SUPERUSER') {
            shouldShow = true;
          } else {
            // Check specific permissions for non-superusers
            if (item.name === 'Yeni Rezervasyon') {
              // AGENCY_ADMIN her zaman görsün; diğer roller izinle görsün
              if (user?.role === 'AGENCY_ADMIN') {
                shouldShow = true;
              } else {
                shouldShow = user?.permissions?.some(p => 
                  p.permission === 'VIEW_OWN_SALES' && p.isActive
                ) || false;
              }
            } else if (item.name === 'Son Aktiviteler') {
              shouldShow = user?.permissions?.some(p => 
                p.permission === 'MANAGE_ACTIVITIES' && p.isActive
              ) || false;
            } else if (item.name === 'Kullanıcılar') {
              // AGENCY_ADMIN her zaman görsün; diğer roller izinle görsün
              if (user?.role === 'AGENCY_ADMIN') {
                shouldShow = true;
              } else {
                shouldShow = user?.permissions?.some(p => 
                  p.permission === 'MANAGE_USERS' && p.isActive
                ) || false;
              }
            } else if (item.name === 'Raporlar') {
              // AGENCY_ADMIN her zaman görsün; diğer roller izinle görsün
              if (user?.role === 'AGENCY_ADMIN') {
                shouldShow = true;
              } else {
                shouldShow = user?.permissions?.some(p => 
                  p.permission === 'VIEW_REPORTS' && p.isActive
                ) || false;
              }
            } else if (item.name === 'Muhasebe') {
              // AGENCY_ADMIN her zaman görsün; diğer roller izinle görsün
              if (user?.role === 'AGENCY_ADMIN') {
                shouldShow = true;
              } else {
                shouldShow = user?.permissions?.some(p => 
                  p.permission === 'VIEW_ACCOUNTING' && p.isActive
                ) || false;
              }
            } else if (item.href === '/admin/customers' || item.name === 'Müşteriler') {
              // AGENCY_ADMIN her zaman görsün; diğer roller izinle görsün
              if (user?.role === 'AGENCY_ADMIN') {
                shouldShow = true;
              } else {
                const hasExplicit = user?.permissions?.some(p => 
                  (p.permission === 'VIEW_CUSTOMER_DATA' || p.permission === 'MANAGE_CUSTOMERS') && p.isActive
                ) || false;
                shouldShow = hasExplicit;
              }
            } else if (item.name === 'Şirketler') {
              shouldShow = user?.role === 'SUPERUSER';
            } else if (item.name === 'Müşteri Kurulumu') {
              shouldShow = user?.role === 'SUPERUSER';
            } else if (item.name === 'Personel Performansı') {
              shouldShow = user?.role === 'AGENCY_ADMIN' || user?.role === 'SUPERUSER';
            } else if (item.name === 'Denetim Logları') {
              shouldShow = false; // Only SUPERUSER can see this
            } else if (item.name === 'Ayarlar') {
              shouldShow = false; // Only SUPERUSER can see this
            } else if (item.name === 'Acente Ayarları') {
              shouldShow = user?.role === 'AGENCY_ADMIN' || user?.role === 'SUPERUSER';
            } else if (item.name === 'U-ETDS') {
              shouldShow = user?.role === 'AGENCY_ADMIN' || user?.role === 'SUPERUSER';
            } else if (item.name === 'Modül Yönetimi') {
              shouldShow = user?.role === 'SUPERUSER';
            } else if (item.module === 'tour') {
              // AGENCY_ADMIN her zaman görsün; diğer roller izinle görsün
              if (user?.role === 'AGENCY_ADMIN') {
                shouldShow = true;
              } else {
                shouldShow = user?.permissions?.some(p => 
                  p.permission === 'VIEW_TOUR_MODULE' && p.isActive
                ) || false;
              }
            }
          }
          
          // Hem modül durumu hem de izin kontrolü
          if (!item.visible || !shouldShow) {
            return null;
          }
          
          // Özel component kullanılacak öğeler için
          if ((item as any).isSpecial && item.name === t('admin.navigation.newReservation')) {
            return (
              <ReservationTypeSelector
                key={item.name}
                onClose={onClose}
              />
            );
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
              className="w-full inline-block bg-green-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
