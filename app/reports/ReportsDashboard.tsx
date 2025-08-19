'use client';

import { useState, useEffect } from 'react';
import { startOfDay, endOfDay, format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
    popularRoutes: {
        route: string;
        count: number;
    }[];
}

export default function ReportsDashboard() {
    const today = new Date();
    const [startDate, setStartDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReportData();
    }, [startDate, endDate]);

    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // API string tarih (YYYY-MM-DD) bekleyecek
                    startDate,
                    endDate,
                }),
            });
            
            const data = await response.json();

            if (!response.ok || data?.error) {
                setReportData(null);
                setError(data?.error || 'Rapor verisi getirilemedi');
                return;
            }

            const safeData: ReportData = {
                totalRevenueUSD: Number(data.totalRevenueUSD) || 0,
                totalRevenueTL: Number(data.totalRevenueTL) || 0,
                usdRate: Number(data.usdRate) || 0,
                totalTransfers: Number(data.totalTransfers) || 0,
                paidTransfers: Number(data.paidTransfers) || 0,
                unpaidTransfers: Number(data.unpaidTransfers) || 0,
                driverPayments: Number(data.driverPayments) || 0,
                netIncome: Number(data.netIncome) || 0,
                transfersByType: {
                    pickup: Number(data?.transfersByType?.pickup) || 0,
                    dropoff: Number(data?.transfersByType?.dropoff) || 0,
                    transfer: Number(data?.transfersByType?.transfer) || 0,
                },
                popularRoutes: Array.isArray(data.popularRoutes) ? data.popularRoutes : [],
            };

            setReportData(safeData);
        } catch (error) {
            console.error('Rapor verisi getirme hatası:', error);
            setError('Rapor verisi getirme hatası');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tarih Aralığı Seçici */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tarih Aralığı Seçin</h2>
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Başlangıç Tarihi
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Bitiş Tarihi
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : error ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : reportData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Finansal Özet */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Finansal Özet</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">USD Satış Toplamı</dt>
                                <dd className="text-2xl font-semibold text-green-600">{Number(reportData.totalRevenueUSD || 0).toFixed(2)} USD</dd>
                                <dt className="text-sm text-gray-500 mt-1">USD/TL Kuru</dt>
                                <dd className="text-lg font-medium text-gray-600">{Number(reportData.usdRate || 0).toFixed(2)} TL</dd>
                                <dt className="text-sm text-gray-500 mt-2">TL Karşılığı</dt>
                                <dd className="text-xl font-semibold text-green-600">{Number(reportData.totalRevenueTL || 0).toFixed(2)} TL</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Şoför Hakediş (TL)</dt>
                                <dd className="text-2xl font-semibold text-red-600">{Number(reportData.driverPayments || 0).toFixed(2)} TL</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Şirket Karı (TL)</dt>
                                <dd className="text-2xl font-semibold text-blue-600">{Number(reportData.netIncome || 0).toFixed(2)} TL</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Transfer İstatistikleri */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer İstatistikleri</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">Toplam Transfer</dt>
                                <dd className="text-2xl font-semibold text-gray-900">{reportData.totalTransfers}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Ödenen</dt>
                                    <dd className="text-xl font-semibold text-green-600">{reportData.paidTransfers}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Ödenmeyen</dt>
                                    <dd className="text-xl font-semibold text-red-600">{reportData.unpaidTransfers}</dd>
                                </div>
                            </div>
                        </dl>
                    </div>

                    {/* Transfer Tipleri */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Tipleri</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">Karşılama</dt>
                                <dd className="text-xl font-semibold text-blue-600">{reportData.transfersByType.pickup}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Çıkış</dt>
                                <dd className="text-xl font-semibold text-orange-600">{reportData.transfersByType.dropoff}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Ara Transfer</dt>
                                <dd className="text-xl font-semibold text-purple-600">{reportData.transfersByType.transfer}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Popüler Rotalar */}
                    <div className="bg-white p-6 rounded-lg shadow col-span-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Popüler Rotalar</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Sayısı</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(reportData.popularRoutes || []).map((route, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.route}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{route.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-600">Rapor görüntülemek için tarih aralığı seçin</p>
                </div>
            )}
        </div>
    );
} 