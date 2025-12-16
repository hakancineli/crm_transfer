'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';

interface TourRoute {
  id: string;
  name: string;
  duration: number;
  basePrice: number;
  currency?: string;
  description?: string;
  isActive: boolean;
}

export default function TourRoutesPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');
  const [routes, setRoutes] = useState<TourRoute[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoute, setNewRoute] = useState({
    name: '',
    duration: 8,
    price: 0,
    currency: 'EUR',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has permission to view tour module
    if (!user || !canViewTourModule(user.role, user.permissions)) {
      window.location.href = '/admin';
      return;
    }

    if (tourEnabled) {
      fetchRoutes();
    }
  }, [tourEnabled, user]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Get routes from API
      const response = await fetch('/api/tour-routes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        console.error('Tur rotaları yüklenemedi');
      }
    } catch (error) {
      console.error('Tur rotaları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
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

  const handleAddRoute = async () => {
    if (newRoute.name && newRoute.price > 0) {
      try {
        const response = await fetch('/api/tour-routes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newRoute),
        });

        if (response.ok) {
          const newRouteData = await response.json();
          setRoutes(prev => [...prev, newRouteData]);
          setNewRoute({ name: '', duration: 8, price: 0, currency: 'EUR', description: '' });
          setShowAddForm(false);
        } else {
          const error = await response.json();
          alert('Hata: ' + (error.error || 'Tur rotası oluşturulamadı'));
        }
      } catch (error) {
        console.error('Tur rotası oluşturma hatası:', error);
        alert('Tur rotası oluşturulurken bir hata oluştu');
      }
    } else {
      alert('Lütfen rota adı ve fiyat girin');
    }
  };

  const toggleRouteStatus = (id: string) => {
    // Implement API call for toggle if needed, for now just local state update or ignore
    // Ideally this should be an API call to PUT /api/tour-routes/[id]
    setRoutes(routes.map(route =>
      route.id === id ? { ...route, isActive: !route.isActive } : route
    ));
  };

  const deleteRoute = (id: string) => {
    if (confirm('Bu rotayı silmek istediğinizden emin misiniz?')) {
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tur Rotaları</h1>
              <p className="mt-2 text-gray-600">Mevcut tur rotalarını yönetin ve yenilerini ekleyin</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAddForm ? 'İptal' : 'Yeni Rota Ekle'}
            </button>
          </div>
        </div>

        {/* Add Route Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Yeni Tur Rotası</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rota Adı *
                </label>
                <input
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  placeholder="Örn: Antalya Turu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Süre (Saat) *
                </label>
                <input
                  type="number"
                  value={newRoute.duration}
                  onChange={(e) => setNewRoute({ ...newRoute, duration: parseInt(e.target.value) })}
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat *
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={newRoute.price}
                    onChange={(e) => setNewRoute({ ...newRoute, price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    placeholder="Fiyat girin"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newRoute.currency}
                    onChange={(e) => setNewRoute({ ...newRoute, currency: e.target.value })}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={newRoute.description}
                  onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                  placeholder="Örn: Antalya, Side, Aspendos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddRoute}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Rota Ekle
              </button>
            </div>
          </div>
        )}

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleRouteStatus(route.id)}
                    className={`px-2 py-1 text-xs rounded-full ${route.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {route.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                  {route.id.startsWith('custom-') && (
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Süre:</span>
                  <span className="font-medium">{route.duration} saat</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fiyat:</span>
                  <span className="font-medium">
                    <div className="text-2xl font-bold text-gray-900">
                      {route.currency === 'EUR' ? '€' : route.currency === 'USD' ? '$' : '₺'}
                      {route.basePrice}
                    </div></span>
                </div>                {route.description && (
                  <div className="text-sm text-gray-600 mt-2">
                    {route.description}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/admin/tour/reservations/new?route=${route.id}`}
                  className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 block"
                >
                  Bu Rota ile Rezervasyon
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {routes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-gray-500 mb-4">Henüz tur rotası bulunmuyor</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              İlk Rota Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

