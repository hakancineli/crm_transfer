'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

type Currency = 'TRY' | 'USD' | 'EUR' | 'SAR';

export default function CustomerReservationPage() {
  const { t } = useLanguage();
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('23:59');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [flightCode, setFlightCode] = useState<string>('');
  const [passengers, setPassengers] = useState<string[]>(['']);
  const [luggageCount, setLuggageCount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debug, setDebug] = useState<{ hasKey: boolean; script: boolean; googleReady: boolean; lastPredFrom: number; lastPredTo: number; lastStatus?: string }>({ hasKey: false, script: false, googleReady: false, lastPredFrom: 0, lastPredTo: 0 });
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);
  const [estimatedPriceTRY, setEstimatedPriceTRY] = useState<number | null>(null);
  const [fxRates, setFxRates] = useState<Partial<Record<Currency, number>>>({});
  const [fxError, setFxError] = useState<string>('');

  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);
  const [fromPredictions, setFromPredictions] = useState<Array<{ description: string }>>([]);
  const [toPredictions, setToPredictions] = useState<Array<{ description: string }>>([]);
  const fromDebounceRef = useRef<number | undefined>(undefined);
  const toDebounceRef = useRef<number | undefined>(undefined);

  // Load Google Maps JS Places and attach Autocomplete
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
    const enableDebug = params?.get('debug') === '1';
    if (enableDebug) setDebug(prev => ({ ...prev, hasKey: Boolean(apiKey) }));
    if (!apiKey) return; // avoid client crash if key missing

    function initAutocomplete() {
      if (typeof window === 'undefined' || !(window as any).google?.maps?.places) {
        if (enableDebug) setDebug(prev => ({ ...prev, googleReady: false }));
        return;
      }
      if (enableDebug) setDebug(prev => ({ ...prev, googleReady: true }));

      // Avoid direct typing against global `google` namespace during SSR
      const options: any = {
        fields: ['formatted_address', 'geometry', 'name'],
        componentRestrictions: { country: ['tr'] },
        types: ['geocode']
      };

      // We intentionally skip binding native Autocomplete to avoid any browser autofill/IME conflicts.
      // Fallback prediction dropdown below is used instead.
    }

    const scriptId = 'gmaps-places-script';
    if (document.getElementById(scriptId)) {
      if (enableDebug) setDebug(prev => ({ ...prev, script: true }));
      initAutocomplete();
      return;
    }
    const s = document.createElement('script');
    s.id = scriptId;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`;
    s.onload = () => {
      initAutocomplete();
      // retry a few times in case widget couldn't bind instantly
      let attempts = 0;
      const i = window.setInterval(() => {
        attempts += 1;
        initAutocomplete();
        if (attempts > 5) window.clearInterval(i);
      }, 500);
    };
    s.onerror = () => {
      if (enableDebug) setDebug(prev => ({ ...prev, script: false }));
      console.error('Google Maps script failed to load');
    };
    document.head.appendChild(s);
    if (enableDebug) setDebug(prev => ({ ...prev, script: true }));
  }, []);

  // Fallback: manual predictions via AutocompleteService
  const requestPredictions = (value: string, which: 'from' | 'to') => {
    setError('');
    if (!value || value.length < 1) {
      if (which === 'from') setFromPredictions([]);
      else setToPredictions([]);
      return;
    }
    const g = (window as any).google;
    if (!g?.maps?.places?.AutocompleteService) return; // wait for script
    const service = new g.maps.places.AutocompleteService();
    const sessionToken = g.maps.places.AutocompleteSessionToken ? new g.maps.places.AutocompleteSessionToken() : undefined;
    service.getPlacePredictions(
      { input: value, componentRestrictions: { country: ['tr'] }, sessionToken, language: 'tr', region: 'TR' },
      (preds: Array<{ description: string }> | null, status: string) => {
        const list = preds || [];
        if (which === 'from') setFromPredictions(list);
        else setToPredictions(list);
        setDebug(prev => ({ ...prev, lastPredFrom: which === 'from' ? list.length : prev.lastPredFrom, lastPredTo: which === 'to' ? list.length : prev.lastPredTo, lastStatus: status }));
        if (status && status !== 'OK') {
          console.warn('Places getPlacePredictions status:', status);
        }
      }
    );
  };

  // Kur bilgilerini çek (TRY bazlı)
  useEffect(() => {
    async function fetchFx() {
      try {
        setFxError('');
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
        const data = await res.json();
        const next: Partial<Record<Currency, number>> = {
          TRY: 1,
          USD: data?.rates?.USD ?? undefined,
          EUR: data?.rates?.EUR ?? undefined,
          SAR: data?.rates?.SAR ?? undefined
        };
        setFxRates(next);
      } catch (err) {
        setFxError('Kur bilgisi alınamadı');
        setFxRates({ TRY: 1, USD: 0.03, EUR: 0.03, SAR: 0.11 });
      }
    }
    fetchFx();
  }, []);

  const convertFromTRY = (amountTRY: number | null, to: Currency): number | null => {
    if (amountTRY == null) return null;
    if (to === 'TRY') return amountTRY;
    const rate = fxRates[to];
    if (!rate || rate <= 0) return null;
    return amountTRY * rate;
  };

  // Price slabs in TRY
  function getPriceFromKm(km: number): number | null {
    if (km <= 0) return 800; // minimal
    if (km <= 10) return 800;
    if (km <= 20) return 1100;
    if (km <= 30) return 1400;
    if (km <= 40) return 1500; // updated
    if (km <= 45) return 1700; // updated
    if (km <= 50) return 1850; // updated
    if (km <= 60) return 2200;
    if (km <= 70) return 2300;
    if (km <= 80) return 2400;
    if (km <= 90) return 2500;
    // beyond 90 km: +300 TRY per each additional 10 km block
    const extraBlocks = Math.ceil((km - 90) / 10);
    return 2500 + extraBlocks * 300;
  }

  // Calculate distance when both addresses present
  useEffect(() => {
    const g = (window as any).google;
    if (!from || !to || !g?.maps?.DistanceMatrixService) return;
    let cancelled = false;
    setEstimating(true);
    const svc = new g.maps.DistanceMatrixService();
    svc.getDistanceMatrix({
      origins: [from],
      destinations: [to],
      travelMode: g.maps.TravelMode.DRIVING,
      unitSystem: g.maps.UnitSystem.METRIC,
      language: 'tr',
      region: 'TR'
    }, (res: any, status: string) => {
      if (cancelled) return;
      try {
        if (status === 'OK' && res?.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const meters = res.rows[0].elements[0].distance.value as number;
          const km = meters / 1000;
          setDistanceKm(km);
          setEstimatedPriceTRY(getPriceFromKm(km));
        } else {
          setDistanceKm(null);
          setEstimatedPriceTRY(null);
          console.warn('DistanceMatrix status:', status, res?.rows?.[0]?.elements?.[0]?.status);
        }
      } finally {
        setEstimating(false);
      }
    });
    return () => { cancelled = true; };
  }, [from, to]);

  const addPassenger = () => setPassengers(prev => [...prev, '']);
  const updatePassenger = (i: number, v: string) => setPassengers(prev => prev.map((p, idx) => (idx === i ? v : p)));
  const removePassenger = (i: number) => setPassengers(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const priceToSubmit = (() => {
        if (estimatedPriceTRY == null) return 0;
        const converted = convertFromTRY(estimatedPriceTRY, currency);
        return converted == null ? estimatedPriceTRY : converted;
      })();

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
          price: priceToSubmit, 
          currency, 
          phoneNumber: phone,
          distanceKm: distanceKm || null
        })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
      }
      window.location.href = '/customer-reservation/thank-you';
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug panel: add ?debug=1 to URL to show */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1' && (
          <div className="mb-3 text-xs text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-2">
            <div>API key present: {String(debug.hasKey)}</div>
            <div>Script tag injected: {String(debug.script)}</div>
            <div>google.maps.places ready: {String(debug.googleReady)}</div>
            <div>Predictions counts — from: {debug.lastPredFrom}, to: {debug.lastPredTo}</div>
            {debug.lastStatus && <div>Places status: {debug.lastStatus}</div>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-700">{error}</div>
          )}

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start md:items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.transferDate') || 'Transfer Date'}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.transferTime') || 'Transfer Time'}</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" required />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.from') || 'From'}</label>
                <input
                  ref={fromInputRef}
                  type="text"
                  value={from}
                  onChange={e => {
                    const v = e.target.value;
                    setFrom(v);
                    if (fromDebounceRef.current) window.clearTimeout(fromDebounceRef.current);
                    fromDebounceRef.current = window.setTimeout(() => requestPredictions(v, 'from'), 150);
                  }}
                  placeholder={t('customerForm.fromPlaceholder') || 'Adres yazın (örn. Şirinevler)'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="search"
                  name="from-address-no-autofill"
                  required
                />
                {fromPredictions.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-sm max-h-60 overflow-auto z-10 relative">
                    {fromPredictions.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setFrom(p.description); setFromPredictions([]); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {p.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.to') || 'To'}</label>
                <input
                  ref={toInputRef}
                  type="text"
                  value={to}
                  onChange={e => {
                    const v = e.target.value;
                    setTo(v);
                    if (toDebounceRef.current) window.clearTimeout(toDebounceRef.current);
                    toDebounceRef.current = window.setTimeout(() => requestPredictions(v, 'to'), 150);
                  }}
                  placeholder={t('customerForm.toPlaceholder') || 'Adres yazın (örn. Havalimanı)'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="search"
                  name="to-address-no-autofill"
                  required
                />
                {toPredictions.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-md bg-white shadow-sm max-h-60 overflow-auto z-10 relative">
                    {toPredictions.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setTo(p.description); setToPredictions([]); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {p.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Distance and price display - moved outside grid for proper alignment */}
            {(from && to) && (
              <div className="mt-3 text-sm text-gray-700 flex items-center gap-3">
                <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1">{estimating || distanceKm === null ? 'Hesaplanıyor…' : `${distanceKm.toFixed(1)} km`}</span>
                {estimatedPriceTRY !== null && (
                  <>
                    <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2 py-1 font-medium text-green-700">Tahmini Fiyat: {estimatedPriceTRY.toLocaleString('tr-TR')} TRY</span>
                    {currency !== 'TRY' && (
                      <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-medium text-blue-700">
                        ≈ {(() => {
                          const converted = convertFromTRY(estimatedPriceTRY, currency);
                          return converted != null ? converted.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '-';
                        })()} {currency}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Compact fiyatlandırma bilgilendirmesi */}
            <div className="mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
              <div className="font-medium text-gray-700 mb-1">Fiyat nasıl hesaplanır?</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div>0–10 km: 800 TRY</div>
                <div>11–20 km: 1100 TRY</div>
                <div>21–30 km: 1400 TRY</div>
                <div>31–40 km: 1500 TRY</div>
                <div>41–45 km: 1700 TRY</div>
                <div>46–50 km: 1850 TRY</div>
                <div>51–60 km: 2200 TRY</div>
                <div>61–70 km: 2300 TRY</div>
                <div>71–80 km: 2400 TRY</div>
                <div>81–90 km: 2500 TRY</div>
              </div>
              <div className="mt-1 text-gray-500">90 km üzeri her +10 km için +300 TRY eklenir. Bu tahmini fiyattır.</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.flightCode') || 'Flight Code (optional)'}</label>
                <input type="text" value={flightCode} onChange={e => setFlightCode(e.target.value)} placeholder="TK1234" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.currency') || 'Currency'}</label>
                <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500">
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-2">
              {passengers.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={p} onChange={e => updatePassenger(i, e.target.value)} placeholder={`Passenger ${i + 1} name`} className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" required />
                  {passengers.length > 1 && (
                    <button type="button" onClick={() => removePassenger(i)} className="mt-1 px-3 py-2 border rounded-md text-sm">Sil</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addPassenger} className="px-3 py-2 border rounded-md text-sm">+ Yolcu ekle</button>
              <p className="text-xs text-gray-600">Lütfen tüm yolcuların pasaporttaki tam isimlerini giriniz.</p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.luggage') || 'Number of Luggage'}</label>
                <input 
                  type="number" 
                  min={0} 
                  value={luggageCount === 0 ? '' : luggageCount} 
                  onChange={e => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value, 10);
                    setLuggageCount(Number.isNaN(numValue) ? 0 : numValue);
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('customerForm.phone') || 'Phone'}</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0554 581 20 34" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className={`inline-flex items-center gap-2 py-2 px-4 rounded-md text-white ${submitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>
              {submitting ? 'Gönderiliyor...' : 'Rezervasyon Talebi Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


