'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import Link from 'next/link';

export default function TourPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!tourEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Modül Kapalı</h1>
          <p className="text-gray-600">Tur modülü aktif değil. Modül Yönetimi'nden aktifleştirin.</p>
          <Link 
            href="/admin/modules"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Modül Yönetimi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tur Yönetimi</h1>
          <p className="mt-2 text-gray-600">Grup turları ve turizm acenteleri için özel yönetim</p>
        </div>

        {/* Hızlı İşlemler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/tour/reservations"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🚌</div>
              <h3 className="text-lg font-semibold text-gray-900">Tur Rezervasyonları</h3>
              <p className="text-sm text-gray-600">Tüm tur rezervasyonlarını görüntüle</p>
            </div>
          </Link>

          <Link
            href="/admin/tour/routes"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🗺️</div>
              <h3 className="text-lg font-semibold text-gray-900">Tur Rotaları</h3>
              <p className="text-sm text-gray-600">Tur rotalarını yönet</p>
            </div>
          </Link>

          <Link
            href="/admin/tour/vehicles"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🚐</div>
              <h3 className="text-lg font-semibold text-gray-900">Araç Yönetimi</h3>
              <p className="text-sm text-gray-600">Tur araçlarını yönet</p>
            </div>
          </Link>

          <Link
            href="/admin/tour/reports"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-gray-900">Tur Raporları</h3>
              <p className="text-sm text-gray-600">Detaylı tur analizleri</p>
            </div>
          </Link>
        </div>

        {/* Son Turlar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Son Turlar</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚌</div>
              <p className="text-gray-500">Henüz tur rezervasyonu bulunmuyor</p>
              <Link 
                href="/admin/tour/reservations"
                className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Yeni Tur Rezervasyonu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


