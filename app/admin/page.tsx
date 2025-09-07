'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEmoji } from '../contexts/EmojiContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { user, isAdmin } = useAuth();
  const { t, dir } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  console.log('Admin Dashboard - Emojis enabled:', emojisEnabled);

  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Kullanıcı kontrolü - sadece giriş yapmış kullanıcılar erişebilir
  useEffect(() => {
    if (isClient && !user) {
      window.location.href = '/admin-login';
      return;
    }
  }, [isClient, user]);
  
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Rezervasyon istatistikleri
      const reservationsResponse = await fetch('/api/reservations');
      const reservations = await reservationsResponse.json();
      
      // Sürücü istatistikleri
      const driversResponse = await fetch('/api/drivers');
      const drivers = await driversResponse.json();
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex space-x-3">
              <button
                onClick={fetchDashboardStats}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
{emojisEnabled ? '🔄 ' : ''}{t('admin.dashboard.refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sticky top-32 z-30 bg-gray-50">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Toplam Rezervasyonlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">{emojisEnabled ? '📋' : '📄'}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.totalReservations')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
              </div>
            </div>
          </div>

          {/* Bugünkü Rezervasyonlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">{emojisEnabled ? '📅' : '📆'}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.todayReservations')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayReservations}</p>
              </div>
            </div>
          </div>

          {/* Toplam Gelir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">{emojisEnabled ? '💰' : '$'}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.totalRevenue')}</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Bugünkü Gelir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">{emojisEnabled ? '💵' : '€'}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.todayRevenue')}</p>
                <p className="text-2xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Toplam Şoförler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">👨‍✈️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.totalDrivers')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
              </div>
            </div>
          </div>

          {/* Aktif Şoförler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.activeDrivers')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDrivers}</p>
              </div>
            </div>
          </div>

          {/* Bekleyen Ödemeler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.pendingPayments')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          {/* Tamamlanan Transferler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.stats.completedTransfers')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTransfers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hızlı İşlemler - Transfer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.quickActions.transferOperations')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/new-reservation"
                className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '➕' : '+'}</div>
                  <div className="text-sm font-medium text-green-800">{t('admin.dashboard.quickActions.newReservation')}</div>
                </div>
              </Link>
              
              <Link
                href="/admin/reservations"
                className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📋' : '📄'}</div>
                  <div className="text-sm font-medium text-blue-800">{t('admin.dashboard.quickActions.reservations')}</div>
                </div>
              </Link>
              
              <Link
                href="/flight-status"
                className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '✈️' : '🛫'}</div>
                  <div className="text-sm font-medium text-orange-800">{t('admin.dashboard.quickActions.flightStatus')}</div>
                </div>
              </Link>
              
              <Link
                href="/reports"
                className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📊' : '📈'}</div>
                  <div className="text-sm font-medium text-purple-800">{t('admin.dashboard.quickActions.reports')}</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Hızlı İşlemler - Konaklama */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.quickActions.accommodationOperations')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/accommodation"
                className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '🏨' : '🏢'}</div>
                  <div className="text-sm font-medium text-blue-800">{t('admin.dashboard.quickActions.hotelReservation')}</div>
                </div>
              </Link>
              
              <Link
                href="/accommodation/price-pool"
                className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{emojisEnabled ? '💰' : '$'}</div>
                  <div className="text-sm font-medium text-orange-800">{t('admin.dashboard.quickActions.pricePool')}</div>
                </div>
              </Link>
              
              <Link
                href="/accommodation/reservations"
                className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📋' : '📄'}</div>
                  <div className="text-sm font-medium text-green-800">{t('admin.dashboard.quickActions.hotelReservations')}</div>
                </div>
              </Link>
              
              <Link
                href="/accommodation/reports"
                className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{isClient && emojisEnabled ? '📊' : '📈'}</div>
                  <div className="text-sm font-medium text-purple-800">{t('admin.dashboard.quickActions.accommodationReports')}</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.recentActivities')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Yeni rezervasyon oluşturuldu</p>
                  <p className="text-xs text-gray-500">2 dakika önce</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Ödeme onaylandı</p>
                  <p className="text-xs text-gray-500">5 dakika önce</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Şoför atandı</p>
                  <p className="text-xs text-gray-500">10 dakika önce</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Uçuş durumu güncellendi</p>
                  <p className="text-xs text-gray-500">15 dakika önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
