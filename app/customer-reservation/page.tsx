'use client';

import { useState, useEffect } from 'react';
import { calculatePrice, PriceCalculation } from '../utils/priceCalculator';
import { getExchangeRates, calculatePriceWithCurrency } from '../utils/currencyConverter';
import GoogleMap from '../components/GoogleMap';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function CustomerReservationPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('12:00');
  const [passengers, setPassengers] = useState<string[]>(['']);
  const [luggageCount, setLuggageCount] = useState<number>(0);
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');
  const [phone, setPhone] = useState('');
  const [flightCode, setFlightCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  // Döviz kurlarını yükle
  useEffect(() => {
    getExchangeRates().then(rates => {
      setExchangeRates(rates);
    });
  }, []);

  // Mesafe hesaplama
  const handleDistanceCalculated = (distance: number) => {
    setDistanceKm(distance);
    if (from && to) {
      const calculation = calculatePrice(from, to, currency, distance);
      setPriceCalculation(calculation);
    }
  };

  // Fiyat hesaplama
  useEffect(() => {
    if (from.trim() && to.trim()) {
      const calculation = calculatePrice(from, to, currency, distanceKm || undefined);
      setPriceCalculation(calculation);
    } else {
      setPriceCalculation(null);
    }
  }, [from, to, currency, distanceKm]);

  const addPassenger = () => setPassengers(prev => [...prev, '']);
  const updatePassenger = (i: number, v: string) => setPassengers(prev => prev.map((p, idx) => (idx === i ? v : p)));
  const removePassenger = (i: number) => setPassengers(prev => prev.filter((_, idx) => idx !== i));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time,
          from,
          to,
          flightCode,
          passengerNames: passengers,
          luggageCount,
          price: priceCalculation?.price || 0,
          currency,
          phoneNumber: phone,
          distanceKm: distanceKm || null
        })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Gönderim başarısız');
      }
      const data = await res.json();
      window.location.href = `/customer-reservation/thank-you?voucher=${data.voucherNumber}`;
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Breadcrumb />
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white p-6">
            <h1 className="text-2xl font-bold">Transfer Rezervasyonu</h1>
            <p className="text-green-100">Güvenli ve konforlu transfer hizmeti</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {/* Anlık Fiyat Gösterimi */}
            {priceCalculation && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">💰 Anlık Fiyat Hesaplaması</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mesafe:</span>
                    <span className="ml-2 font-medium">{priceCalculation.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fiyat ({currency}):</span>
                    <span className="ml-2 font-bold text-lg text-green-700">
                      {priceCalculation.price.toLocaleString()} {currency}
                    </span>
                  </div>
                  {currency !== 'USD' && priceCalculation.priceInUSD && (
                    <div>
                      <span className="text-gray-600">USD karşılığı:</span>
                      <span className="ml-2">≈ ${priceCalculation.priceInUSD.toFixed(2)}</span>
                    </div>
                  )}
                  {currency !== 'EUR' && priceCalculation.priceInEUR && (
                    <div>
                      <span className="text-gray-600">EUR karşılığı:</span>
                      <span className="ml-2">≈ €{priceCalculation.priceInEUR.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-green-600">
                  💡 Konumları girdiğiniz anda ücretinizi anında görün. Sabit fiyat, sürpriz yok.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transfer Detayları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Tarihi</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Saati</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={e => setTime(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    required 
                  />
                </div>
              </div>

              {/* Konum Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nereden</label>
                  <PlacesAutocomplete
                    value={from}
                    onChange={setFrom}
                    placeholder="Örn: İstanbul Havalimanı (IST)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nereye</label>
                  <PlacesAutocomplete
                    value={to}
                    onChange={setTo}
                    placeholder="Örn: Beşiktaş, İstanbul"
                  />
                </div>
              </div>

              {/* Google Maps */}
              {from && to && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium mb-2"
                  >
                    {showMap ? '🗺️ Haritayı Gizle' : '🗺️ Rota Haritasını Göster'}
                  </button>
                  {showMap && (
                    <GoogleMap
                      fromLocation={from}
                      toLocation={to}
                      onDistanceCalculated={handleDistanceCalculated}
                      onRouteCalculated={() => {}}
                    />
                  )}
                </div>
              )}

              {/* Fiyat Hesaplama Tablosu */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Fiyat nasıl hesaplanır?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">0-10 km</div>
                    <div className="text-green-600">800 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">11-20 km</div>
                    <div className="text-green-600">1100 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">21-30 km</div>
                    <div className="text-green-600">1400 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">31-40 km</div>
                    <div className="text-green-600">1500 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">41-45 km</div>
                    <div className="text-green-600">1700 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">46-50 km</div>
                    <div className="text-green-600">1850 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">51-60 km</div>
                    <div className="text-green-600">2200 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">61-70 km</div>
                    <div className="text-green-600">2300 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">71-80 km</div>
                    <div className="text-green-600">2400 TRY</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">81-90 km</div>
                    <div className="text-green-600">2500 TRY</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  90 km üzeri her +10 km için +300 TRY eklenir. Bu tahmini fiyattır.
                </p>
              </div>

              {/* Ek Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uçuş Kodu (Opsiyonel)</label>
                  <input 
                    type="text" 
                    value={flightCode} 
                    onChange={e => setFlightCode(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="Örn: TK1234" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                  <select 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value as any)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Yolcu Bilgileri */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Yolcular</label>
                <p className="text-xs text-gray-600 mb-2">
                  Lütfen tüm yolcuların pasaporttaki tam isimlerini giriniz.
                </p>
                {passengers.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={p} 
                      onChange={e => updatePassenger(i, e.target.value)} 
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                      placeholder={`Yolcu ${i+1}`} 
                      required 
                    />
                    {passengers.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removePassenger(i)} 
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addPassenger} 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  + Yolcu ekle
                </button>
              </div>

              {/* Bagaj ve İletişim */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bagaj Sayısı</label>
                  <input 
                    type="number" 
                    min={0} 
                    value={luggageCount} 
                    onChange={e => setLuggageCount(parseInt(e.target.value || '0', 10))} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    placeholder="0554 581 20 34" 
                    required 
                  />
                </div>
              </div>

              {/* Gönder Butonu */}
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                    submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {submitting ? 'Gönderiliyor...' : 'Rezervasyon Talebi Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
