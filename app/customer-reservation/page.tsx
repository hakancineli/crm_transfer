'use client';

import { useEffect, useRef, useState } from 'react';

type Currency = 'TRY' | 'USD' | 'EUR' | 'SAR';

export default function CustomerReservationPage() {
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

  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);
  const [fromPredictions, setFromPredictions] = useState<Array<{ description: string }>>([]);
  const [toPredictions, setToPredictions] = useState<Array<{ description: string }>>([]);

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

      if (fromInputRef.current) {
        const ac = new (window as any).google.maps.places.Autocomplete(fromInputRef.current, options);
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const value = place?.formatted_address || place?.name || fromInputRef.current?.value || '';
          setFrom(value);
        });
      }
      if (toInputRef.current) {
        const ac = new (window as any).google.maps.places.Autocomplete(toInputRef.current, options);
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const value = place?.formatted_address || place?.name || toInputRef.current?.value || '';
          setTo(value);
        });
      }
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
    if (!value || value.length < 2) {
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

  const addPassenger = () => setPassengers(prev => [...prev, '']);
  const updatePassenger = (i: number, v: string) => setPassengers(prev => prev.map((p, idx) => (idx === i ? v : p)));
  const removePassenger = (i: number) => setPassengers(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, from, to, flightCode, passengerNames: passengers, luggageCount, price: 0, currency, phoneNumber: phone })
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Transfer Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transfer Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" required />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From</label>
                <input
                  ref={fromInputRef}
                  type="text"
                  value={from}
                  onChange={e => {
                    const v = e.target.value;
                    setFrom(v);
                    requestPredictions(v, 'from');
                  }}
                  placeholder="Adres yazın (örn. Şirinevler)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="from-address"
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
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input
                  ref={toInputRef}
                  type="text"
                  value={to}
                  onChange={e => {
                    const v = e.target.value;
                    setTo(v);
                    requestPredictions(v, 'to');
                  }}
                  placeholder="Adres yazın (örn. Havalimanı)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="to-address"
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

            {/* Mesafe hesaplayıcı ALANI KALDIRILDI */}
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Flight Code (optional)</label>
                <input type="text" value={flightCode} onChange={e => setFlightCode(e.target.value)} placeholder="TK1234" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
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
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Luggage</label>
                <input type="number" min={0} value={Number.isNaN(luggageCount) ? 0 : luggageCount} onChange={e => setLuggageCount(Number.isNaN(parseInt(e.target.value, 10)) ? 0 : parseInt(e.target.value, 10))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
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


