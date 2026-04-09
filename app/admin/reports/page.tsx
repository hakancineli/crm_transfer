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
            return;
        }

        // Check if user has permission to view reports
        if (user && !isLoading) {
            const hasViewReportsPermission = user?.permissions?.some(p => 
                p.permission === 'VIEW_REPORTS' && p.isActive
            );
            
            // Allow SUPERUSER, AGENCY_ADMIN, OPERATION, ACCOUNTANT to access reports
            const allowedRoles = ['SUPERUSER', 'AGENCY_ADMIN', 'OPERATION', 'ACCOUNTANT'];
            const hasRoleAccess = allowedRoles.includes(user.role);
            
            if (!hasRoleAccess && !hasViewReportsPermission) {
                router.push('/admin');
                return;
            }
        }
    }, [isLoading, isReportsEnabled, user, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
                <div className="text-center text-gray-900 dark:text-slate-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-slate-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isReportsEnabled) {
        return null;
    }

    // Check permissions before rendering
    if (user) {
        const hasViewReportsPermission = user?.permissions?.some(p => 
            p.permission === 'VIEW_REPORTS' && p.isActive
        );
        
        const allowedRoles = ['SUPERUSER', 'AGENCY_ADMIN', 'OPERATION', 'ACCOUNTANT'];
        const hasRoleAccess = allowedRoles.includes(user.role);
        
        if (!hasRoleAccess && !hasViewReportsPermission) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
                    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-800 transition-colors duration-200">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Yetkisiz Erişim</h1>
                        <p className="text-gray-600 dark:text-slate-400">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100 transition-colors duration-200">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Raporlar ve Muhasebe</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                    Finansal raporlar, transfer istatistikleri ve muhasebe yönetimi
                </p>
            </div>
            <ReportsDashboard />
        </div>
    );
}
