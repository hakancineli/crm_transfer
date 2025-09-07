'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  reservations: DriverReservation[];
}

interface DriverReservation {
  id: string;
  voucherNumber: string;
  date: string;
  time: string;
  from: string;
  to: string;
  passengerNames: string;
  price: number;
  currency: string;
  driverFee: number;
  paymentStatus: string;
  createdAt: string;
}

interface DriverStats {
  totalReservations: number;
  totalRevenue: number;
  totalDriverFee: number;
  averageRating: number;
  completedTransfers: number;
  pendingTransfers: number;
  thisMonthReservations: number;
  thisMonthRevenue: number;
}

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const driverId = params.id as string;
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has permission to view drivers
    const hasViewDriversPermission = user?.permissions?.some(p => 
      p.permission === 'VIEW_DRIVERS' && p.isActive
    );
    
    // Allow SUPERUSER to access driver details
    if (user && user.role !== 'SUPERUSER' && !hasViewDriversPermission) {
      window.location.href = '/admin';
      return;
    }
    
    if (driverId) {
      fetchDriverDetails();
    }
  }, [driverId, user]);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drivers/${driverId}`);
      if (response.ok) {
        const data = await response.json();
        setDriver(data.driver);
        setStats(data.stats);
      } else {
        setError('Şoför bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Şoför detayları getirme hatası:', error);
      setError('Şoför bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TL') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
                  <p>{error || 'Şoför bulunamadı'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin/drivers')}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Şoförler Listesine Dön
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/drivers')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Şoför Detayları</h1>
                <p className="text-gray-600 mt-1">Şoför performansı ve rezervasyon geçmişi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-3xl">👨‍✈️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
              <p className="text-gray-600 text-lg">{driver.phoneNumber}</p>
              <p className="text-sm text-gray-500 mt-1">
                Sisteme katılım: {formatDate(driver.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">🚗</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Transfer</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalReservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold">💵</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Şoför Ücreti</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalDriverFee)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Bu Ay</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.thisMonthReservations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rezervasyon Geçmişi</h3>
            <p className="text-sm text-gray-600 mt-1">
              {driver.reservations.length} rezervasyon bulundu
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih/Saat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Güzergah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yolcular
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şoför Ücreti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driver.reservations.map((reservation) => {
                  const passengerNames = Array.isArray(reservation.passengerNames) 
                    ? reservation.passengerNames 
                    : JSON.parse(reservation.passengerNames || '[]');
                  
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/reservations/${reservation.voucherNumber}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {reservation.voucherNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatDate(reservation.date)}</div>
                        <div className="text-gray-500">{reservation.time}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{reservation.from}</div>
                        <div className="text-gray-500">→ {reservation.to}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {passengerNames.length > 0 ? (
                          <div>
                            {passengerNames.slice(0, 2).map((name: string, index: number) => (
                              <div key={index}>{name}</div>
                            ))}
                            {passengerNames.length > 2 && (
                              <div className="text-gray-500">+{passengerNames.length - 2} daha</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(reservation.price, reservation.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.driverFee ? formatCurrency(reservation.driverFee) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reservation.paymentStatus === 'PAID' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.paymentStatus === 'PAID' ? 'Ödendi' : 'Beklemede'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
