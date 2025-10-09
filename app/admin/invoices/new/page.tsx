'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function NewInvoiceInner() {
  const search = useSearchParams();
  const reservationId = search.get('reservationId');
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [tenantCurrency, setTenantCurrency] = useState<string>('');
  const [rates, setRates] = useState<{ USD: number; EUR: number; TRY: number }>({ USD: 1, EUR: 0.85, TRY: 31.5 });

  useEffect(() => {
    const load = async () => {
      if (!reservationId) {
        // Manuel fatura girişi için boş taslak hazırla
        setDraft({
          tenantId: '',
          customerName: '',
          customerTaxId: '',
          customerEmail: '',
          customerAddress: '',
          currency: 'TRY',
          vatRate: 20,
          items: []
        });
        return;
      }
      try {
        const res = await fetch(`/api/invoices/prefill/${reservationId}`);
        const data = await res.json();
        if (data.success) setDraft({ ...data.draft, tenantId: '', reservationId, __meta: data.meta });
        else setDraft({ tenantId: '', currency: 'TRY', vatRate: 20, items: [] });
      } catch {
        setDraft({ tenantId: '', currency: 'TRY', vatRate: 20, items: [] });
      }
    };
    load();
  }, [reservationId]);

  // Kur bilgilerini al (USD bazlı)
  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (data?.rates) {
          setRates({ USD: 1, EUR: data.rates.EUR || 0.9, TRY: data.rates.TRY || 30 });
        }
      } catch {}
    };
    loadRates();
  }, []);

  const convert = (amount: number, from: string, to: string) => {
    const f = from as keyof typeof rates;
    const t = to as keyof typeof rates;
    const fromRate = rates[f] ?? 1;
    const toRate = rates[t] ?? 1;
    // USD tabanlı dönüşüm: amount_in_usd = amount / fromRate; target = amount_in_usd * toRate
    const usd = amount / fromRate;
    return usd * toRate;
  };

  // Tenant varsayılan para birimini yükle ve taslağa uygula
  useEffect(() => {
    const loadTenant = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch('/api/tenant/settings', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        if (res.ok) {
          const data = await res.json();
          const curr = data?.defaultCurrency || data?.tenant?.defaultCurrency;
          if (curr) setTenantCurrency(curr);
          // Taslak varsa ve currency HENÜZ belirlenmemişse tenant currency uygula
          setDraft((d: any) => {
            if (!d) return d;
            if (!d.currency) return { ...d, currency: curr || 'TRY' };
            return d; // rezervasyon taslağı para birimi belirlediyse dokunma
          });
        }
      } catch {}
    };
    loadTenant();
  }, []);

  const addItem = () => {
    setDraft((d: any) => ({
      ...(d || { items: [] }),
      items: [ ...(d?.items || []), { description: '', quantity: 1, unitPrice: 0, vatRate: d?.vatRate ?? 20 } ]
    }));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) setMessage('Fatura oluşturuldu'); else setMessage(data.error || 'Hata');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Yeni Fatura</h1>
      {!draft ? (
        <div className="text-gray-600">Taslak oluşturuluyor veya manuel giriş bekleniyor...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Tenant ID" value={draft.tenantId || ''} onChange={e => setDraft({ ...draft, tenantId: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Müşteri Adı" value={draft.customerName || ''} onChange={e => setDraft({ ...draft, customerName: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Vergi No" value={draft.customerTaxId || ''} onChange={e => setDraft({ ...draft, customerTaxId: e.target.value })} />
            <input className="border p-2 rounded" placeholder="E-posta" value={draft.customerEmail || ''} onChange={e => setDraft({ ...draft, customerEmail: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Adres" value={draft.customerAddress || ''} onChange={e => setDraft({ ...draft, customerAddress: e.target.value })} />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Para Birimi</label>
              <select
                className="border p-2 rounded w-full"
                value={draft.currency || 'TRY'}
                onChange={e => {
                  const newCurr = e.target.value;
                  // mevcut kalemleri seçilen para birimine çevir
                  const items = (draft.items || []).map((it: any) => {
                    const from = draft.currency || 'TRY';
                    const converted = convert(it.unitPrice, from, newCurr);
                    return { ...it, unitPrice: Number(converted.toFixed(2)) };
                  });
                  setDraft({ ...draft, currency: newCurr, items });
                }}
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium">Kalemler</h2>
              <button onClick={addItem} className="px-3 py-1 bg-gray-800 text-white rounded">Kalem Ekle</button>
            </div>
            <div className="space-y-2">
              {(draft.items || []).map((it: any, idx: number) => (
                <div key={idx} className="grid grid-cols-6 gap-2">
                  <input className="border p-2 rounded col-span-3" placeholder="Açıklama" value={it.description} onChange={e => {
                    const items = [...draft.items]; items[idx].description = e.target.value; setDraft({ ...draft, items });
                  }} />
                  <input type="number" className="border p-2 rounded" placeholder="Adet" value={it.quantity}
                    onChange={e => { const items = [...draft.items]; items[idx].quantity = Number(e.target.value); setDraft({ ...draft, items }); }} />
                  <input type="number" className="border p-2 rounded" placeholder="Birim Fiyat" value={it.unitPrice}
                    onChange={e => { const items = [...draft.items]; items[idx].unitPrice = Number(e.target.value); setDraft({ ...draft, items }); }} />
                  <input type="number" className="border p-2 rounded" placeholder="KDV %" value={it.vatRate}
                    onChange={e => { const items = [...draft.items]; items[idx].vatRate = Number(e.target.value); setDraft({ ...draft, items }); }} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Not: Para birimi, faturanın resmi para birimidir. Rezervasyon dövizi ne olursa olsun burada seçtiğiniz birim faturaya yazılır.</p>
          </div>

          {/* Özet */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Özet</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Voucher: <span className="font-semibold">{draft.__meta?.voucherNumber || '-'}</span></div>
              <div>Tarih: <span className="font-semibold">{draft.__meta ? `${draft.__meta.date} ${draft.__meta.time}` : '-'}</span></div>
              <div>Rota: <span className="font-semibold">{draft.__meta?.route || '-'}</span></div>
              <div>Para Birimi: <span className="font-semibold">{draft.currency || 'TRY'}</span></div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
              {saving ? 'Kaydediliyor...' : 'Fatura Oluştur'}
            </button>
          </div>

          {message && <div className="text-sm text-gray-700">{message}</div>}
        </div>
      )}
    </div>
  );
}
export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <NewInvoiceInner />
    </Suspense>
  );
}
