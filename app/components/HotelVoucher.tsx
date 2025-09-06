'use client';

import { useState } from 'react';
import { VoucherHeader } from '@/app/components/ui/VoucherHeader';

interface HotelVoucherProps {
  booking: {
    voucherNumber: string;
    hotelName: string;
    hotelAddress: string;
    roomType: string;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    rooms: number;
    totalPrice: number;
    currency: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    specialRequests?: string;
    cancellationPolicy: string;
    bookingReference: string;
  };
}

export default function HotelVoucher({ booking }: HotelVoucherProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateNights = () => {
    return Math.ceil(
      (new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 print:p-4">
      {/* Voucher Header */}
      <VoucherHeader 
        voucherNumber={booking.voucherNumber} 
        isDriverVoucher={false}
      />

      {/* Hotel Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          🏨 Otel Rezervasyon Bilgileri
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Otel Detayları */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Otel Bilgileri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Otel Adı:</span>
                  <span className="font-medium">{booking.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adres:</span>
                  <span className="font-medium text-right">{booking.hotelAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Oda Tipi:</span>
                  <span className="font-medium">{booking.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rezervasyon No:</span>
                  <span className="font-medium">{booking.bookingReference}</span>
                </div>
              </div>
            </div>

            {/* Rezervasyon Detayları */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Rezervasyon Detayları</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giriş Tarihi:</span>
                  <span className="font-medium">{formatDate(booking.checkin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Çıkış Tarihi:</span>
                  <span className="font-medium">{formatDate(booking.checkout)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gece Sayısı:</span>
                  <span className="font-medium">{calculateNights()} gece</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Oda Sayısı:</span>
                  <span className="font-medium">{booking.rooms} oda</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yetişkin:</span>
                  <span className="font-medium">{booking.adults} kişi</span>
                </div>
                {booking.children > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Çocuk:</span>
                    <span className="font-medium">{booking.children} kişi</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Müşteri ve Fiyat Bilgileri */}
          <div className="space-y-4">
            {/* Müşteri Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Müşteri Bilgileri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ad Soyad:</span>
                  <span className="font-medium">{booking.customerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-posta:</span>
                  <span className="font-medium">{booking.customerInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefon:</span>
                  <span className="font-medium">{booking.customerInfo.phone}</span>
                </div>
              </div>
            </div>

            {/* Fiyat Bilgileri */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Fiyat Bilgileri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Gece başına:</span>
                  <span className="font-medium">{booking.totalPrice / (calculateNights() * booking.rooms)} {booking.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Gece sayısı:</span>
                  <span className="font-medium">{calculateNights()} gece</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Oda sayısı:</span>
                  <span className="font-medium">{booking.rooms} oda</span>
                </div>
                <hr className="border-blue-200" />
                <div className="flex justify-between text-lg font-bold text-blue-900">
                  <span>Toplam Tutar:</span>
                  <span>{booking.totalPrice} {booking.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Özel İstekler */}
      {booking.specialRequests && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">Özel İstekler</h3>
          <p className="text-yellow-800">{booking.specialRequests}</p>
        </div>
      )}

      {/* İptal Politikası */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">İptal Politikası</h3>
        <p className="text-gray-700 text-sm">{booking.cancellationPolicy}</p>
      </div>

      {/* Önemli Notlar */}
      <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="font-semibold text-red-900 mb-2">⚠️ Önemli Notlar</h3>
        <ul className="text-red-800 text-sm space-y-1">
          <li>• Bu voucher'ı otel girişinde göstermeniz gerekmektedir</li>
          <li>• Rezervasyon iptal/değişiklik işlemleri için bizimle iletişime geçin</li>
          <li>• Voucher numarası: <strong>{booking.voucherNumber}</strong></li>
          <li>• Rezervasyon referansı: <strong>{booking.bookingReference}</strong></li>
        </ul>
      </div>

      {/* İletişim Bilgileri */}
      <div className="text-center text-sm text-gray-600 border-t pt-4">
        <p><strong>ProTransfer</strong> - Profesyonel Transfer ve Konaklama Hizmetleri</p>
        <p>📞 +90 555 123 45 67 | ✉️ info@protransfer.com</p>
        <p>Voucher Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
      </div>

      {/* Print Button */}
      {!isPrinting && (
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🖨️ Voucher'ı Yazdır
          </button>
        </div>
      )}
    </div>
  );
}
