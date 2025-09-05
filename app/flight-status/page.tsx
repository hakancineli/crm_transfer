'use client';

import { useState, useEffect } from 'react';
import { FlightInfo, FlightTracker } from '@/app/lib/flightTracker';

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
  const [flights, setFlights] = useState<FlightStatusData[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFlightStatus();
  }, []);

  const fetchFlightStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Bugünkü rezervasyonları al
      const response = await fetch('/api/reservations');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Uçuş Durumu Takibi</h1>
              <p className="mt-2 text-sm text-gray-600">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label htmlFor="flight-search" className="block text-sm font-medium text-gray-700 mb-2">
                  Uçuş Ara
                </label>
                <input
                  id="flight-search"
                  type="text"
                  placeholder="Uçuş kodu, voucher numarası, yolcu adı veya güzergah ara..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {filteredFlights.length} / {flights.length} uçuş
                </span>
                {searchTerm && (
                  <button
                    onClick={() => handleSearch('')}
                    className="text-gray-400 hover:text-gray-600"
                    title="Temizle"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Hata</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Flight Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlights.map((flight) => (
            <div key={flight.voucherNumber} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
