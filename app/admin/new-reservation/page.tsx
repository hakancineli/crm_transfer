'use client';

import ReservationForm from '@/app/components/ReservationForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';
import { useGoogleMaps } from '@/app/hooks/useGoogleMaps';

export default function AdminNewReservationPage() {
  const { user } = useAuth();
  const { isLoaded, isLoading, error } = useGoogleMaps();

  const canCreate =
    user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.CREATE_RESERVATIONS)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.CREATE_RESERVATIONS && p.isActive);
  if (!canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Yeni Rezervasyon (Admin)</h1>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <ReservationForm 
            isOpen={true} 
            onClose={() => { window.location.href = '/admin/reservations'; }} 
            tenantId={undefined}
          />
        </div>
      </div>
    </div>
  );
}
