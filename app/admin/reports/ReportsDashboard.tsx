'use client';

import { useState, useEffect } from 'react';
import { startOfDay, endOfDay, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEmoji } from '@/app/contexts/EmojiContext';
import { useDebounce } from '@/app/hooks/useDebounce';

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
    const { emojisEnabled } = useEmoji();
    const today = new Date();
    const [startDate, setStartDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounced tarihler - 500ms gecikme ile
    const debouncedStartDate = useDebounce(startDate, 500);
    const debouncedEndDate = useDebounce(endDate, 500);

    useEffect(() => {
        // Check if user has permission to view reports
        const hasViewReportsPermission = user?.permissions?.some(p => 
            p.permission === 'VIEW_REPORTS' && p.isActive
        );
        
        // Allow SUPERUSER to access reports
        if (user && user.role !== 'SUPERUSER' && !hasViewReportsPermission) {
            window.location.href = '/admin';
            return;
        }
        // İlk yüklemede raporu getir
        fetchReportData();
    }, [user]); // Sadece user değiştiğinde çalışsın

    // Debounced tarihler değiştiğinde otomatik güncelle
    useEffect(() => {
        if (user) {
            fetchReportData();
        }
    }, [debouncedStartDate, debouncedEndDate]);

    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startDate: debouncedStartDate,
                    endDate: debouncedEndDate,
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

    const formatCurrency = (amount: number, currency: string = 'TL') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency === 'USD' ? 'USD' : 'TRY',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Rapor Yüklenemedi
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={fetchReportData}
                                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Rapor verisi bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tarih Filtreleri */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarih Aralığı</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Başlangıç Tarihi
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bitiş Tarihi
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReportData}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Yükleniyor...' : 'Hemen Güncelle'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold">₺</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Toplam Gelir (TL)</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(reportData.totalRevenueTL)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">$</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Toplam Gelir (USD)</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(reportData.totalRevenueUSD, 'USD')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-semibold">🚗</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Toplam Transfer</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {reportData.totalTransfers}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 font-semibold">💰</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Net Gelir</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {formatCurrency(reportData.netIncome)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detaylı İstatistikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ödeme Durumu */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Durumu</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ödenen Transferler</span>
                            <span className="font-semibold text-green-600">{reportData.paidTransfers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ödenmemiş Transferler</span>
                            <span className="font-semibold text-red-600">{reportData.unpaidTransfers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Şoför Ödemeleri</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(reportData.driverPayments)}</span>
                        </div>
                    </div>
                </div>

                {/* Transfer Tipleri */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Tipleri</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Havaalanından Alış</span>
                            <span className="font-semibold text-blue-600">{reportData.transfersByType.pickup}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Havaalanına Gidiş</span>
                            <span className="font-semibold text-green-600">{reportData.transfersByType.dropoff}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Şehir İçi Transfer</span>
                            <span className="font-semibold text-purple-600">{reportData.transfersByType.transfer}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popüler Rotalar */}
            {reportData.popularRoutes.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popüler Rotalar</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rota
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transfer Sayısı
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.popularRoutes.map((route, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {route.route}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {route.count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* USD Kuru */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Güncel USD Kuru</h3>
                        <p className="text-sm text-gray-600">Rapor oluşturulma tarihindeki kur</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                            1 USD = {reportData.usdRate.toFixed(2)} TL
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
