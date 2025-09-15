'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { apiGet, apiPut, apiDelete } from '@/app/lib/api';
import { canViewTourModule } from '@/app/lib/permissions';

interface TourBooking {
  id: string;
  voucherNumber: string;
  routeName: string;
  vehicleType: string;
  groupSize: number;
  price: number;
  currency: string;
  pickupLocation: string;
  tourDate: string;
  tourTime: string;
  passengerNames: string[];
  notes: string;
  status: string;
  createdAt: string;
}

const VEHICLE_TYPES = [
  { id: 'VITO_VIP', name: 'Mercedes Vito VIP', capacity: 6 },
  { id: 'SPRINTER_10', name: 'Mercedes Sprinter', capacity: 10 },
  { id: 'SPRINTER_13', name: 'Mercedes Sprinter', capacity: 13 },
  { id: 'SPRINTER_16', name: 'Mercedes Sprinter', capacity: 16 },
];

const TOUR_ROUTES = [
  { id: 'istanbul-city', name: 'İstanbul Şehir Turu', duration: 8, price: 150 },
  { id: 'cappadocia', name: 'Kapadokya Turu', duration: 12, price: 300 },
  { id: 'trabzon', name: 'Trabzon Turu', duration: 10, price: 250 },
  { id: 'sapanca', name: 'Sapanca Turu', duration: 10, price: 200 },
  { id: 'abant', name: 'Abant Turu', duration: 10, price: 180 },
  { id: 'bursa', name: 'Bursa Turu', duration: 10, price: 220 },
];

export default function EditTourReservationPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [formData, setFormData] = useState({
    routeName: '',
    vehicleType: '',
    groupSize: 1,
    price: 0,
    currency: 'EUR',
    pickupLocation: '',
    tourDate: '',
    tourTime: '',
    passengerNames: [''],
    notes: '',
    status: 'PENDING',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/tour-bookings/${bookingId}`);
      if (response.ok) {
        const booking = await response.json();
        setFormData({
          routeName: booking.routeName || '',
          vehicleType: booking.vehicleType || '',
          groupSize: booking.groupSize || 1,
          price: booking.price || 0,
          currency: booking.currency || 'EUR',
          pickupLocation: booking.pickupLocation || '',
          tourDate: booking.tourDate ? new Date(booking.tourDate).toISOString().split('T')[0] : '',
          tourTime: booking.tourTime || '',
          passengerNames: booking.passengerNames || [''],
          notes: booking.notes || '',
          status: booking.status || 'PENDING',
        });
      } else {
        setError('Tur rezervasyonu bulunamadı');
      }
    } catch (error) {
      console.error('Tur rezervasyonu getirme hatası:', error);
      setError('Tur rezervasyonu getirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePassengerNameChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      passengerNames: prev.passengerNames.map((name, i) => i === index ? value : name)
    }));
  };

  const addPassenger = () => {
    setFormData(prev => ({
      ...prev,
      passengerNames: [...prev.passengerNames, '']
    }));
  };

  const removePassenger = (index: number) => {
    if (formData.passengerNames.length > 1) {
      setFormData(prev => ({
        ...prev,
        passengerNames: prev.passengerNames.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiPut(`/api/tour-bookings/${bookingId}`, formData);

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/tour/reservations');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Tur rezervasyonu güncellenemedi');
      }
    } catch (error) {
      console.error('Tur rezervasyonu güncelleme hatası:', error);
      setError('Tur rezervasyonu güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu tur rezervasyonunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiDelete(`/api/tour-bookings/${bookingId}`);

      if (response.ok) {
        router.push('/admin/tour/reservations');
      } else {
        setError('Tur rezervasyonu silinemedi');
      }
    } catch (error) {
      console.error('Tur rezervasyonu silme hatası:', error);
      setError('Tur rezervasyonu silinirken bir hata oluştu');
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
          <p className="text-gray-600">Tur modülü aktif değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Tur Rezervasyonunu Düzenle</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Hata</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Başarılı</h3>
                    <div className="mt-2 text-sm text-green-700">Tur rezervasyonu güncellendi!</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Rotası
                </label>
                <input
                  type="text"
                  name="routeName"
                  value={formData.routeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Tipi
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Araç seçin</option>
                  {VEHICLE_TYPES.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.capacity} kişi)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grup Büyüklüğü
                </label>
                <input
                  type="number"
                  name="groupSize"
                  value={formData.groupSize}
                  onChange={handleInputChange}
                  min="1"
                  max="16"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="TL">TL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alış Noktası
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Tarihi
                </label>
                <input
                  type="date"
                  name="tourDate"
                  value={formData.tourDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tur Saati
                </label>
                <input
                  type="time"
                  name="tourTime"
                  value={formData.tourTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="PENDING">Bekliyor</option>
                  <option value="CONFIRMED">Onaylandı</option>
                  <option value="CANCELLED">İptal Edildi</option>
                  <option value="COMPLETED">Tamamlandı</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yolcu İsimleri
              </label>
              {formData.passengerNames.map((name, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Yolcu ${index + 1}`}
                  />
                  {formData.passengerNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPassenger}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                + Yolcu Ekle
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
              
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Güncelle'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

