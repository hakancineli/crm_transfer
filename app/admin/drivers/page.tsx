'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  reservations?: any[];
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phoneNumber: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/drivers');
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
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Şoför Yönetimi</h1>
              <p className="mt-1 text-sm text-gray-600">
                Şoförleri yönetin ve performanslarını takip edin
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Yeni Şoför Ekle
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Add Driver Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Şoför Ekle</h3>
              <form onSubmit={handleAddDriver}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şoför Adı
                  </label>
                  <input
                    type="text"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={newDriver.phoneNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">👨‍✈️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                  <p className="text-sm text-gray-500">{driver.phoneNumber}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Toplam Transfer:</span>
                  <span className="font-medium">{driver.reservations?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kayıt Tarihi:</span>
                  <span className="font-medium">
                    {new Date(driver.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={`/admin/drivers/${driver.id}`}
                  className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-center text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Detaylar
                </Link>
                <button className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>

        {drivers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍✈️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Şoför Yok</h3>
            <p className="text-gray-500 mb-4">
              İlk şoförünüzü ekleyerek başlayın.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ İlk Şoförü Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
