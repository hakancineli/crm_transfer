'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';
import Link from 'next/link';

export default function NewAccommodationReservationPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const canCreate =
    user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.CREATE_RESERVATIONS)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.CREATE_RESERVATIONS && p.isActive);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/accommodation"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Konaklama Yönetimine Dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Konaklama Rezervasyonu</h1>
          <p className="text-gray-600">Yeni otel rezervasyonu oluşturun</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Konaklama Rezervasyon Formu</h2>
            <p className="text-gray-600 mb-6">
              Bu özellik henüz geliştirilme aşamasındadır. Yakında kullanıma sunulacaktır.
            </p>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Geliştirilecek Özellikler:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Otel arama ve seçimi</li>
                  <li>• Tarih ve oda tipi seçimi</li>
                  <li>• Misafir bilgileri girişi</li>
                  <li>• Fiyat hesaplama</li>
                  <li>• Rezervasyon onayı</li>
                </ul>
              </div>
              <Link
                href="/admin/accommodation"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Konaklama Yönetimine Git
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
