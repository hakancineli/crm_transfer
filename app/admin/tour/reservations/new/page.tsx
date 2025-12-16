'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { useRouter } from 'next/navigation';
import { Currency, CURRENCIES } from '@/app/types';
import { apiPost } from '@/app/lib/api';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';
import TourCustomerSelect from '@/app/admin/tour/components/TourCustomerSelect';
import SeatMap from '@/app/admin/tour/components/SeatMap';

interface VehicleType {
  id: string;
  name: string;
  capacity: number;
}

interface TourRoute {
  id: string;
  name: string;
  duration: number;
  basePrice: number;
  capacity?: number;
}

const VEHICLE_TYPES: VehicleType[] = [
  { id: 'VITO_VIP', name: 'Mercedes Vito VIP', capacity: 6 },
  { id: 'SPRINTER_10', name: 'Mercedes Sprinter', capacity: 10 },
  { id: 'SPRINTER_13', name: 'Mercedes Sprinter', capacity: 13 },
  { id: 'SPRINTER_16', name: 'Mercedes Sprinter', capacity: 16 },
];

export default function NewTourReservationPage() {
  const { user } = useAuth();
  const { isEnabled: tourEnabled, isLoading } = useModule('tour');
  const router = useRouter();

  // Bugünün tarihini YYYY-MM-DD formatında al
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '', // For display
    routeId: '',
    customRouteName: '', // Legacy support
    vehicleType: '',
    groupSize: 1,
    price: '' as number | string,
    currency: 'USD' as Currency,
    pickupLocation: '',
    tourDate: today,
    tourTime: '09:00',
    tourDuration: 1,
    passengerNames: [''], // Will auto-fill first one
    notes: '',
    paymentStatus: 'PENDING',
    paymentMethod: 'CASH',
    paidAmount: 0,
    tourId: '', // Scheduled Tour ID
    seatNumber: '', // Selected Seat
    paymentReminderDate: '', // YYYY-MM-DD
    paymentReminderTime: '10:00', // HH:MM
  });

  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TourRoute | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<TourRoute[]>([]);

  // Scheduled Tour Logic
  const [scheduledTours, setScheduledTours] = useState<any[]>([]);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // Load routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/tour-routes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableRoutes(data);
        }
      } catch (error) {
        console.error('Routes fetching error:', error);
      }
    };

    if (tourEnabled) {
      fetchRoutes();
    }
  }, [tourEnabled]);

  // Fetch Scheduled Tours when Route or Date changes
  useEffect(() => {
    if (formData.routeId && formData.tourDate) {
      fetchScheduledTours();
    } else {
      setScheduledTours([]);
      setSelectedTour(null);
    }
  }, [formData.routeId, formData.tourDate]);

  const fetchScheduledTours = async () => {
    setLoadingTours(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch tours for specific route and date
      // Note: Our generic GET /api/tours filters by date range, we might need to be specific
      // For MVP we can filter client side or add specific query params
      const url = `/api/tours?startDate=${formData.tourDate}&endDate=${formData.tourDate}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const tours = await response.json();
        // Filter by routeId locally as well to be safe
        const filtered = tours.filter((t: any) => t.routeId === formData.routeId);
        setScheduledTours(filtered);

        // If only one tour exists, select it automatically? Maybe not, let user choose time.
      }
    } catch (error) {
      console.error('Error fetching scheduled tours:', error);
    } finally {
      setLoadingTours(false);
    }
  };

  // Fetch Occupied Seats when a Tour is selected
  useEffect(() => {
    if (formData.tourId) {
      fetchTourDetails(formData.tourId);
    }
  }, [formData.tourId]);

  const fetchTourDetails = async (tourId: string) => {
    try {
      const token = localStorage.getItem('token');
      // We need an endpoint to get active bookings for a tour to know occupied seats
      // We can use the existing bookings API with a filter or a new specific endpoint
      // For now, let's assume we can fetch booking list filtered by tourId.
      // Since we haven't implemented filtering by tourId in GET /api/tour-bookings fully yet,
      // let's do a quick fetch using the general list and filter client side (Not efficient for prod but works for MVP)

      // Better: Create/Use a dedicated endpoint. 
      // Let's rely on the fact we are adding 'tourId' to TourBooking model.

      // Actually, let's update GET /api/tours/[id] to return bookings or occupied seats.
      // Since I haven't created /api/tours/[id] yet, I will create it or use a query.
      // Let's keep it simple: Fetch bookings for this tourId

      // I'll make a dedicated call to a helper or just search bookings
      const response = await fetch(`/api/tour-bookings?tourId=${tourId}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Extract seat numbers
        const seats = data.bookings
          .filter((b: any) => b.tourId === tourId && b.status !== 'CANCELLED')
          .map((b: any) => b.seatNumber)
          .filter(Boolean); // Create array of non-null seat numbers

        setOccupiedSeats(seats);

        // Also set selected tour object for capacity info
        const tour = scheduledTours.find(t => t.id === tourId);
        setSelectedTour(tour);

        // Update time/vehicle/price from the scheduled tour
        if (tour) {
          setFormData(prev => ({
            ...prev,
            tourTime: tour.startTime,
            // vehicleType: tour.vehicle?.type || prev.vehicleType // Don't override user choice strictly?
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching tour details:', error);
    }
  };

  // Handle Customer Selection
  const handleCustomerSelect = (customer: any) => {
    // Fill form data
    const newPassengerNames = [...formData.passengerNames];
    if (newPassengerNames.length > 0) newPassengerNames[0] = `${customer.name} ${customer.surname}`;

    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: `${customer.name} ${customer.surname}`,
      passengerNames: newPassengerNames
    }));
  };

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
      const route = availableRoutes.find(r => r.id === formData.routeId);
      setSelectedRoute(route || null);
      if (route) {
        setFormData(prev => ({
          ...prev,
          price: route.basePrice,
          groupSize: Math.min(prev.groupSize, route.capacity || 16)
        }));
      }
    } else {
      setSelectedRoute(null);
    }
  }, [formData.routeId, availableRoutes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Özel rota seçildiğinde fiyatı sıfırla
    if (name === 'routeId' && value === 'custom') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        price: '',
        customRouteName: '',
        tourId: '', // Clear scheduled tour selection if route changes to custom
        seatNumber: ''
      }));
    } else if (name === 'groupSize') {
      // Kişi sayısı değiştiğinde yolcu isimlerini güncelle
      const newGroupSize = parseInt(value) || 1;
      const currentPassengerNames = formData.passengerNames;

      let newPassengerNames: string[];
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
        groupSize: newGroupSize,
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
        // Tour rezervasyonu için customer voucher sayfasına yönlendir
        // API response: { success: true, booking: { id, ... }, voucherNumber, ... }
        router.push(`/admin/tour/reservations/${result.booking.id}/customer-voucher`);
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

          {/* Customer Selection Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Müşteri Seçimi</h2>
            <div className="mb-4">
              <TourCustomerSelect onSelect={handleCustomerSelect} />
            </div>
            {formData.customerId && (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200 flex justify-between items-center">
                <span>Seçili Müşteri: <strong>{formData.customerName}</strong></span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, customerId: '', customerName: '' }))}
                  className="text-sm underline hover:text-blue-900"
                >
                  Değiştir
                </button>
              </div>
            )}
            {!formData.customerId && (
              <div className="text-sm text-yellow-600 mt-2">
                * CRM kaydı oluşturmak için müşteri seçmeniz önerilir. Seçmezseniz sadece isim ile devam edebilirsiniz.
              </div>
            )}
          </div>

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
                  {availableRoutes.map(route => (
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

              {/* Araç Tipi ve Kişi Sayısı */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alınacak Yer
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Otel adı veya adres..."
                  />
                </div>
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Varsa özel notlar..."
            />

            {/* Payment Fields */}
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Durumu</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="PENDING">Bekliyor (Borçlu)</option>
                    <option value="PAID">Ödendi (Tam)</option>
                    <option value="PARTIAL">Kısmi Ödeme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="CASH">Nakit</option>
                    <option value="CARD">Kredi Kartı</option>
                    <option value="TRANSFER">Havale / EFT</option>
                    <option value="AGENCY">Acente Bakiyesi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödenen Tutar</label>
                  <input
                    type="number"
                    name="paidAmount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {formData.paymentStatus !== 'PAID' && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-3">🔔 Ödeme Hatırlatıcı</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hatırlatma Tarihi</label>
                      <input
                        type="date"
                        name="paymentReminderDate"
                        value={formData.paymentReminderDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hatırlatma Saati</label>
                      <input
                        type="time"
                        name="paymentReminderTime"
                        value={formData.paymentReminderTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

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

