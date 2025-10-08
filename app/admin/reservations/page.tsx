'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReservationList from './ReservationList';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

export default function ReservationsPage() {
    const { t, dir } = useLanguage();
    const { user } = useAuth();
    const { isEnabled: isReservationsEnabled, isLoading: moduleLoading } = useModule('transfer');
    const router = useRouter();
    const [title, setTitle] = useState(t('admin.reservations.allReservations'));
    const [description, setDescription] = useState(t('admin.reservations.allReservationsDescription'));

    useEffect(() => {
        if (moduleLoading) return;
        
        if (!isReservationsEnabled) {
            router.push('/admin');
            return;
        }
    }, [moduleLoading, isReservationsEnabled, router]);

    const rolePerms = user?.role ? (ROLE_PERMISSIONS as any)[user.role] || [] : [];
    const has = (perm: string) => rolePerms.includes(perm) || user?.permissions?.some(p => p.permission === perm && p.isActive);
    const canViewAll = user?.role === 'SUPERUSER' || has(PERMISSIONS.VIEW_ALL_RESERVATIONS);
    const canViewOwn = has(PERMISSIONS.VIEW_OWN_SALES) || has(PERMISSIONS.CREATE_RESERVATIONS);

    if (moduleLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!isReservationsEnabled) {
        return null;
    }

    if (!canViewAll && !canViewOwn) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Yetkisiz Erişim</h1>
                    <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                </div>
            </div>
        );
    }

    const handleFilterChange = (filter: string) => {
        switch (filter) {
            case 'today':
                setTitle(t('admin.reservations.todayTransfers'));
                setDescription(t('admin.reservations.todayTransfersDescription'));
                break;
            case 'tomorrow':
                setTitle(t('admin.reservations.tomorrowTransfers'));
                setDescription(t('admin.reservations.tomorrowTransfersDescription'));
                break;
            case 'thisWeek':
                setTitle(t('admin.reservations.thisWeekTransfers'));
                setDescription(t('admin.reservations.thisWeekTransfersDescription'));
                break;
            case 'assigned':
                setTitle(t('admin.reservations.assignedTransfers'));
                setDescription(t('admin.reservations.assignedTransfersDescription'));
                break;
            case 'unassigned':
                setTitle(t('admin.reservations.unassignedTransfers'));
                setDescription(t('admin.reservations.unassignedTransfersDescription'));
                break;
            default:
                setTitle(t('admin.reservations.allReservations'));
                setDescription(t('admin.reservations.allReservationsDescription'));
                break;
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                <p className="mt-2 text-sm text-gray-600">
                    {description}
                </p>
            </div>
            <ReservationList onFilterChange={handleFilterChange} />
        </div>
    );
}