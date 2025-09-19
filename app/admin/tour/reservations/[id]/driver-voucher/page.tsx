'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import tr from '@/app/locales/tr.json';
import en from '@/app/locales/en.json';
import ar from '@/app/locales/ar.json';

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
  const { language, setLanguage } = useLanguage();
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    tr: tr.tourVoucher,
    en: en.tourVoucher,
    ar: ar.tourVoucher
  };

  const t = translations[language as keyof typeof translations];

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
    // Yazdırma işlemini senkronize et
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return t.confirmed;
      case 'PENDING':
        return t.pending;
      default:
        return t.cancelled;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
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
        {/* Language Selector and Print Button */}
        <div className="mb-6 print:hidden flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Dil:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'ar')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🖨️ {t.print}
          </button>
        </div>

        {/* Driver Voucher */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 print:shadow-none print:border-0">
          {/* Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <div className="text-lg text-gray-600">Voucher No: {booking.voucherNumber}</div>
            <div className="text-sm text-gray-500 mt-2">
              {t.footerNote}
            </div>
          </div>

          {/* Driver Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.driverInfo}</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.driverName}:</span>
                  <span className="font-medium">{booking.driver.name}</span>
                </div>
                {booking.driver.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.phone}:</span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.tourInfo}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.routeName}:</span>
                    <span className="font-medium">{booking.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.vehicleType}:</span>
                    <span className="font-medium">{booking.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.groupSize}:</span>
                    <span className="font-medium">{booking.groupSize} {t.person}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.price}:</span>
                    <span className="font-medium text-green-600">{booking.price} {booking.currency}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.dateTime}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.tourDate}:</span>
                    <span className="font-medium">{new Date(booking.tourDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.departureTime}:</span>
                    <span className="font-medium">{booking.tourTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.pickupInfo}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.pickupLocation}:</span>
                    <span className="font-medium text-right">{booking.pickupLocation}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.reservationStatus}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.status}:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.reservationDate}:</span>
                    <span className="font-medium">{new Date(booking.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.passengerList}</h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.driverInstructions}</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• {t.instruction1}</li>
                <li>• {t.instruction2}</li>
                <li>• {t.instruction3}</li>
                <li>• {t.instruction4}</li>
                <li>• {t.instruction5}</li>
                <li>• {t.instruction6}</li>
              </ul>
            </div>
          </div>

          {/* Company Info */}
          {booking.tenant && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.companyInfo}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.company}:</span>
                    <span className="font-medium">{booking.tenant.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.subdomain}:</span>
                    <span className="font-medium">{booking.tenant.subdomain}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              {t.footerNote}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {t.createdDate}: {new Date().toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


