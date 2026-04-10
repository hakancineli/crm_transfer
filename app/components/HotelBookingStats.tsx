'use client';

import { useState, useEffect } from 'react';

interface HotelBookingStatsProps {
  bookings: any[];
}

export default function HotelBookingStats({ bookings }: HotelBookingStatsProps) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    thisMonthBookings: 0,
    thisMonthRevenue: 0,
    lastMonthBookings: 0,
    lastMonthRevenue: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0
  });

  useEffect(() => {
    if (bookings.length === 0) return;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Temel istatistikler
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Durum bazlı istatistikler
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

    // Aylık istatistikler
    const thisMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= thisMonth;
    }).length;

    const thisMonthRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= thisMonth;
      })
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    const lastMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= lastMonth && bookingDate < thisMonth;
    }).length;

    const lastMonthRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= lastMonth && bookingDate < thisMonth;
      })
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Büyüme oranları
    const monthlyGrowth = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
      : 0;

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    setStats({
      totalBookings,
      totalRevenue,
      averageBookingValue,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      thisMonthBookings,
      thisMonthRevenue,
      lastMonthBookings,
      lastMonthRevenue,
      monthlyGrowth,
      revenueGrowth
    });
  }, [bookings]);

  const StatCard = ({ title, value, subtitle, icon, color, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: number;
  }) => (
    <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">{trend >= 0 ? '↗️' : '↘️'}</span>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Rezervasyon"
          value={stats.totalBookings}
          icon="📋"
          color="text-blue-600"
        />
        <StatCard
          title="Toplam Gelir"
          value={`€${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          color="text-green-600"
        />
        <StatCard
          title="Ortalama Değer"
          value={`€${stats.averageBookingValue.toFixed(2)}`}
          icon="📊"
          color="text-purple-600"
        />
        <StatCard
          title="Bu Ay"
          value={stats.thisMonthBookings}
          subtitle={`€${stats.thisMonthRevenue.toFixed(2)} gelir`}
          icon="📅"
          color="text-orange-600"
          trend={stats.monthlyGrowth}
        />
      </div>

      {/* Durum Bazlı İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Beklemede"
          value={stats.pendingBookings}
          icon="⏳"
          color="text-yellow-600"
        />
        <StatCard
          title="Onaylandı"
          value={stats.confirmedBookings}
          icon="✅"
          color="text-green-600"
        />
        <StatCard
          title="İptal Edildi"
          value={stats.cancelledBookings}
          icon="❌"
          color="text-red-600"
        />
        <StatCard
          title="Tamamlandı"
          value={stats.completedBookings}
          icon="🎉"
          color="text-blue-600"
        />
      </div>

      {/* Aylık Karşılaştırma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Aylık Büyüme</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rezervasyon Sayısı</span>
              <div className="flex items-center">
                <span className="text-lg font-semibold mr-2">{stats.thisMonthBookings}</span>
                <span className={`text-sm ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gelir</span>
              <div className="flex items-center">
                <span className="text-lg font-semibold mr-2">€{stats.thisMonthRevenue.toFixed(2)}</span>
                <span className={`text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Durum Dağılımı</h3>
          <div className="space-y-3">
            {[
              { label: 'Beklemede', value: stats.pendingBookings, color: 'bg-yellow-500' },
              { label: 'Onaylandı', value: stats.confirmedBookings, color: 'bg-green-500' },
              { label: 'İptal Edildi', value: stats.cancelledBookings, color: 'bg-red-500' },
              { label: 'Tamamlandı', value: stats.completedBookings, color: 'bg-blue-500' }
            ].map((item, index) => {
              const percentage = stats.totalBookings > 0 ? (item.value / stats.totalBookings) * 100 : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold mr-2">{item.value}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
