'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';

interface Reservation {
  id: string;
  voucherNumber: string;
  date: string;
  time: string;
  from: string;
  to: string;
  flightCode?: string;
  passengerNames: string[];
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehiclePlate: string;
    tcNo: string;
    gender: string;
    address: string;
  };
  tenant?: {
    id: string;
    companyName: string;
    uetdsEnabled: boolean;
    uetdsUsername: string;
    uetdsPassword: string;
    uetdsUnetNo: string;
    uetdsTestMode: boolean;
  };
}

function UetdsCreateInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isEnabled, isLoading: moduleLoading } = useModule('transfer');
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const voucherNumber = searchParams.get('reservation');

  useEffect(() => {
    if (!user || moduleLoading) return;

    if (!isEnabled) {
      router.push('/admin');
      return;
    }

    if (voucherNumber) {
      fetchReservation();
    }
  }, [user, moduleLoading, isEnabled, voucherNumber, router]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reservations/${voucherNumber}`);
      
      if (!response.ok) {
        throw new Error('Rezervasyon bulunamadı');
      }
      
      const data = await response.json();
      setReservation(data);
    } catch (err) {
      console.error('Rezervasyon getirme hatası:', err);
      setError(err instanceof Error ? err.message : 'Rezervasyon yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createUetdsSefer = async () => {
    if (!reservation) return;

    try {
      setCreating(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/uetds/sefer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          aracPlaka: reservation.driver?.vehiclePlate || '34ABC123',
          hareketTarihi: reservation.date,
          hareketSaati: reservation.time,
          seferAciklama: `${reservation.from} - ${reservation.to} Transfer`,
          aracTelefonu: reservation.driver?.phone || '',
          firmaSeferNo: reservation.voucherNumber,
          seferBitisTarihi: reservation.date,
          seferBitisSaati: reservation.time,
          // Şoför bilgileri
          personel: reservation.driver ? {
            turKodu: 0, // Şoför
            uyrukUlke: 'TR',
            tcKimlikPasaportNo: reservation.driver.tcNo || '12345678901',
            cinsiyet: reservation.driver.gender || 'E',
            adi: reservation.driver.name.split(' ')[0] || 'Şoför',
            soyadi: reservation.driver.name.split(' ').slice(1).join(' ') || 'Adı',
            telefon: reservation.driver.phone || '',
            adres: reservation.driver.address || ''
          } : null,
          // Yolcu bilgileri
          yolcular: reservation.passengerNames.map((name, index) => ({
            uyrukUlke: 'TR',
            cinsiyet: 'E', // Varsayılan
            tcKimlikPasaportNo: `1234567890${index + 1}`, // Varsayılan
            adi: name.split(' ')[0] || 'Yolcu',
            soyadi: name.split(' ').slice(1).join(' ') || 'Adı'
          }))
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('U-ETDS seferi başarıyla oluşturuldu!');
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setError(result.message || 'U-ETDS seferi oluşturulamadı');
      }
    } catch (err) {
      console.error('U-ETDS oluşturma hatası:', err);
      setError('U-ETDS seferi oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 text-center">
          <div className="text-gray-500 text-6xl mb-4">🚌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">U-ETDS Oluştur</h2>
          <p className="text-gray-600 mb-4">Rezervasyon bulunamadı</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">🚌</span>
              <div>
                <h1 className="text-2xl font-bold text-white">U-ETDS Sefer Oluştur</h1>
                <p className="text-green-100">Transfer bilgilerini U-ETDS sistemine bildirin</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Rezervasyon Bilgileri */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Transfer Detayları</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Voucher:</span> {reservation.voucherNumber}</p>
                    <p><span className="font-medium">Tarih:</span> {reservation.date}</p>
                    <p><span className="font-medium">Saat:</span> {reservation.time}</p>
                    <p><span className="font-medium">Güzergah:</span> {reservation.from} → {reservation.to}</p>
                    {reservation.flightCode && (
                      <p><span className="font-medium">Uçuş:</span> {reservation.flightCode}</p>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Yolcu Bilgileri</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Yolcu Sayısı:</span> {reservation.passengerNames.length}</p>
                    <div className="mt-2">
                      <p className="font-medium">Yolcu İsimleri:</p>
                      <ul className="list-disc list-inside mt-1">
                        {reservation.passengerNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Şoför Bilgileri */}
            {reservation.driver && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Şoför Bilgileri</h2>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Ad Soyad:</span> {reservation.driver.name}</p>
                      <p><span className="font-medium">Telefon:</span> {reservation.driver.phone}</p>
                      <p><span className="font-medium">Araç Plaka:</span> {reservation.driver.vehiclePlate}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">TC No:</span> {reservation.driver.tcNo}</p>
                      <p><span className="font-medium">Cinsiyet:</span> {reservation.driver.gender}</p>
                      <p><span className="font-medium">Adres:</span> {reservation.driver.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* U-ETDS Durumu */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">U-ETDS Durumu</h2>
              <div className={`p-4 rounded-lg ${reservation.tenant?.uetdsEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{reservation.tenant?.uetdsEnabled ? '✅' : '❌'}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {reservation.tenant?.uetdsEnabled ? 'U-ETDS Aktif' : 'U-ETDS Pasif'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reservation.tenant?.uetdsEnabled 
                        ? 'Bu acente için U-ETDS entegrasyonu aktif'
                        : 'Bu acente için U-ETDS entegrasyonu aktif değil'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hata/Success Mesajları */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 text-xl mr-3">❌</span>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => window.close()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={creating}
              >
                İptal
              </button>
              <button
                onClick={createUetdsSefer}
                disabled={creating || !reservation.tenant?.uetdsEnabled}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚌</span>
                    U-ETDS Sefer Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UetdsCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <UetdsCreateInner />
    </Suspense>
  );
}
