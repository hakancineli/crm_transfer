'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

interface Customer {
  phoneNumber: string;
  totalReservations: number;
  totalSpent: number;
  lastReservation: string;
  reservations: any[];
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const canViewCustomers =
    user?.role === 'SUPERUSER' ||
    (user?.role && ((ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.VIEW_CUSTOMER_DATA) ||
                    (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.MANAGE_CUSTOMERS))) ||
    user?.permissions?.some(p => (p.permission === PERMISSIONS.VIEW_CUSTOMER_DATA || p.permission === PERMISSIONS.MANAGE_CUSTOMERS) && p.isActive);

  useEffect(() => {
    if (!canViewCustomers) return;
    fetchCustomers();
  }, [canViewCustomers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/reservations', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      const reservations = await response.json();
      
      // Müşterileri telefon numarasına göre grupla
      const customerMap = new Map<string, Customer>();
      
      reservations.forEach((reservation: any) => {
        if (!reservation.phoneNumber) return;
        
        const phone = reservation.phoneNumber;
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            phoneNumber: phone,
            totalReservations: 0,
            totalSpent: 0,
            lastReservation: reservation.createdAt,
            reservations: []
          });
        }
        
        const customer = customerMap.get(phone)!;
        customer.totalReservations++;
        customer.totalSpent += reservation.price;
        customer.reservations.push(reservation);
        
        if (new Date(reservation.createdAt) > new Date(customer.lastReservation)) {
          customer.lastReservation = reservation.createdAt;
        }
      });
      
      const customerList = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
      
      setCustomers(customerList);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPhoneNumber = (phone: string) => {
    // Basit telefon formatı
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
              <p className="mt-1 text-sm text-gray-600">
                Müşteri bilgilerini görüntüleyin ve yönetin
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Telefon numarası ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama Rezervasyon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(customers.reduce((sum, c) => sum + c.totalReservations, 0) / customers.length || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Müşteri Listesi</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Rezervasyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Harcama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Rezervasyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.phoneNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {customer.phoneNumber.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPhoneNumber(customer.phoneNumber)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.reservations[0]?.passengerNames?.[0] || 'Bilinmiyor'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.totalReservations}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.lastReservation).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/customers/${customer.phoneNumber}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Detaylar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Müşteri Bulunamadı' : 'Henüz Müşteri Yok'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Arama kriterlerinize uygun müşteri bulunamadı.' : 'İlk rezervasyonunuzu oluşturarak başlayın.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
