"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';

interface TenantInfo {
  id: string;
  companyName: string;
  subdomain?: string;
  paymentIban?: string | null;
  paymentAccountHolder?: string | null;
  paymentBank?: string | null;
}

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const { isEnabled: isCompanySettingsEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [allTenants, setAllTenants] = useState<TenantInfo[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [form, setForm] = useState({ paymentIban: '', paymentAccountHolder: '', paymentBank: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  const fetchTenants = async (tenantId?: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const url = tenantId ? `/api/tenants/payment-info?tenantId=${tenantId}` : '/api/tenants/payment-info';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`API hata: ${res.status}`);
      const data = await res.json();
      if (tenantId) {
        const t = data as TenantInfo;
        setAllTenants([t]);
        setSelectedTenantId(t.id);
        setForm({
          paymentIban: t.paymentIban || '',
          paymentAccountHolder: t.paymentAccountHolder || '',
          paymentBank: t.paymentBank || ''
        });
      } else {
        const list = data as TenantInfo[];
        setAllTenants(list);
        const first = list[0];
        if (first) {
          setSelectedTenantId(first.id);
          setForm({
            paymentIban: first.paymentIban || '',
            paymentAccountHolder: first.paymentAccountHolder || '',
            paymentBank: first.paymentBank || ''
          });
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  // Chrome eklentisi için DOM hazır olana kadar bekle
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (moduleLoading) return;
    
    if (!isCompanySettingsEnabled) {
      router.push('/admin');
      return;
    }

    if (!user) return;
    // API kullanıcı token'ına göre izinli tenantları döner.
    // SUPERUSER için tümü, diğer roller için kendi tenant(lar)ı.
    fetchTenants();
  }, [user, moduleLoading, isCompanySettingsEnabled, router]);

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTenantId(id);
    const t = allTenants.find(x => x.id === id);
    if (t) {
      setForm({
        paymentIban: t.paymentIban || '',
        paymentAccountHolder: t.paymentAccountHolder || '',
        paymentBank: t.paymentBank || ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/tenants/payment-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tenantId: selectedTenantId, ...form })
      });
      if (!res.ok) throw new Error(`Kaydetme hatası: ${res.status}`);
      const updated = await res.json();
      setMessage('Ödeme bilgileri güncellendi');
      setAllTenants(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } catch (e: any) {
      setError(e?.message || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const title = user?.role === 'SUPERUSER' ? 'Şirket Ayarları' : 'Şirket Ödeme Bilgileri';

  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isCompanySettingsEnabled) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6" id="company-settings-page">
      <h1 className="text-xl font-semibold mb-4">{title}</h1>
      {loading && <div>Yükleniyor...</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {message && <div className="text-green-600 mb-3">{message}</div>}

      {user?.role === 'SUPERUSER' && allTenants.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Şirket Seçin</label>
          <select value={selectedTenantId} onChange={handleTenantChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm">
            {allTenants.map(t => (
              <option key={t.id} value={t.id}>{t.companyName}</option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">IBAN</label>
          <input name="paymentIban" value={form.paymentIban} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hesap Sahibi</label>
          <input name="paymentAccountHolder" value={form.paymentAccountHolder} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Banka</label>
          <input name="paymentBank" value={form.paymentBank} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
        </div>
        <button type="submit" disabled={saving || !selectedTenantId} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </form>
    </div>
  );
}


