'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface HotelBooking {
  id: string;
  voucherNumber: string;
  hotelName: string;
  hotelAddress: string;
  roomType: string;
  checkin: Date | string;
  checkout: Date | string;
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  bookingReference: string;
  createdAt: Date | string;
}

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  status: string;
  hotelName: string;
}

export default function HotelReportsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    status: 'all',
    hotelName: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/accommodation/bookings', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      
      if (!response.ok) {
        throw new Error('Rezervasyonlar yüklenemedi');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.createdAt);
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);
    
    const matchesDate = bookingDate >= fromDate && bookingDate <= toDate;
    const matchesStatus = filters.status === 'all' || booking.status.toLowerCase() === filters.status;
    const matchesHotel = !filters.hotelName || 
      booking.hotelName.toLowerCase().includes(filters.hotelName.toLowerCase());
    
    return matchesDate && matchesStatus && matchesHotel;
  });

  const calculateStats = () => {
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    const statusCounts = {
      PENDING: filteredBookings.filter(b => b.status === 'PENDING').length,
      CONFIRMED: filteredBookings.filter(b => b.status === 'CONFIRMED').length,
      CANCELLED: filteredBookings.filter(b => b.status === 'CANCELLED').length,
      COMPLETED: filteredBookings.filter(b => b.status === 'COMPLETED').length
    };

    const monthlyData = filteredBookings.reduce((acc, booking) => {
      const month = new Date(booking.createdAt).toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!acc[month]) {
        acc[month] = { bookings: 0, revenue: 0 };
      }
      acc[month].bookings += 1;
      acc[month].revenue += booking.totalPrice;
      return acc;
    }, {} as Record<string, { bookings: number; revenue: number }>);

    const hotelStats = filteredBookings.reduce((acc, booking) => {
      if (!acc[booking.hotelName]) {
        acc[booking.hotelName] = { bookings: 0, revenue: 0 };
      }
      acc[booking.hotelName].bookings += 1;
      acc[booking.hotelName].revenue += booking.totalPrice;
      return acc;
    }, {} as Record<string, { bookings: number; revenue: number }>);

    return {
      totalBookings,
      totalRevenue,
      averageBookingValue,
      statusCounts,
      monthlyData,
      hotelStats
    };
  };

  const stats = calculateStats();

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    const headers = [
      'Voucher No',
      'Otel Adı',
      'Oda Tipi',
      'Giriş Tarihi',
      'Çıkış Tarihi',
      'Gece Sayısı',
      'Yetişkin',
      'Çocuk',
      'Oda Sayısı',
      'Toplam Tutar',
      'Durum',
      'Müşteri Adı',
      'Müşteri E-posta',
      'Müşteri Telefon',
      'Oluşturma Tarihi'
    ];

    const csvData = filteredBookings.map(booking => {
      const nights = Math.ceil(
        (new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return [
        booking.voucherNumber,
        booking.hotelName,
        booking.roomType,
        new Date(booking.checkin).toLocaleDateString('tr-TR'),
        new Date(booking.checkout).toLocaleDateString('tr-TR'),
        nights,
        booking.adults,
        booking.children,
        booking.rooms,
        booking.totalPrice,
        booking.status,
        booking.customerInfo.name,
        booking.customerInfo.email,
        booking.customerInfo.phone,
        new Date(booking.createdAt).toLocaleDateString('tr-TR')
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `konaklama-raporu-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Konaklama Raporları
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                📥 CSV İndir
              </button>
              <Link
                href="/accommodation/reservations"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                📋 Rezervasyonlar
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Detaylı konaklama analizleri ve raporları
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 mb-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtreler</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="pending">Beklemede</option>
                <option value="confirmed">Onaylandı</option>
                <option value="cancelled">İptal Edildi</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otel Adı
              </label>
              <input
                type="text"
                placeholder="Otel adı ara..."
                value={filters.hotelName}
                onChange={(e) => handleFilterChange('hotelName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Toplam Rezervasyon</div>
          </div>
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-green-600">
              €{stats.totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Toplam Gelir</div>
          </div>
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-purple-600">
              €{stats.averageBookingValue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Ortalama Değer</div>
          </div>
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(stats.hotelStats).length}
            </div>
            <div className="text-sm text-gray-600">Farklı Otel</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Durum Dağılımı</h3>
            <div className="space-y-3">
              {Object.entries(stats.statusCounts).map(([status, count]) => {
                const percentage = stats.totalBookings > 0 ? (count / stats.totalBookings) * 100 : 0;
                const colors = {
                  PENDING: 'bg-yellow-500',
                  CONFIRMED: 'bg-green-500',
                  CANCELLED: 'bg-red-500',
                  COMPLETED: 'bg-blue-500'
                };
                const labels = {
                  PENDING: 'Beklemede',
                  CONFIRMED: 'Onaylandı',
                  CANCELLED: 'İptal Edildi',
                  COMPLETED: 'Tamamlandı'
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${colors[status as keyof typeof colors]} mr-2`}></div>
                      <span className="text-sm text-gray-600">{labels[status as keyof typeof labels]}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold mr-2">{count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Aylık Gelir</h3>
            <div className="space-y-3">
              {Object.entries(stats.monthlyData)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([month, data]) => (
                  <div key={month} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{month}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">€{data.revenue.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{data.bookings} rezervasyon</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Hotel Performance */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 mb-8 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">🏨 Otel Performansı</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 transition-colors duration-200">
              <thead className="bg-gray-50 dark:bg-slate-950/70 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Otel Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rezervasyon Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Gelir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ortalama Değer
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900/90 divide-y divide-gray-200 dark:divide-slate-800 transition-colors duration-200">
                {Object.entries(stats.hotelStats)
                  .sort(([, a], [, b]) => b.revenue - a.revenue)
                  .map(([hotelName, data]) => (
                    <tr key={hotelName} className="hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {hotelName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{data.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{(data.revenue / data.bookings).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Report */}
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">📋 Detaylı Rapor</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {filteredBookings.length} rezervasyon bulundu
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 transition-colors duration-200">
              <thead className="bg-gray-50 dark:bg-slate-950/70 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Otel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarihler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.voucherNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.hotelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customerInfo.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.checkin).toLocaleDateString('tr-TR')} - {new Date(booking.checkout).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{booking.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status === 'PENDING' ? 'Beklemede' :
                         booking.status === 'CONFIRMED' ? 'Onaylandı' :
                         booking.status === 'CANCELLED' ? 'İptal Edildi' :
                         'Tamamlandı'}
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
