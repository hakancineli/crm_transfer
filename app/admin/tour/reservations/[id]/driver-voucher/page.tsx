'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

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
  status: string;
  passengerNames: string[];
  createdAt: string;
  tenant?: {
    id: string;
    companyName: string;
    subdomain: string;
  };
  driver?: {
    id: string;
    name: string;
    phoneNumber?: string;
  } | null;
}

export default function TourDriverVoucherPage() {
  const { user } = useAuth();
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/tour-bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        throw new Error('Rezervasyon bulunamadı');
      }
    } catch (error) {
      console.error('Tur rezervasyonu yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Rezervasyon Bulunamadı</h1>
          <p className="text-gray-600">Tur rezervasyonu bulunamadı veya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  if (!booking.driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Şoför Atanmamış</h1>
          <p className="text-gray-600">Bu tur rezervasyonuna henüz şoför atanmamış.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Print Button */}
        <div className="mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🖨️ Yazdır
          </button>
        </div>

        {/* Driver Voucher */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 print:shadow-none print:border-0">
          {/* Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TUR ŞOFÖR VOUCHERI</h1>
            <div className="text-lg text-gray-600">Voucher No: {booking.voucherNumber}</div>
            <div className="text-sm text-gray-500 mt-2">
              Bu voucher tur görevinizi doğrular. Tur günü yanınızda bulundurunuz.
            </div>
          </div>

          {/* Driver Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Şoför Bilgileri</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Şoför Adı:</span>
                  <span className="font-medium">{booking.driver.name}</span>
                </div>
                {booking.driver.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefon:</span>
                    <span className="font-medium">{booking.driver.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tour Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tur Bilgileri</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tur Rotası:</span>
                    <span className="font-medium">{booking.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Araç Tipi:</span>
                    <span className="font-medium">{booking.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kişi Sayısı:</span>
                    <span className="font-medium">{booking.groupSize} kişi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiyat:</span>
                    <span className="font-medium text-green-600">{booking.price} {booking.currency}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tarih & Saat</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tur Tarihi:</span>
                    <span className="font-medium">{new Date(booking.tourDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kalkış Saati:</span>
                    <span className="font-medium">{booking.tourTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Toplanma Bilgileri</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplanma Yeri:</span>
                    <span className="font-medium text-right">{booking.pickupLocation}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rezervasyon Durumu</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'CONFIRMED' ? 'Onaylandı' :
                       booking.status === 'PENDING' ? 'Beklemede' :
                       'İptal Edildi'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rezervasyon Tarihi:</span>
                    <span className="font-medium">{new Date(booking.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Yolcu Listesi</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {booking.passengerNames.map((name, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Driver Instructions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Şoför Talimatları</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Tur günü en az 30 dakika önce toplanma yerinde bulununuz.</li>
                <li>• Araç temizliğini kontrol ediniz.</li>
                <li>• Yolcuları nazikçe karşılayınız.</li>
                <li>• Güvenli sürüş kurallarına uyunuz.</li>
                <li>• Acil durumlarda acente ile iletişime geçiniz.</li>
                <li>• Tur sonunda araç temizliğini yapınız.</li>
              </ul>
            </div>
          </div>

          {/* Company Info */}
          {booking.tenant && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Acente Bilgileri</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acente:</span>
                    <span className="font-medium">{booking.tenant.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subdomain:</span>
                    <span className="font-medium">{booking.tenant.subdomain}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Bu voucher tur görevinizi doğrular. Tur günü yanınızda bulundurunuz.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Oluşturulma Tarihi: {new Date().toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


