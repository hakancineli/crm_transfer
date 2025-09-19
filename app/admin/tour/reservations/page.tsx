'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { apiGet } from '@/app/lib/api';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';

interface TourBooking {
  id: string;
  voucherNumber: string;
  routeName: string;
  vehicleType: string;
  groupSize: number;
  price: number;
  currency: string;
  pickupLocation: string;
  tourDate: string;
  status: string;
  passengerNames: string[];
  createdAt: string;
}

export default function TourReservationsPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading: moduleLoading } = useModule('tour');
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has permission to view tour module
    if (!user || !canViewTourModule(user.role, user.permissions)) {
      window.location.href = '/admin';
      return;
    }

    if (tourEnabled) {
      fetchTourBookings();
    }
  }, [tourEnabled, user]);

  const fetchTourBookings = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/tour-bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || data);
      }
    } catch (error) {
      console.error('Tur rezervasyonları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (moduleLoading || loading) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'PENDING':
        return 'Beklemede';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tur Rezervasyonları</h1>
              <p className="mt-2 text-gray-600">Tüm tur rezervasyonlarını görüntüleyin ve yönetin</p>
            </div>
            <Link
              href="/admin/tour/reservations/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Yeni Tur Rezervasyonu
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-sm text-gray-600">Toplam Rezervasyon</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">Onaylanan</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.reduce((sum, b) => sum + b.groupSize, 0)}
            </div>
            <div className="text-sm text-gray-600">Toplam Kişi</div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Rezervasyon Listesi</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🚌</div>
              <p className="text-gray-500 mb-4">Henüz tur rezervasyonu bulunmuyor</p>
              <Link 
                href="/admin/tour/reservations/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                İlk Tur Rezervasyonunu Oluştur
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tur Rotası
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Araç Tipi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kişi Sayısı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="font-mono text-xs px-2 py-1 rounded border inline-block whitespace-nowrap text-gray-700 bg-gray-100 border-gray-200">
                          {booking.voucherNumber.startsWith('TUR-') 
                            ? `TUR${new Date(booking.tourDate).toISOString().slice(2,10).replace(/-/g, '')}-${Math.floor(Math.random() * 9) + 1}`
                            : booking.voucherNumber
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.routeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.vehicleType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.groupSize} kişi
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.price} {booking.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.tourDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/tour/reservations/${booking.id}/driver-voucher`}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 text-xl font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                            title="Şoför Voucherı"
                          >
                            👨‍✈️
                          </Link>
                          <Link
                            href={`/admin/tour/reservations/${booking.id}/customer-voucher`}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 text-xl font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                            title="Müşteri Voucherı"
                          >
                            🎫
                          </Link>
                          <Link
                            href={`/admin/tour/reservations/${booking.id}/edit`}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Düzenle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

