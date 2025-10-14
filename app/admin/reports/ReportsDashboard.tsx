'use client';

import { useState, useEffect } from 'react';
import { startOfDay, endOfDay, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
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
        tour: number;
        accommodation: number;
        flight: number;
    };
    popularRoutes: {
        route: string;
        count: number;
    }[];
}

export default function ReportsDashboard() {
    const { user } = useAuth();
    const { emojisEnabled } = useEmoji();
    const { t } = useLanguage();
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const [startDate, setStartDate] = useState<string>(format(thirtyDaysAgo, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(today, 'yyyy-MM-dd'));
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounced tarihler - 500ms gecikme ile
    const debouncedStartDate = useDebounce(startDate, 500);
    const debouncedEndDate = useDebounce(endDate, 500);

    useEffect(() => {
        // İlk yüklemede raporu getir
        if (user) {
            fetchReportData();
        }
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
                    tour: Number(data?.transfersByType?.tour) || 0,
                    accommodation: Number(data?.transfersByType?.accommodation) || 0,
                    flight: Number(data?.transfersByType?.flight) || 0,
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
                            {t('crm.reports.errorTitle')}
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={fetchReportData}
                                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                            >
                                {t('crm.reports.retry')}
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
                <p className="text-gray-500">{t('crm.reports.noData')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tarih Filtreleri */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('crm.reports.dateRange')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('crm.reports.startDate')}
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
                            {t('crm.reports.endDate')}
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
                            {isLoading ? t('common.loading') : t('crm.reports.updateNow')}
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
                            <p className="text-sm font-medium text-gray-500">{t('crm.reports.summary.revenueTL')}</p>
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
                            <p className="text-sm font-medium text-gray-500">{t('crm.reports.summary.revenueUSD')}</p>
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
                            <p className="text-sm font-medium text-gray-500">{t('crm.reports.summary.totalTransfers')}</p>
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
                            <p className="text-sm font-medium text-gray-500">{t('crm.reports.summary.netIncome')}</p>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('crm.reports.payment.title')}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('crm.reports.payment.paid')}</span>
                            <span className="font-semibold text-green-600">{reportData.paidTransfers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('crm.reports.payment.unpaid')}</span>
                            <span className="font-semibold text-red-600">{reportData.unpaidTransfers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('crm.reports.payment.driverPayments')}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(reportData.driverPayments)}</span>
                        </div>
                    </div>
                </div>

                {/* Transfer Tipleri */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('crm.reports.types.title')}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('crm.reports.types.pickup')}</span>
                            <span className="font-semibold text-blue-600">{reportData.transfersByType.pickup}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('crm.reports.types.dropoff')}</span>
                            <span className="font-semibold text-green-600">{reportData.transfersByType.dropoff}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('crm.reports.types.transfer')}</span>
                            <span className="font-semibold text-purple-600">{reportData.transfersByType.transfer}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popüler Rotalar */}
            {reportData.popularRoutes.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('crm.reports.popularRoutes.title')}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('crm.reports.popularRoutes.route')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('crm.reports.popularRoutes.count')}</th>
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
                        <h3 className="text-lg font-semibold text-gray-900">{t('crm.reports.usdRate.title')}</h3>
                        <p className="text-sm text-gray-600">{t('crm.reports.usdRate.subtitle')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                            {t('crm.reports.usdRate.unit').replace('{rate}', reportData.usdRate.toFixed(2))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
