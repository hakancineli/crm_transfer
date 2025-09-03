'use client';

import { useEffect, useState } from 'react';
import { convertCurrency } from '../utils/priceCalculator';

interface ReportData {
  totalRevenueUSD: number;
  totalRevenueTL: number;
  usdRate: number;
  totalTransfers: number;
  paidTransfers: number;
  unpaidTransfers: number;
  driverPayments: number;
  netIncome: number;
  transfersByType: {
    pickup: number;
    dropoff: number;
    transfer: number;
  };
  popularRoutes: Array<{
    route: string;
    count: number;
  }>;
}

export default function ReportsDashboard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        const d = await res.json();
        setData(d);
      } catch (e) {
        setError('Rapor verisi getirilemedi');
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { TRY: '₺', USD: '$', EUR: '€' };
    const symbol = symbols[currency as keyof typeof symbols] || '';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const convertAmount = (amount: number, fromCurrency: string) => {
    if (selectedCurrency === fromCurrency) return amount;
    return convertCurrency(amount, fromCurrency, selectedCurrency);
  };

  if (loading) return <div className="text-center py-8">Yükleniyor...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!data) return <div className="text-center py-8">Veri bulunamadı</div>;

  const totalRevenueConverted = convertAmount(data.totalRevenueTL, 'TRY') + convertAmount(data.totalRevenueUSD, 'USD');
  const driverPaymentsConverted = convertAmount(data.driverPayments, 'TRY');
  const netIncomeConverted = totalRevenueConverted - driverPaymentsConverted;

  return (
    <div className="space-y-6">
      {/* Para Birimi Seçici */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Rapor Para Birimi:</label>
          <select 
            value={selectedCurrency} 
            onChange={(e) => setSelectedCurrency(e.target.value as any)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="TRY">TRY (₺)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">Toplam Gelir</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenueConverted, selectedCurrency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.totalRevenueTL > 0 && `${formatCurrency(data.totalRevenueTL, 'TRY')} TRY`}
            {data.totalRevenueUSD > 0 && ` + ${formatCurrency(data.totalRevenueUSD, 'USD')} USD`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">Net Gelir</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(netIncomeConverted, selectedCurrency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Gelir - Şoför Ödemeleri
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">Toplam Transfer</h3>
          <p className="text-2xl font-bold text-purple-600">{data.totalTransfers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {data.paidTransfers} ödenmiş, {data.unpaidTransfers} ödenmemiş
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500">Şoför Ödemeleri</h3>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(driverPaymentsConverted, selectedCurrency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Toplam şoför komisyonu
          </p>
        </div>
      </div>

      {/* Transfer Türleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Transfer Türleri</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Havalimanı Alış</span>
              <span className="font-medium">{data.transfersByType.pickup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Havalimanı Bırakış</span>
              <span className="font-medium">{data.transfersByType.dropoff}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Şehir İçi Transfer</span>
              <span className="font-medium">{data.transfersByType.transfer}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Popüler Güzergahlar</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.popularRoutes.slice(0, 5).map((route, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="truncate">{route.route}</span>
                <span className="font-medium ml-2">{route.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Döviz Kuru Bilgisi */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Döviz Kurları</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">1 USD</div>
            <div className="text-gray-600">= 32.50 TRY</div>
          </div>
          <div className="text-center">
            <div className="font-medium">1 EUR</div>
            <div className="text-gray-600">= 35.20 TRY</div>
          </div>
          <div className="text-center">
            <div className="font-medium">1 EUR</div>
            <div className="text-gray-600">= 1.08 USD</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          * Kurlar günlük olarak güncellenmektedir
        </p>
      </div>
    </div>
  );
}
