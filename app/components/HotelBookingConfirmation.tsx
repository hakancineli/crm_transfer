'use client';

import { Hotel } from '@/app/lib/bookingApi';

interface RoomType {
  id: string;
  name: string;
  price: number;
  currency: string;
  amenities: string[];
  maxOccupancy: number;
  bedType: string;
  size: string;
  view: string;
  cancellationPolicy: string;
}

interface HotelBookingConfirmationProps {
  hotel: Hotel;
  roomType: RoomType;
  requestData: any;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function HotelBookingConfirmation({
  hotel,
  roomType,
  requestData,
  onConfirm,
  onBack,
  loading
}: HotelBookingConfirmationProps) {
  const calculateTotalPrice = () => {
    const nights = Math.ceil(
      (new Date(requestData.checkout).getTime() - new Date(requestData.checkin).getTime()) / (1000 * 60 * 60 * 24)
    );
    return roomType.price * nights * requestData.rooms;
  };

  const calculateNights = () => {
    return Math.ceil(
      (new Date(requestData.checkout).getTime() - new Date(requestData.checkin).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Geri Dön
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ✅ Rezervasyon Onayı
        </h2>
        <p className="text-gray-600">
          Rezervasyon detaylarınızı kontrol edin ve onaylayın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Otel Bilgileri */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🏨 Otel Bilgileri
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Otel:</span>
                <span className="font-medium">{hotel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lokasyon:</span>
                <span className="font-medium">{hotel.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Değerlendirme:</span>
                <span className="font-medium">⭐ {hotel.rating}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mesafe:</span>
                <span className="font-medium">{hotel.distance} km</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🛏️ Oda Bilgileri
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Oda Tipi:</span>
                <span className="font-medium">{roomType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yatak:</span>
                <span className="font-medium">{roomType.bedType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oda Boyutu:</span>
                <span className="font-medium">{roomType.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manzara:</span>
                <span className="font-medium">{roomType.view}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kapasite:</span>
                <span className="font-medium">{roomType.maxOccupancy} kişi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rezervasyon Detayları */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📅 Rezervasyon Detayları
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Giriş Tarihi:</span>
                <span className="font-medium">{formatDate(requestData.checkin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Çıkış Tarihi:</span>
                <span className="font-medium">{formatDate(requestData.checkout)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gece Sayısı:</span>
                <span className="font-medium">{calculateNights()} gece</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oda Sayısı:</span>
                <span className="font-medium">{requestData.rooms} oda</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yetişkin:</span>
                <span className="font-medium">{requestData.adults} kişi</span>
              </div>
              {requestData.children > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Çocuk:</span>
                  <span className="font-medium">{requestData.children} kişi</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              👤 Müşteri Bilgileri
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ad Soyad:</span>
                <span className="font-medium">{requestData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">E-posta:</span>
                <span className="font-medium">{requestData.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefon:</span>
                <span className="font-medium">{requestData.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Fiyat Özeti */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💰 Fiyat Özeti
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Gece başına fiyat:</span>
                <span className="font-medium">€{roomType.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Gece sayısı:</span>
                <span className="font-medium">{calculateNights()} gece</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Oda sayısı:</span>
                <span className="font-medium">{requestData.rooms} oda</span>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>Toplam Tutar:</span>
                <span>€{calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Özel İstekler */}
      {requestData.specialRequests && (
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            💬 Özel İstekler
          </h3>
          <p className="text-yellow-800">{requestData.specialRequests}</p>
        </div>
      )}

      {/* İptal Politikası */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📋 İptal Politikası
        </h3>
        <p className="text-gray-700 text-sm">
          {roomType.cancellationPolicy}
        </p>
      </div>

      {/* Aksiyon Butonları */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          ← Geri Dön
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Rezervasyon Oluşturuluyor...
            </>
          ) : (
            '✅ Rezervasyonu Onayla'
          )}
        </button>
      </div>
    </div>
  );
}
