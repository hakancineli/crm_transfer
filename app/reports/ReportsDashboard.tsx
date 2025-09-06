'use client';

import { useState, useEffect } from 'react';
import { startOfDay, endOfDay, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/app/contexts/AuthContext';

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
    const { user } = useAuth();
    const today = new Date();
    const [startDate, setStartDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user has permission to view reports
        const hasViewReportsPermission = user?.permissions?.some(p => 
            p.permission === 'VIEW_REPORTS' && p.isActive
        );
        
        if (user && !hasViewReportsPermission) {
            window.location.href = '/admin';
            return;
        }
        fetchReportData();
    }, [startDate, endDate, user]);

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

    // Check permissions before rendering
    const hasViewReportsPermission = user?.permissions?.some(p => 
        p.permission === 'VIEW_REPORTS' && p.isActive
    );
    
    if (user && !hasViewReportsPermission) {
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
                                <p>Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece yetkili kullanıcılar raporları görebilir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Tarih Aralığı Seçici */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-green-600 text-lg">📅</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Tarih Aralığı Seçin</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                📅 Başlangıç Tarihi
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200 hover:border-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                                📅 Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200 hover:border-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-500 mb-4"></div>
                        <p className="text-gray-600 text-lg">Raporlar yükleniyor...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Hata Oluştu</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : reportData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Finansal Özet */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-96 flex flex-col relative z-10">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-green-600 text-2xl">💰</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Finansal Özet</h3>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-700 font-medium">USD Satış Toplamı</p>
                                            <p className="text-2xl font-bold text-green-800">{Number(reportData.totalRevenueUSD || 0).toFixed(2)} USD</p>
                                        </div>
                                        <span className="text-green-600 text-2xl">💵</span>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium">USD/TL Kuru</p>
                                            <p className="text-lg font-semibold text-blue-800">{Number(reportData.usdRate || 0).toFixed(2)} TL</p>
                                        </div>
                                        <span className="text-blue-600 text-xl">📈</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-700 font-medium">TL Karşılığı</p>
                                            <p className="text-xl font-bold text-green-800">{Number(reportData.totalRevenueTL || 0).toFixed(2)} TL</p>
                                        </div>
                                        <span className="text-green-600 text-xl">🇹🇷</span>
                                    </div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-red-700 font-medium">Şoför Hakedişi</p>
                                            <p className="text-xl font-bold text-red-800">{Number(reportData.driverPayments || 0).toFixed(2)} TL</p>
                                        </div>
                                        <span className="text-red-600 text-xl">👨‍✈️</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-purple-700 font-medium">Şirket Karı</p>
                                            <p className="text-xl font-bold text-purple-800">{Number(reportData.netIncome || 0).toFixed(2)} TL</p>
                                        </div>
                                        <span className="text-purple-600 text-xl">🏢</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transfer İstatistikleri */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-96 flex flex-col relative z-10">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-blue-600 text-2xl">🚗</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Transfer İstatistikleri</h3>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 font-medium">Toplam Transfer</p>
                                            <p className="text-3xl font-bold text-gray-900">{reportData.totalTransfers}</p>
                                        </div>
                                        <span className="text-gray-600 text-3xl">📊</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-700 font-medium">Ödenen</p>
                                                <p className="text-2xl font-bold text-green-800">{reportData.paidTransfers}</p>
                                            </div>
                                            <span className="text-green-600 text-xl">✅</span>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-red-700 font-medium">Ödenmeyen</p>
                                                <p className="text-2xl font-bold text-red-800">{reportData.unpaidTransfers}</p>
                                            </div>
                                            <span className="text-red-600 text-xl">❌</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transfer Tipleri */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 h-96 flex flex-col relative z-10">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-purple-600 text-2xl">🎯</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Transfer Tipleri</h3>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium">Karşılama</p>
                                            <p className="text-2xl font-bold text-blue-800">{reportData.transfersByType.pickup}</p>
                                        </div>
                                        <span className="text-blue-600 text-xl">✈️</span>
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-orange-700 font-medium">Çıkış</p>
                                            <p className="text-2xl font-bold text-orange-800">{reportData.transfersByType.dropoff}</p>
                                        </div>
                                        <span className="text-orange-600 text-xl">🚪</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Popüler Rotalar */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-full relative z-10">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-indigo-600 text-2xl">🗺️</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Popüler Rotalar</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <span className="mr-2">📍</span>
                                                    Rota
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                <div className="flex items-center justify-end">
                                                    <span className="mr-2">📊</span>
                                                    Transfer Sayısı
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(reportData.popularRoutes || []).map((route, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                                        {route.route}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                        {route.count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-600 text-2xl">📊</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Rapor Hazır</h3>
                        <p className="text-gray-600">Rapor görüntülemek için tarih aralığı seçin</p>
                    </div>
                )}
            </div>
        </div>
    );
}