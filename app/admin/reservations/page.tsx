'use client';

import { useState } from 'react';
import ReservationList from './ReservationList';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

export default function ReservationsPage() {
    const { t, dir } = useLanguage();
    const { user } = useAuth();
    const [title, setTitle] = useState(t('admin.reservations.allReservations'));
    const [description, setDescription] = useState(t('admin.reservations.allReservationsDescription'));

    const canViewAll =
        user?.role === 'SUPERUSER' ||
        (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.VIEW_ALL_RESERVATIONS)) ||
        user?.permissions?.some(p => p.permission === PERMISSIONS.VIEW_ALL_RESERVATIONS && p.isActive);
    if (!canViewAll) {
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