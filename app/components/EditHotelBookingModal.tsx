'use client';

import { useState, useEffect } from 'react';
import { EmailService } from '@/app/lib/emailService';

interface HotelBooking {
  id: string;
  voucherNumber: string;
  hotelName: string;
  hotelAddress: string;
  roomType: string;
  checkin: Date;
  checkout: Date;
  adults: number;
  children: number;
  rooms: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: Date;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  bookingReference: string;
}

interface EditHotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: HotelBooking | null;
  onSave: (updatedBooking: HotelBooking) => void;
}

export default function EditHotelBookingModal({
  isOpen,
  onClose,
  booking,
  onSave
}: EditHotelBookingModalProps) {
  const [formData, setFormData] = useState({
    hotelName: '',
    hotelAddress: '',
    roomType: '',
    checkin: '',
    checkout: '',
    adults: 1,
    children: 0,
    rooms: 1,
    totalPrice: 0,
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setFormData({
        hotelName: booking.hotelName,
        hotelAddress: booking.hotelAddress,
        roomType: booking.roomType,
        checkin: new Date(booking.checkin).toISOString().split('T')[0],
        checkout: new Date(booking.checkout).toISOString().split('T')[0],
        adults: booking.adults,
        children: booking.children,
        rooms: booking.rooms,
        totalPrice: booking.totalPrice,
        status: booking.status,
        customerName: booking.customerInfo.name,
        customerEmail: booking.customerInfo.email,
        customerPhone: booking.customerInfo.phone,
        specialRequests: booking.specialRequests || ''
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setLoading(true);
    setError(null);

    try {
      // API'ye güncellenmiş rezervasyonu gönder
      const response = await fetch(`/api/accommodation/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Rezervasyon güncellenemedi');
      }

      const result = await response.json();
      
      // Güncellenmiş rezervasyonu döndür
      const updatedBooking: HotelBooking = {
        ...booking,
        hotelName: formData.hotelName,
        hotelAddress: formData.hotelAddress,
        roomType: formData.roomType,
        checkin: new Date(formData.checkin),
        checkout: new Date(formData.checkout),
        adults: formData.adults,
        children: formData.children,
        rooms: formData.rooms,
        totalPrice: formData.totalPrice,
        status: formData.status,
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        },
        specialRequests: formData.specialRequests
      };

      onSave(updatedBooking);

      // Değişiklik e-postası gönder
      try {
        await EmailService.sendBookingModification({
          voucherNumber: booking.voucherNumber,
          hotelName: formData.hotelName,
          customerInfo: {
            name: formData.customerName,
            email: formData.customerEmail,
            phone: formData.customerPhone
          },
          changes: 'Rezervasyon bilgilerinde değişiklik yapılmıştır.'
        });
        console.log('✅ Değişiklik e-postası gönderildi');
      } catch (emailError) {
        console.warn('⚠️ Değişiklik e-postası gönderilemedi:', emailError);
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl dark:shadow-none max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700 transition-colors duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              ✏️ Rezervasyon Düzenle
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voucher Bilgileri */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                📋 Rezervasyon Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Voucher Numarası
                  </label>
                  <input
                    type="text"
                    value={booking.voucherNumber}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-100 dark:bg-slate-950 text-gray-500 dark:text-slate-400 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Rezervasyon Referansı
                  </label>
                  <input
                    type="text"
                    value={booking.bookingReference}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-100 dark:bg-slate-950 text-gray-500 dark:text-slate-400 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Otel Bilgileri */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                🏨 Otel Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Otel Adı *
                  </label>
                  <input
                    type="text"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Otel Adresi *
                  </label>
                  <input
                    type="text"
                    name="hotelAddress"
                    value={formData.hotelAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Oda Tipi *
                  </label>
                  <input
                    type="text"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Durum *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="PENDING">Beklemede</option>
                    <option value="CONFIRMED">Onaylandı</option>
                    <option value="CANCELLED">İptal Edildi</option>
                    <option value="COMPLETED">Tamamlandı</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tarih ve Misafir Bilgileri */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                📅 Tarih ve Misafir Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Giriş Tarihi *
                  </label>
                  <input
                    type="date"
                    name="checkin"
                    value={formData.checkin}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Çıkış Tarihi *
                  </label>
                  <input
                    type="date"
                    name="checkout"
                    value={formData.checkout}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Yetişkin Sayısı *
                  </label>
                  <input
                    type="number"
                    name="adults"
                    value={formData.adults}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Çocuk Sayısı
                  </label>
                  <input
                    type="number"
                    name="children"
                    value={formData.children}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Oda Sayısı *
                  </label>
                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Toplam Tutar (€) *
                  </label>
                  <input
                    type="number"
                    name="totalPrice"
                    value={formData.totalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Müşteri Bilgileri */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                👤 Müşteri Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Özel İstekler */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
                💬 Özel İstekler
              </h3>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
              />
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-100 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  '💾 Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
