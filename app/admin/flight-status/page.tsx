'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlightInfo, FlightTracker } from '@/app/lib/flightTracker';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';

interface FlightStatusData {
  flightCode: string;
  voucherNumber: string;
  passengerNames: string[];
  from: string;
  to: string;
  scheduledTime: string;
  flightInfo: FlightInfo | null;
}

export default function FlightStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const { isEnabled: flightEnabled, isLoading: moduleLoading } = useModule('flight');
  const router = useRouter();
  const [flights, setFlights] = useState<FlightStatusData[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  // Uçuş çağırma için state'ler
  const [lookupFlightCode, setLookupFlightCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<FlightInfo | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading || moduleLoading) {
      return;
    }
    
    if (!flightEnabled) {
      router.push('/admin');
      return;
    }
    
    // Guard: SUPERUSER veya izinli kullanıcılar
    const hasViewFlights = user?.role === 'SUPERUSER' || user?.permissions?.some(p => p.permission === 'VIEW_ALL_RESERVATIONS' && p.isActive);
    if (!hasViewFlights) {
      setLoading(false);
      setError('UNAUTHORIZED');
      return;
    }
    fetchFlightStatus();
  }, [user, authLoading, moduleLoading, flightEnabled, router]);

  const fetchFlightStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Bugünkü rezervasyonları al
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/reservations', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const reservations = await response.json();

      // Uçuş kodu olan rezervasyonları filtrele
      const flightReservations = reservations.filter((r: any) => r.flightCode && r.flightCode.trim() !== '');

      // Her uçuş için bilgi al
      const flightData: FlightStatusData[] = [];
      for (const reservation of flightReservations) {
        const flightInfo = await FlightTracker.getFlightInfo(reservation.flightCode);
        flightData.push({
          flightCode: reservation.flightCode,
          voucherNumber: reservation.voucherNumber,
          passengerNames: Array.isArray(reservation.passengerNames) 
            ? reservation.passengerNames 
            : JSON.parse(reservation.passengerNames || '[]'),
          from: reservation.from,
          to: reservation.to,
          scheduledTime: `${reservation.date} ${reservation.time}`,
          flightInfo
        });
      }

      setFlights(flightData);
      setFilteredFlights(flightData);
    } catch (err) {
      console.error('Uçuş durumu yüklenirken hata:', err);
      setError('Uçuş durumları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    if (error === 'UNAUTHORIZED') return;
    await fetchFlightStatus();
  };

  // Arama fonksiyonu
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredFlights(flights);
    } else {
      const filtered = flights.filter(flight => 
        flight.flightCode.toLowerCase().includes(term.toLowerCase()) ||
        flight.voucherNumber.toLowerCase().includes(term.toLowerCase()) ||
        flight.passengerNames.some(name => name.toLowerCase().includes(term.toLowerCase())) ||
        flight.from.toLowerCase().includes(term.toLowerCase()) ||
        flight.to.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredFlights(filtered);
    }
  };

  // Uçuş çağırma fonksiyonu
  const handleFlightLookup = async () => {
    if (!lookupFlightCode.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const flightInfo = await FlightTracker.getFlightInfo(lookupFlightCode.trim());
      if (flightInfo) {
        setLookupResult(flightInfo);
      } else {
        setLookupError('Uçuş bulunamadı. Lütfen uçuş kodunu kontrol edin.');
      }
    } catch (err) {
      console.error('Uçuş arama hatası:', err);
      setLookupError('Uçuş bilgisi alınırken bir hata oluştu.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!flightEnabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error === 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 dark:text-slate-400">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  if (error === 'MODULE_DISABLED') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <div className="text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Uçuş Modülü Kapalı</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Uçuş Durumu takibi özelliği şu anda devre dışı bırakılmıştır.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Bu özelliği kullanmak için Modül Yönetimi'nden Uçuş Yönetimi modülünü aktifleştirin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200" id="flight-status-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Uçuş Durumu Takibi</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                Rezervasyonlarınızdaki uçuşların gerçek zamanlı durumunu takip edin
              </p>
            </div>
            <button
              onClick={refreshStatus}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔄 Yenile
            </button>
          </div>

          {/* Arama Kutusu */}
          <div className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-4 transition-colors duration-200">
            <div className="space-y-4">
              {/* Rezervasyon Arama */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label htmlFor="flight-search" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Rezervasyonlarda Ara
                  </label>
                  <input
                    id="flight-search"
                    type="text"
                    placeholder="Uçuş kodu, voucher numarası, yolcu adı veya güzergah ara..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    {filteredFlights.length} / {flights.length} uçuş
                  </span>
                  {searchTerm && (
                    <button
                      onClick={() => handleSearch('')}
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                      title="Temizle"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Uçuş Çağırma */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="flight-lookup" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Uçuş Çağır
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="flight-lookup"
                        type="text"
                        placeholder="Uçuş kodu girin (örn: TK123)"
                        value={lookupFlightCode}
                        onChange={(e) => setLookupFlightCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      />
                      <button
                        onClick={handleFlightLookup}
                        disabled={!lookupFlightCode || lookupLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
                      >
                        {lookupLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Aranıyor...</span>
                          </>
                        ) : (
                          <>
                            <span>🔍</span>
                            <span>Ara</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 transition-colors duration-200">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Hata</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Uçuş Çağırma Sonuçları */}
        {lookupError && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 transition-colors duration-200">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Uçuş Bulunamadı</h3>
                <p className="mt-1 text-sm text-red-700">{lookupError}</p>
              </div>
            </div>
          </div>
        )}

        {lookupResult && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {lookupResult.flightNumber} - {lookupResult.airline}
                </h3>
                <p className="text-sm text-blue-700">
                  Aranan uçuş bilgisi
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                FlightTracker.getFlightStatusColor(lookupResult.status)
              }`}>
                {FlightTracker.getFlightStatusText(lookupResult.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kalkış Bilgileri */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-green-600 mr-2">✈️</span>
                  Kalkış
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Havaalanı:</span>
                    <span className="font-medium">{lookupResult.departure.airport}</span>
                  </div>
                  {lookupResult.departure.terminal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terminal:</span>
                      <span className="font-medium">{lookupResult.departure.terminal}</span>
                    </div>
                  )}
                  {lookupResult.departure.gate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kapı:</span>
                      <span className="font-medium">{lookupResult.departure.gate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planlanan:</span>
                    <span className="font-medium">
                      {FlightTracker.formatTime(lookupResult.departure.scheduled)}
                    </span>
                  </div>
                  {lookupResult.departure.actual && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gerçek:</span>
                      <span className="font-medium">
                        {FlightTracker.formatTime(lookupResult.departure.actual)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lookupResult.departure.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      lookupResult.departure.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                      lookupResult.departure.status === 'boarding' ? 'bg-orange-100 text-orange-800' :
                      lookupResult.departure.status === 'departed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {FlightTracker.getFlightStatusText(lookupResult.departure.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Varış Bilgileri */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-blue-600 mr-2">🏁</span>
                  Varış
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Havaalanı:</span>
                    <span className="font-medium">{lookupResult.arrival.airport}</span>
                  </div>
                  {lookupResult.arrival.terminal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terminal:</span>
                      <span className="font-medium">{lookupResult.arrival.terminal}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planlanan:</span>
                    <span className="font-medium">
                      {FlightTracker.formatTime(lookupResult.arrival.scheduled)}
                    </span>
                  </div>
                  {lookupResult.arrival.actual && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gerçek:</span>
                      <span className="font-medium">
                        {FlightTracker.formatTime(lookupResult.arrival.actual)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durum:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lookupResult.arrival.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      lookupResult.arrival.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                      lookupResult.arrival.status === 'arrived' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {FlightTracker.getFlightStatusText(lookupResult.arrival.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {lookupResult.delay && lookupResult.delay > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span className="text-yellow-800 font-medium">
                    {lookupResult.delay} dakika gecikme
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setLookupResult(null);
                  setLookupError(null);
                  setLookupFlightCode('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* Flight Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlights.map((flight) => (
            <div key={flight.voucherNumber} className="bg-white dark:bg-slate-900/90 rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
              {/* Flight Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {flight.flightCode}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Voucher: {flight.voucherNumber}
                  </p>
                </div>
                {flight.flightInfo && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    FlightTracker.getFlightStatusColor(flight.flightInfo.status)
                  }`}>
                    {FlightTracker.getFlightStatusText(flight.flightInfo.status)}
                  </span>
                )}
              </div>

              {/* Route */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{flight.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{flight.to}</span>
                </div>
              </div>

              {/* Passengers */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Yolcular:</p>
                <p className="text-sm font-medium">
                  {flight.passengerNames.join(', ')}
                </p>
              </div>

              {/* Flight Details */}
              {flight.flightInfo ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Planlanan:</span>
                    <span className="ml-2 font-medium">
                      {FlightTracker.formatTime(flight.flightInfo.departure.scheduled)}
                    </span>
                  </div>
                  
                  {flight.flightInfo.departure.actual && (
                    <div className="text-sm">
                      <span className="text-gray-600">Gerçek:</span>
                      <span className="ml-2 font-medium">
                        {FlightTracker.formatTime(flight.flightInfo.departure.actual)}
                      </span>
                    </div>
                  )}

                  {flight.flightInfo.delay && flight.flightInfo.delay > 0 && (
                    <div className="text-sm text-yellow-600 font-medium">
                      +{flight.flightInfo.delay} dk gecikme
                    </div>
                  )}

                  {flight.flightInfo.departure.gate && (
                    <div className="text-sm">
                      <span className="text-gray-600">Kapı:</span>
                      <span className="ml-2 font-medium">{flight.flightInfo.departure.gate}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Uçuş bilgisi yüklenemedi
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFlights.length === 0 && flights.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Arama Sonucu Bulunamadı</h3>
            <p className="text-gray-500">
              "{searchTerm}" araması için sonuç bulunamadı.
            </p>
            <button
              onClick={() => handleSearch('')}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Tüm uçuşları göster
            </button>
          </div>
        )}

        {flights.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">✈️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Uçuş Bulunamadı</h3>
            <p className="text-gray-500">
              Bugün uçuş kodu olan rezervasyon bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
