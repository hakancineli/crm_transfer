'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { useRouter } from 'next/navigation';
import { Currency, CURRENCIES } from '@/app/types';
import { apiPost } from '@/app/lib/api';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';

interface VehicleType {
  id: string;
  name: string;
  capacity: number;
}

interface TourRoute {
  id: string;
  name: string;
  duration: number;
  price: number;
  capacity?: number;
}

const VEHICLE_TYPES: VehicleType[] = [
  { id: 'VITO_VIP', name: 'Mercedes Vito VIP', capacity: 6 },
  { id: 'SPRINTER_10', name: 'Mercedes Sprinter', capacity: 10 },
  { id: 'SPRINTER_13', name: 'Mercedes Sprinter', capacity: 13 },
  { id: 'SPRINTER_16', name: 'Mercedes Sprinter', capacity: 16 },
];

const TOUR_ROUTES: TourRoute[] = [
  { id: 'istanbul-city', name: 'İstanbul Şehir Turu', duration: 10, price: 150, capacity: 16 },
  { id: 'cappadocia', name: 'Kapadokya Turu', duration: 10, price: 300, capacity: 16 },
  { id: 'trabzon', name: 'Trabzon Turu', duration: 10, price: 250, capacity: 16 },
  { id: 'sapanca', name: 'Sapanca Turu', duration: 10, price: 200, capacity: 16 },
  { id: 'abant', name: 'Abant Turu', duration: 10, price: 180, capacity: 16 },
  { id: 'bursa', name: 'Bursa Turu', duration: 10, price: 220, capacity: 16 },
];

export default function NewTourReservationPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');
  const router = useRouter();
  
  // Bugünün tarihini YYYY-MM-DD formatında al
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    routeId: '',
    customRouteName: '',
    vehicleType: '',
    groupSize: 1,
    price: '' as number | string,
    currency: 'USD' as Currency,
    pickupLocation: '',
    tourDate: today, // Default olarak bugün
    tourTime: '09:00', // Default saat
    tourDuration: 1, // Default 1 gün
    passengerNames: [''],
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TourRoute | null>(null);

  useEffect(() => {
    // Check if user has permission to view tour module
    if (!user || !canViewTourModule(user.role, user.permissions)) {
      router.push('/admin');
      return;
    }

    if (!isLoading && !tourEnabled) {
      router.push('/admin/tour');
    }
  }, [tourEnabled, isLoading, router, user]);

  useEffect(() => {
    if (formData.routeId) {
      const route = TOUR_ROUTES.find(r => r.id === formData.routeId);
      setSelectedRoute(route || null);
      if (route) {
        setFormData(prev => ({
          ...prev,
          groupSize: Math.min(prev.groupSize, route.capacity || 16)
        }));
      }
    }
  }, [formData.routeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Özel rota seçildiğinde fiyatı sıfırla
    if (name === 'routeId' && value === 'custom') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        price: '',
        customRouteName: ''
      }));
    } else if (name === 'groupSize') {
      // Kişi sayısı değiştiğinde yolcu isimlerini güncelle
      const newGroupSize = parseInt(value) || 1;
      const currentPassengerNames = formData.passengerNames;
      
      let newPassengerNames;
      if (newGroupSize > currentPassengerNames.length) {
        // Daha fazla kişi eklendi, boş isimler ekle
        newPassengerNames = [...currentPassengerNames, ...Array(newGroupSize - currentPassengerNames.length).fill('')];
      } else if (newGroupSize < currentPassengerNames.length) {
        // Daha az kişi, fazla isimleri kaldır
        newPassengerNames = currentPassengerNames.slice(0, newGroupSize);
      } else {
        // Aynı sayıda, değişiklik yok
        newPassengerNames = currentPassengerNames;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        passengerNames: newPassengerNames
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePassengerNameChange = (index: number, value: string) => {
    const newPassengerNames = [...formData.passengerNames];
    newPassengerNames[index] = value;
    setFormData(prev => ({
      ...prev,
      passengerNames: newPassengerNames
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiPost('/api/tour-bookings', {
        ...formData,
        price: formData.price === '' ? 0 : Number(formData.price),
        routeName: formData.customRouteName || selectedRoute?.name,
        passengerNames: formData.passengerNames.filter(name => name.trim() !== ''),
      });

      if (response.ok) {
        const result = await response.json();
        router.push('/admin/tour/reservations');
      } else {
        const error = await response.json();
        alert('Hata: ' + (error.message || 'Rezervasyon oluşturulamadı'));
      }
    } catch (error) {
      console.error('Rezervasyon oluşturma hatası:', error);
      alert('Rezervasyon oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600">Tur modülü aktif değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Tur Rezervasyonu</h1>
              <p className="mt-2 text-gray-600">Grup turu için rezervasyon oluşturun</p>
            </div>
            <Link
              href="/admin/tour/reservations"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Geri Dön
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Tur Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tur Rotası */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Rotası *
                </label>
                <select
                  name="routeId"
                  value={formData.routeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Rota seçin</option>
                  {TOUR_ROUTES.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.duration} saat)
                    </option>
                  ))}
                  <option value="custom">Özel Rota</option>
                </select>
              </div>

              {/* Özel Rota Adı - Sadece "Özel Rota" seçildiğinde görünür */}
              {formData.routeId === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel Rota Adı *
                  </label>
                  <input
                    type="text"
                    name="customRouteName"
                    value={formData.customRouteName}
                    onChange={handleInputChange}
                    placeholder="Özel rota adı girin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.routeId === 'custom'}
                  />
                </div>
              )}

              {/* Araç Tipi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Tipi *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Araç tipi seçin</option>
                  {VEHICLE_TYPES.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.capacity} kişi)
                    </option>
                  ))}
                </select>
              </div>

              {/* Kişi Sayısı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kişi Sayısı *
                </label>
                <input
                  type="number"
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  min="1"
                  max="16"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Fiyatı
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Fiyat girin (opsiyonel)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CURRENCIES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alınma Yeri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alınma Yeri *
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Örn: Sultanahmet Meydanı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tur Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Tarihi *
                </label>
                <input
                  type="date"
                  name="tourDate"
                  value={formData.tourDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tur Saati */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Saati *
                </label>
                <input
                  type="time"
                  name="tourTime"
                  value={formData.tourTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tur Süresi (Gün) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Süresi (Gün) *
                </label>
                <select
                  name="tourDuration"
                  value={formData.tourDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {day} {day === 1 ? 'Gün' : 'Gün'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Yolcu Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Yolcu Bilgileri</h2>
              <p className="text-sm text-gray-600 mt-1">
                Kişi sayısını yukarıdaki "Kişi Sayısı" alanından değiştirebilirsiniz
              </p>
            </div>

            <div className="space-y-4">
              {formData.passengerNames.map((name, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                      placeholder={`Yolcu ${index + 1} adı`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notlar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notlar</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Özel notlar, istekler..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/tour/reservations"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Oluşturuluyor...' : 'Rezervasyon Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

