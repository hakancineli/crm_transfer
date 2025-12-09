'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';

interface Vehicle {
  id: string;
  type: string;
  capacity: number;
  licensePlate: string;
  driverName?: string;
  driverPhone?: string;
  isAvailable: boolean;
  lastMaintenance?: string;
  tenant?: {
    id: string;
    companyName: string;
  };
}

const VEHICLE_TYPES = [
  { id: 'VITO_VIP', name: 'Mercedes Vito VIP', capacity: 6 },
  { id: 'SPRINTER_10', name: 'Mercedes Sprinter', capacity: 10 },
  { id: 'SPRINTER_13', name: 'Mercedes Sprinter', capacity: 13 },
  { id: 'SPRINTER_16', name: 'Mercedes Sprinter', capacity: 16 },
];

export default function TourVehiclesPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: '',
    customTypeName: '',
    capacity: 6,
    licensePlate: '',
    driverName: '',
    driverPhone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/tour-vehicles', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        console.error('Araçlar yüklenirken hata:', response.statusText);
        setVehicles([]);
      }
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async () => {
    if (!newVehicle.type || !newVehicle.licensePlate || !newVehicle.driverName) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      return;
    }

    try {
      setSaving(true);
      const vehicleType = VEHICLE_TYPES.find(vt => vt.id === newVehicle.type);

      // Determine final type and capacity
      const finalType = newVehicle.type === 'CUSTOM' ? newVehicle.customTypeName : newVehicle.type;
      const finalCapacity = newVehicle.type === 'CUSTOM' ? newVehicle.capacity : (vehicleType?.capacity || 6);

      const response = await fetch('/api/tour-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newVehicle.type === 'CUSTOM' ? newVehicle.customTypeName : newVehicle.type,
          capacity: newVehicle.type === 'CUSTOM' ? newVehicle.capacity : (vehicleType?.capacity || 6),
          licensePlate: newVehicle.licensePlate,
          driverName: newVehicle.driverName,
          driverPhone: newVehicle.driverPhone,
        }),
      });

      if (response.ok) {
        const newVehicleData = await response.json();
        setVehicles([...vehicles, newVehicleData]);
        setNewVehicle({ type: '', customTypeName: '', capacity: 6, licensePlate: '', driverName: '', driverPhone: '' });
        setShowAddForm(false);
        alert('Araç başarıyla eklendi!');
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error || 'Araç eklenirken bir hata oluştu'}`);
      }
    } catch (error) {
      console.error('Araç ekleme hatası:', error);
      alert('Araç eklenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const toggleVehicleStatus = (id: string) => {
    setVehicles(vehicles.map(vehicle =>
      vehicle.id === id ? { ...vehicle, isAvailable: !vehicle.isAvailable } : vehicle
    ));
  };

  const deleteVehicle = (id: string) => {
    if (confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    }
  };

  const getVehicleTypeName = (type: string) => {
    return VEHICLE_TYPES.find(vt => vt.id === type)?.name || type;
  };

  useEffect(() => {
    if (tourEnabled) {
      loadVehicles();
    }
  }, [tourEnabled]);

  if (!user || !canViewTourModule(user.role, user.permissions)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
    return null;
  }

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Araç Yönetimi</h1>
              <p className="mt-2 text-gray-600">Tur araçlarını yönetin ve yenilerini ekleyin</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAddForm ? 'İptal' : 'Yeni Araç Ekle'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{vehicles.length}</div>
            <div className="text-sm text-gray-600">Toplam Araç</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {vehicles.filter(v => v.isAvailable).length}
            </div>
            <div className="text-sm text-gray-600">Müsait</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {vehicles.filter(v => !v.isAvailable).length}
            </div>
            <div className="text-sm text-gray-600">Kullanımda</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {vehicles.reduce((sum, v) => sum + v.capacity, 0)}
            </div>
            <div className="text-sm text-gray-600">Toplam Kapasite</div>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Yeni Araç Ekle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Tipi *
                </label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Araç tipi seçin</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.capacity} kişi)
                    </option>
                  ))}
                  <option value="CUSTOM">Özel Araç Tipi</option>
                </select>
              </div>
              
              {/* Custom Type Name Input */}
              {newVehicle.type === 'CUSTOM' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Araç Tipi Adı *
                    </label>
                    <input
                      type="text"
                      value={newVehicle.customTypeName}
                      onChange={(e) => setNewVehicle({...newVehicle, customTypeName: e.target.value})}
                      placeholder="Örn: Mercedes Vito Lüks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapasite *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newVehicle.capacity}
                      onChange={(e) => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value) || 6})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaka *
                </label>
                <input
                  type="text"
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                  placeholder="34 ABC 123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şoför Adı *
                </label>
                <input
                  type="text"
                  value={newVehicle.driverName}
                  onChange={(e) => setNewVehicle({...newVehicle, driverName: e.target.value})}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şoför Telefonu
                </label>
                <input
                  type="text"
                  value={newVehicle.driverPhone}
                  onChange={(e) => setNewVehicle({...newVehicle, driverPhone: e.target.value})}
                  placeholder="+90 532 123 4567"
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
                onClick={addVehicle}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Ekleniyor...' : 'Araç Ekle'}
              </button>
            </div>
          </div>
        )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Araç Listesi</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Araç Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plaka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Şoför
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Bakım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getVehicleTypeName(vehicle.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.licensePlate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.capacity} kişi
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.driverName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.driverPhone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleVehicleStatus(vehicle.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${vehicle.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {vehicle.isAvailable ? 'Müsait' : 'Kullanımda'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteVehicle(vehicle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🚐</div>
          <p className="text-gray-500 mb-4">Henüz araç bulunmuyor</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            İlk Aracı Ekle
          </button>
        </div>
      )}
    </div>
    </div >
  );
}