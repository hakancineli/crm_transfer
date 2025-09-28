'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { canViewAccounting } from '@/app/lib/permissions';
import { calculateCommissions, CommissionCalculation } from '@/app/lib/commissionCalculator';
import { useLanguage } from '@/app/contexts/LanguageContext';

// USD kuru alma fonksiyonu
async function getUSDRate() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates.TRY;
  } catch (error) {
    console.error('USD kuru alınamadı:', error);
    return 31.50; // Fallback kur
  }
}

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
  paymentStatus: string;
  driverFee?: number; // Şoför atama ekranından gelen hakediş tutarı
  user?: {
    name: string;
    username: string;
  };
  createdAt: string;
  companyCommissionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  type?: 'Transfer' | 'Tur' | 'Konaklama' | 'Uçuş';
}

export default function AccountingPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, dir } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [usdRate, setUsdRate] = useState<number>(31.50);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }
    
    // Check if user has permission to view accounting
    const hasViewAccountingPermission = user?.role === 'SUPERUSER' || 
      user?.permissions?.some(p => p.permission === 'VIEW_ACCOUNTING' && p.isActive);
    
    if (user && !hasViewAccountingPermission) {
      window.location.href = '/admin';
      return;
    }
    
    // USD kuru al
    getUSDRate().then(rate => setUsdRate(rate));
    fetchReservations();
  }, [filter, dateRange, user, authLoading]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/reservations', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      const data = await response.json();
      // Ensure data is an array
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
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
      default: return status;
    }
  };

  const getCompanyCommissionStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyCommissionStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Onaylandı';
      case 'PENDING': return 'Bekliyor';
      case 'REJECTED': return 'Reddedildi';
      default: return 'Bekliyor';
    }
  };

  const handleApproveCompanyCommission = async (voucherNumber: string) => {
    try {
      const response = await fetch(`/api/reservations/${voucherNumber}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (response.ok) {
        // State'i güncelle
        setReservations(prev => prev.map(res => 
          res.voucherNumber === voucherNumber 
            ? { ...res, companyCommissionStatus: 'APPROVED' as const }
            : res
        ));
        console.log('Şirket hakedişi onaylandı');
      } else {
        console.error('Şirket hakedişi onaylanamadı');
      }
    } catch (error) {
      console.error('Error approving company commission:', error);
    }
  };

  const handleRejectCompanyCommission = async (voucherNumber: string) => {
    try {
      const response = await fetch(`/api/reservations/${voucherNumber}/commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (response.ok) {
        // State'i güncelle
        setReservations(prev => prev.map(res => 
          res.voucherNumber === voucherNumber 
            ? { ...res, companyCommissionStatus: 'REJECTED' as const }
            : res
        ));
        console.log('Şirket hakedişi reddedildi');
      } else {
        console.error('Şirket hakedişi reddedilemedi');
      }
    } catch (error) {
      console.error('Error rejecting company commission:', error);
    }
  };

  const filteredReservations = Array.isArray(reservations) ? reservations.filter(reservation => {
    if (filter === 'all') return true;
    return reservation.paymentStatus === filter;
  }) : [];

  // Raporlar sayfasındaki mantığa göre hesaplamalar
  const totalRevenueUSD = filteredReservations
    .filter(r => r.paymentStatus === 'PAID' && r.currency === 'USD')
    .reduce((sum, r) => sum + r.price, 0);

  const totalRevenueEUR = filteredReservations
    .filter(r => r.paymentStatus === 'PAID' && r.currency === 'EUR')
    .reduce((sum, r) => sum + r.price, 0);

  const totalRevenueTL = filteredReservations
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => {
      if (r.currency === 'USD') {
        return sum + (r.price * usdRate);
      } else if (r.currency === 'EUR') {
        return sum + (r.price * usdRate * 0.85); // EUR to TL conversion (approximate)
      }
      return sum + r.price;
    }, 0);

  const pendingAmount = filteredReservations
    .filter(r => r.paymentStatus === 'PENDING')
    .reduce((sum, r) => {
      if (r.currency === 'USD') {
        return sum + (r.price * usdRate);
      } else if (r.currency === 'EUR') {
        return sum + (r.price * usdRate * 0.85);
      }
      return sum + r.price;
    }, 0);

  const unpaidAmount = filteredReservations
    .filter(r => r.paymentStatus === 'UNPAID')
    .reduce((sum, r) => {
      if (r.currency === 'USD') {
        return sum + (r.price * usdRate);
      } else if (r.currency === 'EUR') {
        return sum + (r.price * usdRate * 0.85);
      }
      return sum + r.price;
    }, 0);

  // Şoför hakedişi hesaplamaları (TL cinsinden) - sadece şoför atanmışsa hesapla
  const totalDriverCommissionTL = filteredReservations
    .filter(r => r.paymentStatus === 'PAID')
    .reduce((sum, r) => {
      if (r.driverFee !== undefined && r.driverFee !== null) {
        // Şoför atama ekranından gelen hakediş tutarı (TL)
        return sum + r.driverFee;
      } else {
        // Şoför atanmamışsa 0
        return sum + 0;
      }
    }, 0);

  // Şirket karı hesaplamaları (TL cinsinden)
  const totalCompanyProfitTL = totalRevenueTL - totalDriverCommissionTL;

  // Kar marjı hesaplama
  const profitMargin = totalRevenueTL > 0 ? ((totalCompanyProfitTL / totalRevenueTL) * 100) : 0;

  const pendingCompanyCommission = filteredReservations
    .filter(r => r.paymentStatus === 'PAID' && (r.companyCommissionStatus === 'PENDING' || !r.companyCommissionStatus))
    .reduce((sum, r) => {
      const driverCommission = r.driverFee !== undefined && r.driverFee !== null 
        ? r.driverFee 
        : 0; // Şoför atanmamışsa 0
      
      let revenue = r.price;
      if (r.currency === 'USD') {
        revenue = r.price * usdRate;
      } else if (r.currency === 'EUR') {
        revenue = r.price * usdRate * 0.85;
      }
      return sum + (revenue - driverCommission);
    }, 0);

  const approvedCompanyCommission = filteredReservations
    .filter(r => r.paymentStatus === 'PAID' && r.companyCommissionStatus === 'APPROVED')
    .reduce((sum, r) => {
      const driverCommission = r.driverFee !== undefined && r.driverFee !== null 
        ? r.driverFee 
        : 0; // Şoför atanmamışsa 0
      
      let revenue = r.price;
      if (r.currency === 'USD') {
        revenue = r.price * usdRate;
      } else if (r.currency === 'EUR') {
        revenue = r.price * usdRate * 0.85;
      }
      return sum + (revenue - driverCommission);
    }, 0);

  // Loading state - authentication henüz tamamlanmadıysa loading göster
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Check permissions before rendering
  const hasViewAccountingPermission = user?.role === 'SUPERUSER' || 
    user?.permissions?.some(p => p.permission === 'VIEW_ACCOUNTING' && p.isActive);
  
  // Check if user has VIEW_ACCOUNTING permission
  if (user && !hasViewAccountingPermission) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Yetkisiz Erişim
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece süper kullanıcılar ve muhasebe kullanıcıları bu sayfaya erişebilir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('admin.accounting.filters.all')}</option>
            <option value="PAID">{t('admin.accounting.filters.paid')}</option>
            <option value="PENDING">{t('admin.accounting.filters.pending')}</option>
            <option value="UNPAID">{t('admin.accounting.filters.unpaid')}</option>
          </select>
          <button
            onClick={fetchReservations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Özet Kartları - Raporlar sayfasındaki mantığa göre */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.usdSalesTotal')}</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenueUSD.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-2xl">💱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.usdTlRate')}</p>
              <p className="text-2xl font-bold text-gray-900">{usdRate.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-2xl">🇪🇺</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">EUR Satış Toplamı</p>
              <p className="text-2xl font-bold text-gray-900">€{totalRevenueEUR.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-2xl">🏦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.tlEquivalent')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenueTL.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-2xl">🚗</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.driverCommission')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalDriverCommissionTL.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.companyProfit')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalCompanyProfitTL.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.profitMargin')}</p>
              <p className="text-2xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onay Durumu Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.pendingCommission')}</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCompanyCommission.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.approvedCommission')}</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCompanyCommission.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('admin.accounting.stats.unpaid')}</p>
              <p className="text-2xl font-bold text-gray-900">{unpaidAmount.toFixed(2)} TL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rezervasyon Listesi */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Rezervasyonlar ({filteredReservations.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.voucher')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.route')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.passengers')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.salesAmount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.driverCommission')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.companyProfit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.paymentStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.commissionApproval')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.accounting.table.salesPerson')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => {
                // Şoför hakedişi hesaplama (TL cinsinden) - sadece şoför atanmışsa hesapla
                const driverCommissionTL = reservation.driverFee !== undefined && reservation.driverFee !== null 
                  ? reservation.driverFee 
                  : 0; // Şoför atanmamışsa 0
                
                // Şirket karı hesaplama (TL cinsinden)
                let revenueTL = reservation.price;
                if (reservation.currency === 'USD') {
                  revenueTL = reservation.price * usdRate;
                } else if (reservation.currency === 'EUR') {
                  revenueTL = reservation.price * usdRate * 0.85;
                }
                const companyProfitTL = revenueTL - driverCommissionTL;
                const companyCommissionStatus = reservation.companyCommissionStatus || 'PENDING';
                
                return (
                  <tr key={reservation.id} className="hover:bg-gray-50">
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
                      <div className="text-sm text-gray-900">
                        {reservation.from} → {reservation.to}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {Array.isArray(reservation.passengerNames) 
                          ? reservation.passengerNames.join(', ')
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${reservation.price.toFixed(2)} {reservation.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({revenueTL.toFixed(2)} TL)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">
                        {driverCommissionTL.toFixed(2)} TL
                      </div>
                      <div className="text-xs text-gray-500">
                        (%{((driverCommissionTL / revenueTL) * 100).toFixed(0)})
                        {reservation.driverFee !== undefined && reservation.driverFee !== null && (
                          <span className="text-blue-600 ml-1">(Atama)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {companyProfitTL.toFixed(2)} TL
                      </div>
                      <div className="text-xs text-gray-500">
                        (%{((companyProfitTL / revenueTL) * 100).toFixed(0)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        {getPaymentStatusText(reservation.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCompanyCommissionStatusColor(companyCommissionStatus)}`}>
                          {getCompanyCommissionStatusText(companyCommissionStatus)}
                        </span>
                        {companyCommissionStatus === 'PENDING' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleApproveCompanyCommission(reservation.voucherNumber)}
                              className="text-green-600 hover:text-green-800 text-xs font-medium"
                              title="Onayla"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleRejectCompanyCommission(reservation.voucherNumber)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                              title="Reddet"
                            >
                              ✗
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.type === 'Tur' ? 'bg-green-100 text-green-800' :
                        reservation.type === 'Transfer' ? 'bg-blue-100 text-blue-800' :
                        reservation.type === 'Konaklama' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.type || 'Transfer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.user?.username || ''}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rezervasyon Bulunamadı</h3>
            <p className="text-gray-500">
              Bu filtre için rezervasyon bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
