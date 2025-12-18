'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

interface Reservation {
  id: string;
  voucherNumber: string;
  date: string;
  time: string;
  from: string;
  to: string;
  passengerNames: string[];
  price: number;
  currency: string;
  driver?: {
    id: string;
    name: string;
    phoneNumber?: string;
  } | null;
  createdAt: string;
  type: 'transfer' | 'tur';
  status: string;
  paymentStatus: string;
}

interface Customer {
  phoneNumber: string;
  totalReservations: number;
  currencyTotals?: Record<string, number>;
  lastReservation: string;
  reservations: Reservation[];
  customerName?: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const phoneNumber = params.phoneNumber as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canViewCustomers =
    user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.VIEW_CUSTOMER_DATA)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.VIEW_CUSTOMER_DATA && p.isActive);

  useEffect(() => {
    if (!canViewCustomers) {
      router.push('/admin');
      return;
    }
    if (phoneNumber) {
      fetchCustomerDetails();
    }
  }, [phoneNumber, canViewCustomers]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/reservations', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      const reservations = await response.json();

      // Bu telefon numarasına sahip rezervasyonları filtrele
      // URL'den gelen + işareti bazen boşluk olarak gelebilir, düzeltiyoruz.
      // Ayrıca gizli unicode karakterlerini (LTR embedding vb) temizliyoruz.
      const normalize = (val: string) => val.replace(/[\u202A\u202B\u202C\u202D\u202E\u200B\u200C\u200D\u200E\u200F]/g, '').replace(/ /g, '+').trim();
      const normalizedPhone = normalize(decodeURIComponent(phoneNumber));

      const customerReservations = reservations.filter((reservation: any) => {
        if (!reservation.phoneNumber) return false;
        const resPhone = normalize(reservation.phoneNumber);
        return resPhone === normalizedPhone ||
          resPhone === normalizedPhone.replace('+', '') ||
          resPhone.replace('+', '') === normalizedPhone;
      });

      if (customerReservations.length === 0) {
        setError('Müşteri bulunamadı');
        return;
      }

      // Müşteri bilgilerini hesapla - Para birimine göre gruplayarak
      const currencyTotals: Record<string, number> = {};
      customerReservations.forEach((r: any) => {
        const curr = r.currency || 'USD';
        currencyTotals[curr] = (currencyTotals[curr] || 0) + r.price;
      });

      const lastReservation = customerReservations
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      const customerData: Customer = { // Changed type to Customer
        phoneNumber: normalizedPhone, // Use normalizedPhone here
        totalReservations: customerReservations.length,
        currencyTotals, // Use currencyTotals here
        lastReservation: lastReservation.createdAt,
        reservations: customerReservations.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        customerName: customerReservations[0]?.passengerNames?.[0] || 'Bilinmiyor'
      };

      setCustomer(customerData);
    } catch (error) {
      console.error('Müşteri detayları yüklenirken hata:', error);
      setError('Müşteri detayları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNPAID': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Ödendi';
      case 'PENDING': return 'Bekliyor';
      case 'UNPAID': return 'Ödenmedi';
      case 'PARTIAL': return 'Kısmi';
      default: return status;
    }
  };

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-500 line-through';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTripStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal Edildi';
      case 'CONFIRMED': return 'Onaylandı';
      case 'PENDING': return 'Beklemede';
      default: return status;
    }
  };

  if (!canViewCustomers) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata</h3>
          <p className="text-gray-500 mb-4">{error || 'Müşteri bulunamadı'}</p>
          <Link
            href="/admin/customers"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ← Müşteri Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/customers"
                className="text-gray-400 hover:text-gray-600"
              >
                ←
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Müşteri Detayları</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {customer.customerName} - {formatPhoneNumber(customer.phoneNumber)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📞</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Telefon</p>
                <p className="text-lg font-bold text-gray-900">{formatPhoneNumber(customer.phoneNumber)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Rezervasyon</p>
                <p className="text-2xl font-bold text-gray-900">{customer.totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">💰</span>
              </div>
              <div className="ml-4 overflow-hidden">
                <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                <div className="flex flex-col">
                  {Object.entries((customer as any).currencyTotals || {}).map(([curr, total]) => (
                    <p key={curr} className="text-lg font-bold text-gray-900">
                      {(total as number).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {curr}
                    </p>
                  ))}
                  {Object.keys((customer as any).currencyTotals || {}).length === 0 && (
                    <p className="text-lg font-bold text-gray-900">0.00</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Son Rezervasyon</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(customer.lastReservation).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Rezervasyon Geçmişi ({customer.reservations.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Güzergah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme / Yolculuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customer.reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${reservation.type === 'tur' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {reservation.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-700">
                        {reservation.voucherNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reservation.date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {reservation.from} → {reservation.to}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {Array.isArray(reservation.passengerNames)
                          ? reservation.passengerNames.join(', ')
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {reservation.price} {reservation.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium w-fit ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                          💰 {getPaymentStatusText(reservation.paymentStatus)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium w-fit ${getTripStatusColor(reservation.status)}`}>
                          🚗 {getTripStatusText(reservation.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={reservation.type === 'tur' ? `/admin/tour/reservations/${reservation.id}` : `/admin/reservations/${reservation.voucherNumber}`}
                        className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                      >
                        Görüntüle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {customer.reservations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rezervasyon Bulunamadı</h3>
            <p className="text-gray-500">
              Bu müşteriye ait rezervasyon bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
