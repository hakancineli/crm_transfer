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

  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);

  // Load Google Maps JS Places and attach Autocomplete
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return; // avoid client crash if key missing

    function initAutocomplete() {
      if (typeof window === 'undefined' || !(window as any).google?.maps?.places) return;

      const options: google.maps.places.AutocompleteOptions = {
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
      initAutocomplete();
      return;
    }
    const s = document.createElement('script');
    s.id = scriptId;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`;
    s.onload = initAutocomplete;
    document.head.appendChild(s);
  }, []);

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
                  onChange={e => setFrom(e.target.value)}
                  placeholder="Adres yazın (örn. Şirinevler)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="from-address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input
                  ref={toInputRef}
                  type="text"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="Adres yazın (örn. Havalimanı)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="to-address"
                  required
                />
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


