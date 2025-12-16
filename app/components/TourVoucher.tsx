'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
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
    name: string;
    phoneNumber?: string;
  } | null;
  customer?: {
    phone: string;
    name: string;
    surname: string;
  } | null;
}

interface TourVoucherProps {
  bookingId: string;
}

export default function TourVoucher({ bookingId }: TourVoucherProps) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  const translations = {
    tr: tr.tourVoucher,
    en: en.tourVoucher,
    ar: ar.tourVoucher
  };

  const t = translations[selectedLanguage as keyof typeof translations];

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/tour-bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
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

  const handleSendWhatsApp = () => {
    if (!booking) return;

    // Try to get phone from customer record first, then vehicle/reservation phone if existed? 
    // TourBooking doesn't have top level phone.
    const phone = booking.customer?.phone;

    if (!phone) {
      alert('Müşteri telefon numarası bulunamadı.');
      return;
    }

    const msgLines = [
      'Sayın ' + (booking.customer?.name || 'Müşteri'),
      `Tur Voucherınız Hazır.`,
      `Tur: ${booking.routeName}`,
      `Tarih: ${formatDate(booking.tourDate)} Saat: ${booking.tourTime || 'Belirtilmedi'}`,
      `Kişi: ${booking.groupSize}`,
      `Voucher No: ${booking.voucherNumber}`,
      `Detaylar için lütfen linke tıklayınız:`,
      window.location.href
    ];

    const text = encodeURIComponent(msgLines.join('\n'));
    const waUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(waUrl, '_blank');
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

  const formatDate = (dateStr: string) => {
    try {
      // Parse the date string and format as DD/MM/YYYY
      const date = new Date(dateStr);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateStr;
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateStr;
    }
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

  return (
    <div className="print-content bg-white p-8 print:p-4 rounded-2xl shadow-lg max-w-4xl mx-auto print:shadow-none print:max-w-full border border-gray-100">
      {/* Language Selector */}
      <div className="flex justify-end mb-4 print:hidden no-print">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="block w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      {/* Header */}
      <div className="text-center mb-8 print:mb-4 border-b-2 border-gradient-to-r from-blue-500 to-green-500 pb-6 print:pb-3">
        <div className="flex justify-center items-center mb-6 print:mb-3">
          {/* ProTransfer şirketi için logo göster */}
          {booking.tenant?.companyName?.toLowerCase().includes('protransfer') ? (
            <>
              <img
                src="/logo.svg"
                alt="ProTransfer"
                className="h-16 w-16 print:h-12 print:w-12 mr-4 drop-shadow-sm"
              />
              <span className="text-4xl print:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent">
                ProTransfer
              </span>
            </>
          ) : (
            /* Diğer şirketler için sadece şirket adı */
            <span className="text-4xl print:text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              {booking.tenant?.companyName || 'Şirket Adı'}
            </span>
          )}
        </div>
        <h1 className="text-2xl print:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          {t.title}
        </h1>
        <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm print:text-xs font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Voucher No: {booking.voucherNumber}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 print:space-y-3">
        {/* Tour ve Tarih Bilgileri Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-3">
          {/* Tur Bilgileri */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 print:p-3 rounded-2xl print:bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {t.tourInfo}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">{t.routeName}:</span>
                <span className="font-medium">{booking.routeName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">{t.vehicleType}:</span>
                <span className="font-medium">{booking.vehicleType}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">{t.groupSize}:</span>
                <span className="font-medium">{booking.groupSize} {t.person}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">{t.price}:</span>
                <span className="font-medium text-green-600">{booking.price} {booking.currency}</span>
              </div>
            </div>
          </div>

          {/* Tarih & Saat Bilgileri */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 print:p-3 rounded-2xl print:bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {t.dateTime}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">{t.tourDate}:</span>
                <span className="font-medium">{formatDate(booking.tourDate)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">{t.departureTime}:</span>
                <span className="font-medium">{booking.tourTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toplanma ve Durum Bilgileri Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-3">
          {/* Toplanma Bilgileri */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 print:p-3 rounded-2xl print:bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {t.pickupInfo}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="py-1">
                <div className="text-gray-600">{t.pickupLocation}:</div>
                <div className="font-medium">{booking.pickupLocation}</div>
              </div>
            </div>
          </div>

          {/* Rezervasyon Durumu */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 print:p-3 rounded-2xl print:bg-white border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t.reservationStatus}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600">{t.status}:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">{t.reservationDate}:</span>
                <span className="font-medium">{formatDate(booking.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Yolcular */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 print:p-3 rounded-2xl print:bg-white border border-cyan-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {t.passengerList}
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {booking.passengerNames.map((name, index) => (
              <div key={index} className="py-1 border-b border-gray-100 last:border-0">
                <span className="font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Şoför Bilgileri */}
        {booking.driver && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 print:p-3 rounded-2xl print:bg-white border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm print:text-xs font-semibold text-blue-800 mb-3 print:mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.driverInfo}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.driverName}:</span>
                <span className="font-medium">{booking.driver.name}</span>
              </div>
              {booking.driver.phoneNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.phone}:</span>
                  <span className="font-medium">{booking.driver.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acente Bilgileri - Sadece ProTransfer olmayan şirketler için */}
        {booking.tenant && !booking.tenant.companyName?.toLowerCase().includes('protransfer') && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 print:p-3 rounded-2xl print:bg-white border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm print:text-xs font-semibold text-green-800 mb-3 print:mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {t.companyInfo}
            </h2>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-lg print:text-base font-bold text-green-800 mb-1">
                  {booking.tenant.companyName}
                </div>
                {booking.tenant.subdomain && (
                  <div className="text-sm text-green-600">
                    {t.subdomain}: {booking.tenant.subdomain}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-end gap-3 mb-6 no-print print:hidden">
          <button
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <span>📱</span> WhatsApp Gönder
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Yazdır / PDF
          </button>
        </div>

        {/* Footer - Sadece oluşturulma tarihi */}
        <div className="border-t border-gray-200 pt-4 text-center print:pt-2">
          <p className="text-xs text-gray-400 print:text-xs">
            {t.createdDate}: {new Date().toLocaleString(selectedLanguage === 'ar' ? 'ar-SA' : selectedLanguage === 'en' ? 'en-US' : 'tr-TR')}
          </p>
        </div>
      </div>
    </div>
  );
}


