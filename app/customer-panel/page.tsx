'use client';

import { useState } from 'react';

export default function CustomerPanelPage() {
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch(`/api/reservations?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Arama başarısız');
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Rezervasyon Sorgulama</h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon numarası"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            required
          />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md">
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </form>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <div className="space-y-2">
          {results.length === 0 && !loading ? (
            <div className="text-gray-500 text-sm">Sonuç yok</div>
          ) : (
            results.map((r) => (
              <div key={r.id} className="border rounded-md p-3">
                <div className="text-sm text-gray-600">Voucher</div>
                <div className="font-medium">{r.voucherNumber}</div>
                <div className="text-sm text-gray-600 mt-1">Tarih / Saat</div>
                <div className="font-medium">{r.date} {r.time}</div>
                <div className="text-sm text-gray-600 mt-1">Güzergah</div>
                <div className="font-medium">{r.from} → {r.to}</div>
                {r.price != null && r.currency && (
                  <div className="text-sm text-gray-600 mt-1">Fiyat</div>
                )}
                {r.price != null && r.currency && (
                  <div className="font-medium">{r.price} {r.currency}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


