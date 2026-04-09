'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/app/lib/permissions';

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  reservations?: any[];
  _count?: {
    reservations: number;
    tourBookings: number;
  };
}

export default function DriversPage() {
  const { user } = useAuth();
  const { isEnabled: isDriversEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phoneNumber: '' });

  const canViewDrivers =
    user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.VIEW_DRIVERS)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.VIEW_DRIVERS && p.isActive);
  const canManageDrivers =
    user?.role === 'SUPERUSER' ||
    (user?.role && (ROLE_PERMISSIONS as any)[user.role]?.includes(PERMISSIONS.MANAGE_DRIVERS)) ||
    user?.permissions?.some(p => p.permission === PERMISSIONS.MANAGE_DRIVERS && p.isActive);

  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isDriversEnabled) {
      router.push('/admin');
      return;
    }
    
    if (!canViewDrivers) return;
    fetchDrivers();
  }, [canViewDrivers, moduleLoading, isDriversEnabled, router]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/drivers', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Şoförler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newDriver),
      });

      if (response.ok) {
        setNewDriver({ name: '', phoneNumber: '' });
        setShowAddForm(false);
        fetchDrivers();
      }
    } catch (error) {
      console.error('Şoför eklenirken hata:', error);
    }
  };

  if (!canViewDrivers) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 dark:text-slate-400">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isDriversEnabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-slate-900/70 dark:border-slate-800 transition-colors duration-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Şoför Yönetimi</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                Şoförleri yönetin ve performanslarını takip edin
              </p>
            </div>
            {canManageDrivers && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ➕ Yeni Şoför Ekle
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 text-gray-900 dark:text-slate-100 transition-colors duration-200 rounded-3xl bg-white/70 dark:bg-slate-950/55 backdrop-blur-sm border border-white/60 dark:border-slate-800/80">
        {/* Add Driver Modal */}
        {showAddForm && canManageDrivers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900/90 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-slate-700 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Yeni Şoför Ekle</h3>
              <form onSubmit={handleAddDriver}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Şoför Adı
                  </label>
                  <input
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={newDriver.phoneNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-100 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors duration-200"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [&>div]:dark:!bg-slate-900 [&_a]:transition-colors [&_button]:transition-colors">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white dark:!bg-slate-900 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center transition-colors duration-200">
                  <span className="text-green-600 dark:text-emerald-300 text-xl">👨‍✈️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:!text-slate-50">{driver.name}</h3>
                  <p className="text-sm text-gray-500 dark:!text-slate-300">{driver.phoneNumber}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Toplam Transfer:</span>
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {(driver._count?.reservations || 0) + (driver._count?.tourBookings || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Kayıt Tarihi:</span>
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {new Date(driver.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/admin/drivers/${driver.id}`}
                  className="flex-1 bg-green-50 dark:!bg-emerald-500/15 border border-green-200 dark:border-emerald-500/25 text-green-700 dark:!text-emerald-200 py-2 px-3 rounded-lg text-center text-sm font-semibold hover:bg-green-100 dark:hover:!bg-emerald-500/25 transition-colors"
                >
                  Detaylar
                </Link>
                <button className="flex-1 bg-gray-50 dark:!bg-slate-800/90 border border-gray-200 dark:border-slate-600 text-gray-700 dark:!text-slate-100 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:!bg-slate-700 transition-colors">
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>

        {drivers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-slate-500 text-6xl mb-4">👨‍✈️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Henüz Şoför Yok</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              İlk şoförünüzü ekleyerek başlayın.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ➕ İlk Şoförü Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
