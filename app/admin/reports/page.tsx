'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import ReportsDashboard from './ReportsDashboard';

export default function ReportsPage() {
    const { user } = useAuth();
    const { isEnabled: isReportsEnabled, isLoading } = useModule('transfer');
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isReportsEnabled) {
            router.push('/admin');
        }
    }, [isLoading, isReportsEnabled, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isReportsEnabled) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Raporlar ve Muhasebe</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Finansal raporlar, transfer istatistikleri ve muhasebe yönetimi
                </p>
            </div>
            <ReportsDashboard />
        </div>
    );
}
