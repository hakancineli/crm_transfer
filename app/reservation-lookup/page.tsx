'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ReservationLookupPage() {
  const { t } = useLanguage();
  const [searchType, setSearchType] = useState<'voucher' | 'phone'>('voucher');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError('');
    setReservation(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Rezervasyon bilgisi alınamadı');
      }

      const reservations = await response.json();
      
      let foundReservation = null;
      if (searchType === 'voucher') {
        foundReservation = reservations.find((r: any) => 
          r.voucherNumber?.toLowerCase() === searchValue.trim().toLowerCase()
        );
      } else {
        // Phone search - normalize phone number
        const normalizedSearch = searchValue.trim().replace(/[^\d+]/g, '');
        foundReservation = reservations.find((r: any) => {
          const normalizedPhone = r.phoneNumber?.replace(/[^\d+]/g, '');
          return normalizedPhone === normalizedSearch || 
                 normalizedPhone === `+90${normalizedSearch}` ||
                 normalizedPhone === `90${normalizedSearch}`;
        });
      }

      if (foundReservation) {
        setReservation(foundReservation);
      } else {
        setError(searchType === 'voucher' 
          ? 'Bu voucher numarası ile rezervasyon bulunamadı' 
          : 'Bu telefon numarası ile rezervasyon bulunamadı'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Bekliyor',
      'confirmed': 'Onaylandı',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Durumu Sorgula</h1>
          <p className="mt-2 text-gray-600">Voucher numaranız veya telefon numaranız ile rezervasyon bilgilerinizi görüntüleyin</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arama Türü
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'voucher' | 'phone')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="voucher">Voucher Numarası</option>
                  <option value="phone">Telefon Numarası</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'voucher' ? 'Voucher Numarası' : 'Telefon Numarası'}
                </label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'voucher' ? 'VIP20241201-1' : '+90 5XX XXX XX XX'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Aranıyor...' : 'Rezervasyon Ara'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {reservation && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rezervasyon Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Voucher Numarası</label>
                  <p className="text-lg font-mono text-gray-900">{reservation.voucherNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tarih & Saat</label>
                  <p className="text-gray-900">{formatDate(reservation.date)} {formatTime(reservation.time)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Güzergah</label>
                  <p className="text-gray-900">{reservation.from} → {reservation.to}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fiyat</label>
                  <p className="text-lg font-semibold text-green-600">
                    {reservation.price?.toLocaleString('tr-TR')} {reservation.currency}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon</label>
                  <p className="text-gray-900">{reservation.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Yolcu Sayısı</label>
                  <p className="text-gray-900">
                    {reservation.passengerNames ? 
                      (Array.isArray(reservation.passengerNames) ? 
                        reservation.passengerNames.length : 
                        JSON.parse(reservation.passengerNames).length
                      ) : 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bagaj</label>
                  <p className="text-gray-900">{reservation.luggageCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Durum</label>
                  <p className="text-gray-900">{getStatusText(reservation.status || 'pending')}</p>
                </div>
              </div>
            </div>

            {reservation.flightCode && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">Uçuş Kodu</label>
                <p className="text-gray-900">{reservation.flightCode}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="/customer-reservation"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Yeni Rezervasyon Talebi
          </a>
        </div>
      </div>
    </div>
  );
}
