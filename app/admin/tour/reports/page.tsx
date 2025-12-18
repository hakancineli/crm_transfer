'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { canViewTourModule } from '@/app/lib/permissions';

interface ReportData {
  summary: {
    totalSales: Record<string, number>;
    totalPaid: Record<string, number>;
    totalPending: Record<string, number>;
    totalHeadcount: number;
    bookingCount: number;
  };
  byRoute: Array<{
    name: string;
    count: number;
    sales: Record<string, number>;
    headcount: number;
  }>;
  bySeller: Array<{
    id: string;
    name: string;
    count: number;
    sales: Record<string, number>;
    headcount: number;
  }>;
  currencies: string[];
}

export default function TourReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  // Date Filters (Default: This Month)
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  useEffect(() => {
    if (user && canViewTourModule(user.role, user.permissions)) {
      fetchReports();
    }
  }, [user, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/tour-reports?${query.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!data && loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Veri yüklenemedi.</div>;

  const { summary, byRoute, bySeller, currencies } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tur Satış Raporları</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-[1px]"
          >
            Yenile
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Toplam Satış</h3>
            <div className="text-lg font-bold text-gray-900 mt-2 space-y-1">
              {Object.entries(summary.totalSales).map(([curr, total]) => (
                <div key={curr}>
                  {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {curr}
                </div>
              ))}
              {Object.keys(summary.totalSales).length === 0 && <div>0.00</div>}
            </div>
            <div className="text-sm text-gray-500 mt-1">{summary.bookingCount} Rezervasyon</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50">
            <h3 className="text-sm font-medium text-green-700">Tahsil Edilen</h3>
            <div className="text-lg font-bold text-green-700 mt-2 space-y-1">
              {Object.entries(summary.totalPaid).map(([curr, total]) => (
                <div key={curr}>
                  {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {curr}
                </div>
              ))}
              {Object.keys(summary.totalPaid).length === 0 && <div>0.00</div>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
            <h3 className="text-sm font-medium text-yellow-700">Bekleyen Tahsilat</h3>
            <div className="text-lg font-bold text-yellow-700 mt-2 space-y-1">
              {Object.entries(summary.totalPending).map(([curr, total]) => (
                <div key={curr}>
                  {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {curr}
                </div>
              ))}
              {Object.keys(summary.totalPending).length === 0 && <div>0.00</div>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
            <h3 className="text-sm font-medium text-blue-700">Toplam Kişi (Pax)</h3>
            <div className="text-2xl font-bold text-blue-700 mt-2">
              {summary.totalHeadcount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales by Route */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Rotaya Göre Satışlar</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kişi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byRoute.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.headcount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {Object.entries(item.sales).map(([curr, total]) => (
                        <div key={curr}>
                          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {curr}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
                {byRoute.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Veri yok</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sales by Seller (Personnel) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Personel Performansı (Satış)</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kişi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bySeller.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.headcount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {Object.entries(item.sales).map(([curr, total]) => (
                        <div key={curr}>
                          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {curr}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
                {bySeller.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Veri yok</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
