'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEmoji } from '../contexts/EmojiContext';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS, ROLE_PERMISSIONS, canViewTourModule, canManageTourBookings, canManageTourRoutes, canManageTourVehicles } from '../lib/permissions';
import { useLanguage } from '../contexts/LanguageContext';
import { useModule } from '../hooks/useModule';

interface DashboardStats {
  totalReservations: number;
  todayReservations: number;
  totalRevenue: number;
  todayRevenue: number;
  totalDrivers: number;
  activeDrivers: number;
  pendingPayments: number;
  completedTransfers: number;
}

export default function AdminDashboard() {
  const { emojisEnabled } = useEmoji();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t, dir } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const accommodationEnabled = useModule('accommodation');
  const flightEnabled = useModule('flight');
  const tourEnabled = useModule('tour');
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    todayReservations: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    pendingPayments: 0,
    completedTransfers: 0
  });
  const [loading, setLoading] = useState(true);

  const canViewDashboard =
    user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.VIEW_DASHBOARD)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.VIEW_DASHBOARD && p.isActive);

  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kullanıcı kontrolü - sadece giriş yapmış kullanıcılar erişebilir
  useEffect(() => {
    if (isClient && !authLoading && !user) {
      window.location.href = '/admin-login';
      return;
    }
  }, [isClient, authLoading, user]);

  useEffect(() => {
    if (canViewDashboard) {
      fetchDashboardStats();
    }
  }, [canViewDashboard]);

  // Loading state - authentication henüz tamamlanmadıysa loading göster
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!canViewDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 dark:text-slate-400">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Rezervasyon istatistikleri (token ile)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const reservationsResponse = await fetch('/api/reservations', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      const reservationsData = await reservationsResponse.json();
      const reservations = Array.isArray(reservationsData) ? reservationsData : [];
      
      // Sürücü istatistikleri (token ile)
      const driversResponse = await fetch('/api/drivers', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      const driversData = await driversResponse.json();
      const drivers = Array.isArray(driversData) ? driversData : [];
      
      // Bugünkü tarih
      const today = new Date().toISOString().split('T')[0];
      
      // İstatistikleri hesapla
      const totalReservations = reservations.length;
      const todayReservations = reservations.filter((r: any) => r.date === today).length;
      
      const totalRevenue = reservations.reduce((sum: number, r: any) => {
        return sum + (r.paymentStatus === 'PAID' ? r.price : 0);
      }, 0);
      
      const todayRevenue = reservations
        .filter((r: any) => r.date === today && r.paymentStatus === 'PAID')
        .reduce((sum: number, r: any) => sum + r.price, 0);
      
      const totalDrivers = drivers.length;
      const activeDrivers = drivers.filter((d: any) => d.reservations && d.reservations.length > 0).length;
      
      const pendingPayments = reservations.filter((r: any) => r.paymentStatus === 'PENDING').length;
      const completedTransfers = reservations.filter((r: any) => r.paymentStatus === 'PAID').length;
      
      setStats({
        totalReservations,
        todayReservations,
        totalRevenue,
        todayRevenue,
        totalDrivers,
        activeDrivers,
        pendingPayments,
        completedTransfers
      });
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 bg-[linear-gradient(rgba(248,250,252,0.88),rgba(248,250,252,0.92)),url('/seref-vural-tours/istanbul/istanbul.jpeg')] bg-cover bg-center bg-fixed dark:bg-[linear-gradient(rgba(2,6,23,0.88),rgba(2,6,23,0.94)),url('/seref-vural-tours/istanbul/istanbul.jpeg')] transition-colors duration-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-slate-900/70 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={fetchDashboardStats}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
{emojisEnabled ? '🔄 ' : ''}{t('admin.dashboard.refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-white dark:text-slate-100 transition-colors duration-200">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {/* Toplam Rezervasyonlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">{emojisEnabled ? '📋' : '📄'}</span>
                </div>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-slate-400 dark:text-slate-400 truncate">{t('admin.dashboard.stats.totalReservations')}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{stats.totalReservations}</p>
              </div>
            </div>
          </div>

          {/* Bugünkü Rezervasyonlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">{emojisEnabled ? '📅' : '📆'}</span>
                </div>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('admin.dashboard.stats.todayReservations')}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.todayReservations}</p>
              </div>
            </div>
          </div>

          {/* Toplam Gelir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">{emojisEnabled ? '💰' : '$'}</span>
                </div>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('admin.dashboard.stats.totalRevenue')}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Bugünkü Gelir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">{emojisEnabled ? '💵' : '€'}</span>
                </div>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('admin.dashboard.stats.todayRevenue')}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">${stats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {/* Toplam Şoförler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">👨‍✈️</span>
                </div>
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('admin.dashboard.stats.totalDrivers')}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDrivers}</p>
              </div>
            </div>
          </div>

          {/* Aktif Şoförler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400 dark:text-slate-400">{t('admin.dashboard.stats.activeDrivers')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{stats.activeDrivers}</p>
              </div>
            </div>
          </div>

          {/* Bekleyen Ödemeler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400 dark:text-slate-400">{t('admin.dashboard.stats.pendingPayments')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          {/* Tamamlanan Transferler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('admin.dashboard.stats.completedTransfers')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedTransfers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Hızlı İşlemler - Transfer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-4">{t('admin.dashboard.quickActions.transferOperations')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/new-reservation"
                className="flex items-center justify-center p-4 bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 rounded-lg hover:bg-green-100 dark:hover:bg-emerald-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '➕' : '+'}</div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-300">{t('admin.dashboard.quickActions.newReservation')}</div>
                </div>
              </Link>
              
              <Link
                href="/admin/reservations"
                className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📋' : '📄'}</div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('admin.dashboard.quickActions.reservations')}</div>
                </div>
              </Link>
              
              {user?.role === 'SUPERUSER' || flightEnabled ? (
                <Link
                  href="/admin/flight-status"
                  className="flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/15 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{emojisEnabled ? '✈️' : '🛫'}</div>
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-300">{t('admin.dashboard.quickActions.flightStatus')}</div>
                  </div>
                </Link>
              ) : (
                <div
                  className="flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-lg opacity-50 cursor-not-allowed transition-colors duration-200"
                  title="Uçuş modülü kapalı - Modül Yönetimi'nden aktifleştirin"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{emojisEnabled ? '✈️' : '🛫'}</div>
                    <div className="text-sm font-medium text-gray-500">{t('admin.dashboard.quickActions.flightStatus')}</div>
                  </div>
                </div>
              )}
              
              <Link
                href="/admin/reports"
                className="flex items-center justify-center p-4 bg-purple-50 dark:bg-violet-500/10 border border-purple-200 dark:border-violet-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-violet-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📊' : '📈'}</div>
                  <div className="text-sm font-medium text-purple-800 dark:text-violet-300">{t('admin.dashboard.quickActions.reports')}</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Hızlı İşlemler - Konaklama */}
          {user?.role === 'SUPERUSER' || accommodationEnabled ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.dashboard.quickActions.accommodationOperations')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/accommodation"
                className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '🏨' : '🏢'}</div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('admin.dashboard.quickActions.hotelReservation')}</div>
                </div>
              </Link>

              <Link
                href="/admin/accommodation/price-pool"
                className="flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '💰' : '$'}</div>
                  <div className="text-sm font-medium text-orange-800 dark:text-orange-300">{t('admin.dashboard.quickActions.pricePool')}</div>
                </div>
              </Link>

              <Link
                href="/admin/accommodation/reservations"
                className="flex items-center justify-center p-4 bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 rounded-lg hover:bg-green-100 dark:hover:bg-emerald-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📋' : '📄'}</div>
                  <div className="text-sm font-medium text-green-800 dark:text-emerald-300">{t('admin.dashboard.quickActions.hotelReservations')}</div>
                </div>
              </Link>

              <Link
                href="/admin/accommodation/reports"
                className="flex items-center justify-center p-4 bg-purple-50 dark:bg-violet-500/10 border border-purple-200 dark:border-violet-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-violet-500/15 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📊' : '📈'}</div>
                  <div className="text-sm font-medium text-purple-800 dark:text-violet-300">{t('admin.dashboard.quickActions.accommodationReports')}</div>
                </div>
              </Link>
            </div>
          </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/70 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 opacity-50 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-500 dark:text-slate-400 mb-4">{t('admin.dashboard.quickActions.accommodationOperations')}</h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">{emojisEnabled ? '🏨' : '🏢'}</div>
                <p className="text-gray-500 dark:text-slate-400">Konaklama modülü kapalı</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">Modül Yönetimi'nden aktifleştirin</p>
              </div>
            </div>
          )}

          {/* Hızlı İşlemler - Tur */}
          {(user?.role === 'SUPERUSER' || (tourEnabled && canViewTourModule(user?.role || '', user?.permissions))) ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tur İşlemleri</h3>
              <div className="grid grid-cols-2 gap-4">
                {canManageTourBookings(user?.role || '', user?.permissions) ? (
                  <Link
                    href="/admin/tour/reservations/new"
                    className="flex items-center justify-center p-4 bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 rounded-lg hover:bg-green-100 dark:hover:bg-emerald-500/15 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{emojisEnabled ? '🚌' : '🚐'}</div>
                      <div className="text-sm font-medium text-green-800 dark:text-emerald-300">Yeni Tur Rezervasyonu</div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-lg opacity-50 cursor-not-allowed transition-colors duration-200"
                    title="Tur rezervasyonu oluşturma yetkiniz yok"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{emojisEnabled ? '🚌' : '🚐'}</div>
                      <div className="text-sm font-medium text-gray-500">Yeni Tur Rezervasyonu</div>
                    </div>
                  </div>
                )}
                
                {canViewTourModule(user?.role || '', user?.permissions) ? (
                  <Link
                    href="/admin/tour/reservations"
                    className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📋' : '📄'}</div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Tur Rezervasyonları</div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-lg opacity-50 cursor-not-allowed transition-colors duration-200"
                    title="Tur rezervasyonlarını görme yetkiniz yok"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📋' : '📄'}</div>
                      <div className="text-sm font-medium text-gray-500">Tur Rezervasyonları</div>
                    </div>
                  </div>
                )}
                
                {canManageTourRoutes(user?.role || '', user?.permissions) ? (
                  <Link
                    href="/admin/tour/routes"
                    className="flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/15 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{emojisEnabled ? '🗺️' : '📍'}</div>
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-300">Tur Rotaları</div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-lg opacity-50 cursor-not-allowed transition-colors duration-200"
                    title="Tur rotalarını yönetme yetkiniz yok"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{emojisEnabled ? '🗺️' : '📍'}</div>
                      <div className="text-sm font-medium text-gray-500">Tur Rotaları</div>
                    </div>
                  </div>
                )}
                
                {canManageTourVehicles(user?.role || '', user?.permissions) ? (
                  <Link
                    href="/admin/tour/vehicles"
                    className="flex items-center justify-center p-4 bg-purple-50 dark:bg-violet-500/10 border border-purple-200 dark:border-violet-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-violet-500/15 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{emojisEnabled ? '🚐' : '🚗'}</div>
                      <div className="text-sm font-medium text-purple-800 dark:text-violet-300">Araç Yönetimi</div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-lg opacity-50 cursor-not-allowed transition-colors duration-200"
                    title="Araç yönetimi yetkiniz yok"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{emojisEnabled ? '🚐' : '🚗'}</div>
                      <div className="text-sm font-medium text-gray-500">Araç Yönetimi</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/70 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 opacity-50 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-500 dark:text-slate-400 mb-4">Tur İşlemleri</h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">{emojisEnabled ? '🚌' : '🚐'}</div>
                <p className="text-gray-500 dark:text-slate-400">Tur modülü kapalı</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">Modül Yönetimi'nden aktifleştirin</p>
              </div>
            </div>
          )}

          {/* Son Aktiviteler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-slate-900/85 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.dashboard.recentActivities')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Yeni rezervasyon oluşturuldu</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">2 dakika önce</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Ödeme onaylandı</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">5 dakika önce</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Şoför atandı</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">10 dakika önce</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Uçuş durumu güncellendi</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">15 dakika önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
