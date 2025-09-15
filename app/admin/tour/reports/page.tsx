'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import Link from 'next/link';

interface TourReport {
  totalBookings: number;
  totalRevenue: number;
  averageGroupSize: number;
  mostPopularRoute: string;
  vehicleUtilization: {
    vito: number;
    sprinter10: number;
    sprinter13: number;
    sprinter16: number;
  };
  monthlyStats: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
}

const SAMPLE_REPORT: TourReport = {
  totalBookings: 45,
  totalRevenue: 12500,
  averageGroupSize: 8.5,
  mostPopularRoute: 'İstanbul Şehir Turu',
  vehicleUtilization: {
    vito: 12,
    sprinter10: 8,
    sprinter13: 15,
    sprinter16: 10,
  },
  monthlyStats: [
    { month: 'Ocak', bookings: 8, revenue: 2200 },
    { month: 'Şubat', bookings: 12, revenue: 3200 },
    { month: 'Mart', bookings: 15, revenue: 4100 },
    { month: 'Nisan', bookings: 10, revenue: 3000 },
  ],
};

export default function TourReportsPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');
  const [report, setReport] = useState<TourReport>(SAMPLE_REPORT);
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!tourEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Modül Kapalı</h1>
          <p className="text-gray-600">Tur modülü aktif değil. Modül Yönetimi'nden aktifleştirin.</p>
          <Link 
            href="/admin/modules"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Modül Yönetimi
          </Link>
        </div>
      </div>
    );
  }

  const refreshReport = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tur Raporları</h1>
              <p className="mt-2 text-gray-600">Detaylı tur analizleri ve istatistikler</p>
            </div>
            <button
              onClick={refreshReport}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Yenileniyor...' : 'Raporu Yenile'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">{report.totalBookings}</div>
              <div className="ml-2 text-sm text-gray-600">Toplam Rezervasyon</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">{report.totalRevenue}€</div>
              <div className="ml-2 text-sm text-gray-600">Toplam Gelir</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">{report.averageGroupSize}</div>
              <div className="ml-2 text-sm text-gray-600">Ortalama Grup Boyutu</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">{report.mostPopularRoute}</div>
              <div className="ml-2 text-sm text-gray-600">En Popüler Rota</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Utilization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Araç Kullanım Dağılımı</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mercedes Vito VIP</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(report.vehicleUtilization.vito / 45) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{report.vehicleUtilization.vito}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sprinter 10 Kişi</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(report.vehicleUtilization.sprinter10 / 45) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{report.vehicleUtilization.sprinter10}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sprinter 13 Kişi</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${(report.vehicleUtilization.sprinter13 / 45) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{report.vehicleUtilization.sprinter13}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sprinter 16 Kişi</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(report.vehicleUtilization.sprinter16 / 45) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{report.vehicleUtilization.sprinter16}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Aylık Gelir Trendi</h2>
            <div className="space-y-4">
              {report.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{stat.month}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(stat.revenue / 4100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{stat.revenue}€</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Detaylı İstatistikler</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rezervasyon Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Gelir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ortalama Grup Boyutu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ortalama Fiyat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.monthlyStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.revenue}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(stat.revenue / stat.bookings / 50)} kişi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(stat.revenue / stat.bookings)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 flex justify-center space-x-4">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Excel'e Aktar
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            PDF Olarak İndir
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
            Raporu Yazdır
          </button>
        </div>
      </div>
    </div>
  );
}


