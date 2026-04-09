'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface UserPerformance {
  id: string;
  name: string;
  username: string;
  role: string;
  totalReservations: number;
  totalRevenue: number;
  thisMonthReservations: number;
  thisMonthRevenue: number;
  lastActivity: string;
  isActive: boolean;
  // Revenue breakdown
  transferRevenue: number;
  hotelRevenue: number;
  thisMonthTransferRevenue: number;
  thisMonthHotelRevenue: number;
  // Sales and profitability metrics
  salesRevenue: number;
  pendingRevenue: number;
  unpaidRevenue: number;
  totalCommission: number;
  netProfit: number;
  profitMargin: number;
  // Detailed costs
  totalDriverFees: number;
  transferCommission: number;
  hotelCommission: number;
  totalCosts: number;
  // Detailed sales counts
  totalSalesCount: number;
  pendingSalesCount: number;
  unpaidSalesCount: number;
  paidSalesCount: number;
  approvedSalesCount: number;
  // Hotel metrics
  totalHotelBookings: number;
}

interface PerformanceStats {
  totalUsers: number;
  activeUsers: number;
  totalReservations: number;
  totalRevenue: number;
  topPerformer: UserPerformance | null;
  averagePerformance: number;
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState<UserPerformance[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'salesRevenue' | 'netProfit' | 'profitMargin' | 'reservations' | 'name'>('revenue');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    // SUPERUSER and AGENCY_ADMIN can access performance page
    if (user && user.role !== 'SUPERUSER' && user.role !== 'AGENCY_ADMIN') {
      window.location.href = '/admin';
      return;
    }
    
    fetchPerformanceData();
  }, [user, selectedUser, fromDate, toDate]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedUser !== 'all') {
        params.append('userId', selectedUser);
      }
      if (fromDate) {
        params.append('fromDate', fromDate);
      }
      if (toDate) {
        params.append('toDate', toDate);
      }
      
      const url = `/api/performance${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformance(data.performance);
        setStats(data.stats);
      } else {
        setError('Performans verileri alınamadı');
      }
    } catch (error) {
      console.error('Performans verileri getirme hatası:', error);
      setError('Performans verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      'SUPERUSER': 'Süper Kullanıcı',
      'MANAGER': 'Yönetici',
      'OPERATION': 'Operasyon',
      'SELLER': 'Satış',
      'ACCOUNTANT': 'Muhasebe',
      'CUSTOMER_SERVICE': 'Müşteri Hizmetleri',
      'FINANCE': 'Finans'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'SUPERUSER': 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
      'MANAGER': 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
      'OPERATION': 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300',
      'SELLER': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300',
      'ACCOUNTANT': 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
      'CUSTOMER_SERVICE': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
      'FINANCE': 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const sortedPerformance = [...performance]
    .filter(user => filterRole === 'all' || user.role === filterRole)
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'salesRevenue':
          return b.salesRevenue - a.salesRevenue;
        case 'netProfit':
          return b.netProfit - a.netProfit;
        case 'profitMargin':
          return b.profitMargin - a.profitMargin;
        case 'reservations':
          return b.totalReservations - a.totalReservations;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-6 transition-colors duration-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Hata
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Personel Performansı</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Kullanıcı performans metrikleri ve istatistikleri</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Toplam Kullanıcı</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Aktif Kullanıcı</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Toplam Rezervasyon</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalReservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Toplam Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 mb-8 transition-colors duration-200">
          <div className="space-y-4">
            {/* First row - Sorting and Role filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sıralama</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value="revenue">Toplam Gelire Göre</option>
                    <option value="salesRevenue">Satış Gelirine Göre</option>
                    <option value="netProfit">Net Kâra Göre</option>
                    <option value="profitMargin">Kâr Marjına Göre</option>
                    <option value="reservations">Rezervasyon Sayısına Göre</option>
                    <option value="name">İsme Göre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rol Filtresi</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value="all">Tüm Roller</option>
                    <option value="SELLER">Satış</option>
                    <option value="OPERATION">Operasyon</option>
                    <option value="ACCOUNTANT">Muhasebe</option>
                    <option value="MANAGER">Yönetici</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kullanıcı Seçimi</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value="all">Tüm Kullanıcılar</option>
                    {performance.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={fetchPerformanceData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yenile
              </button>
            </div>
            
            {/* Second row - Date filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setSelectedUser('all');
                  setFilterRole('all');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performans Tablosu</h3>
            <p className="text-sm text-gray-600 mt-1">
              {sortedPerformance.length} kullanıcı gösteriliyor
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Rezervasyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gelir Dağılımı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Detayları
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maliyet & Kar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bu Ay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Aktivite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPerformance.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalReservations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-medium text-blue-600">
                          🚗 Transfer: {formatCurrency(user.transferRevenue)}
                        </div>
                        <div className="font-medium text-purple-600">
                          🏨 Konaklama: {formatCurrency(user.hotelRevenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Toplam: {formatCurrency(user.totalRevenue)}
                        </div>
                        {user.totalHotelBookings > 0 && (
                          <div className="text-xs text-purple-500">
                            {user.totalHotelBookings} otel rezervasyonu
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-medium text-green-600">
                          ✅ Tamamlanan: {user.totalSalesCount} adet
                        </div>
                        <div className="text-sm text-gray-700">
                          {formatCurrency(user.salesRevenue)}
                        </div>
                        <div className="text-xs text-yellow-600">
                          ⏳ Bekleyen: {user.pendingSalesCount} adet
                        </div>
                        <div className="text-xs text-red-600">
                          ❌ Ödenmemiş: {user.unpaidSalesCount} adet
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-medium text-green-600">
                          💰 Net Kar: {formatCurrency(user.netProfit)}
                        </div>
                        <div className="text-xs text-gray-500">
                          🚗 Transfer Kom.: {formatCurrency(user.transferCommission)}
                        </div>
                        <div className="text-xs text-gray-500">
                          🏨 Otel Kom.: {formatCurrency(user.hotelCommission)}
                        </div>
                        <div className="text-xs text-gray-500">
                          👨‍💼 Şoför Ücreti: {formatCurrency(user.totalDriverFees)}
                        </div>
                        <div className={`font-medium ${user.profitMargin >= 15 ? 'text-green-600' : user.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          📊 Kar Marjı: %{user.profitMargin.toFixed(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="font-medium">{user.thisMonthReservations} rezervasyon</div>
                        <div className="text-xs text-blue-600">
                          🚗 {formatCurrency(user.thisMonthTransferRevenue)}
                        </div>
                        <div className="text-xs text-purple-600">
                          🏨 {formatCurrency(user.thisMonthHotelRevenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Toplam: {formatCurrency(user.thisMonthRevenue)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastActivity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
