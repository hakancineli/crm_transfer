"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface TenantSettings {
  id: string;
  companyName: string;
  subdomain: string;
  domain?: string;
  // Ödeme Bilgileri
  paymentIban?: string;
  paymentAccountHolder?: string;
  paymentBank?: string;
  // Genel Bilgiler
  taxNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  workingHours?: string;
  holidayDays?: string;
  // Marka & Tasarım
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  voucherBackgroundUrl?: string;
  // Sistem Ayarları
  defaultLanguage?: string;
  defaultCurrency?: string;
  timezone?: string;
  dateFormat?: string;
  temperatureUnit?: string;
  // Entegrasyonlar
  whatsappApiKey?: string;
  googleMapsApiKey?: string;
  yandexMapsEnabled?: boolean;
  // U-ETDS Entegrasyonu
  uetdsEnabled?: boolean;
  uetdsUsername?: string;
  uetdsPassword?: string;
  uetdsUnetNo?: string;
  uetdsTestMode?: boolean;
  // Kullanıcı Yönetimi
  maxUsers?: number;
  maxConcurrentSessions?: number;
  passwordMinLength?: number;
  passwordExpiryDays?: number;
  // Raporlama & Analitik
  dataRetentionDays?: number;
  autoArchiveEnabled?: boolean;
  reportLogoEnabled?: boolean;
  // Güvenlik
  apiKeyExpiryDays?: number;
  auditLogRetentionDays?: number;
  dataEncryptionLevel?: string;
}

export default function TenantSettingsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantSettings[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState<Partial<TenantSettings>>({});

  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: 'general', name: 'Genel Bilgiler', icon: '🏢' },
    { id: 'payment', name: 'Ödeme & Faturalama', icon: '💳' },
    { id: 'branding', name: 'Marka & Tasarım', icon: '🎨' },
    { id: 'system', name: 'Sistem Ayarları', icon: '⚙️' },
    { id: 'integrations', name: 'Entegrasyonlar', icon: '🔗' },
    { id: 'users', name: 'Kullanıcı Yönetimi', icon: '👥' },
    { id: 'reporting', name: 'Raporlama & Analitik', icon: '📊' },
    { id: 'security', name: 'Güvenlik & İzinler', icon: '🔒' }
  ];

  useEffect(() => {
    if (user) {
      fetchTenants();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTenantId && tenants.length > 0) {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (tenant) {
        setFormData(tenant);
      }
    }
  }, [selectedTenantId, tenants]);

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/tenant/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`API hata: ${res.status}`);
      const data = await res.json();
      setTenants(data.tenants);
      if (data.tenants.length > 0) {
        setSelectedTenantId(data.tenants[0].id);
      }
    } catch (e: any) {
      setError(e?.message || 'Veri yükleme hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTenantId(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!selectedTenantId) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ tenantId: selectedTenantId, ...formData })
      });
      if (!res.ok) throw new Error(`Kaydetme hatası: ${res.status}`);
      const data = await res.json();
      setMessage('Ayarlar başarıyla güncellendi');
      // Tenant listesini güncelle
      setTenants(prev => prev.map(t => t.id === selectedTenantId ? { ...t, ...formData } : t));
    } catch (e: any) {
      setError(e?.message || 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    if (!selectedTenantId) return;
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/tenant/settings/backup?tenantId=${selectedTenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Yedekleme hatası');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-settings-${formData.companyName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      setError(e?.message || 'Yedekleme hatası');
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/tenant/settings/backup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ tenantId: selectedTenantId, backupData })
      });
      
      if (!res.ok) throw new Error('Geri yükleme hatası');
      const data = await res.json();
      setMessage('Ayarlar başarıyla geri yüklendi');
      setFormData(data.tenant);
    } catch (e: any) {
      setError(e?.message || 'Geri yükleme hatası');
    }
  };

  // Chrome eklentisi için DOM hazır olana kadar bekle
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center text-gray-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200" id="tenant-settings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900/90 shadow dark:shadow-none rounded-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Acente Ayarları</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">Acente bilgilerinizi ve sistem ayarlarınızı yönetin</p>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === 'SUPERUSER' && tenants.length > 0 && (
                  <>
                    <label className="text-sm text-gray-600">Acente:</label>
                    <select
                      value={selectedTenantId}
                      onChange={handleTenantChange}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.companyName}</option>
                      ))}
                    </select>
                  </>
                )}
                <button
                  onClick={handleBackup}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                >
                  Yedekle
                </button>
                <label className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 cursor-pointer">
                  Geri Yükle
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          {message && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">{message}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Genel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
                    <input
                      type="text"
                      name="taxNumber"
                      value={formData.taxNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                    <input
                      type="text"
                      name="subdomain"
                      value={formData.subdomain || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Özel Domain</label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain || ''}
                      onChange={handleInputChange}
                      placeholder="ornek.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="url"
                      name="logoUrl"
                      value={formData.logoUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Çalışma Saatleri</label>
                    <input
                      type="text"
                      name="workingHours"
                      value={formData.workingHours || ''}
                      onChange={handleInputChange}
                      placeholder="09:00-18:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tatil Günleri</label>
                    <input
                      type="text"
                      name="holidayDays"
                      value={formData.holidayDays || ''}
                      onChange={handleInputChange}
                      placeholder="Pazar, Resmi Tatiller"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Ödeme & Faturalama</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                    <input
                      type="text"
                      name="paymentIban"
                      value={formData.paymentIban || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hesap Sahibi</label>
                    <input
                      type="text"
                      name="paymentAccountHolder"
                      value={formData.paymentAccountHolder || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banka</label>
                    <input
                      type="text"
                      name="paymentBank"
                      value={formData.paymentBank || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Marka & Tasarım</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ana Renk</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        name="primaryColor"
                        value={formData.primaryColor || '#3B82F6'}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        value={formData.primaryColor || '#3B82F6'}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İkincil Renk</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={formData.secondaryColor || '#10B981'}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="secondaryColor"
                        value={formData.secondaryColor || '#10B981'}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Ailesi</label>
                    <select
                      name="fontFamily"
                      value={formData.fontFamily || 'Inter'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Voucher Arka Plan URL</label>
                    <input
                      type="url"
                      name="voucherBackgroundUrl"
                      value={formData.voucherBackgroundUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Sistem Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Dil</label>
                    <select
                      name="defaultLanguage"
                      value={formData.defaultLanguage || 'tr'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ru">Русский</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Para Birimi</label>
                    <select
                      name="defaultCurrency"
                      value={formData.defaultCurrency || 'TRY'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="TRY">TRY - Türk Lirası</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Saat Dilimi</label>
                    <select
                      name="timezone"
                      value={formData.timezone || 'Europe/Istanbul'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Europe/Istanbul">Europe/Istanbul</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Formatı</label>
                    <select
                      name="dateFormat"
                      value={formData.dateFormat || 'DD/MM/YYYY'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sıcaklık Birimi</label>
                    <select
                      name="temperatureUnit"
                      value={formData.temperatureUnit || 'celsius'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="celsius">Celsius (°C)</option>
                      <option value="fahrenheit">Fahrenheit (°F)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Entegrasyonlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WhatsApp */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📱</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">WhatsApp Business API</h4>
                          <p className="text-sm text-gray-600">Müşteri ve şoför bildirimleri</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.whatsappApiKey ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.whatsappApiKey ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Anahtarı</label>
                        <input
                          type="password"
                          name="whatsappApiKey"
                          value={formData.whatsappApiKey || ''}
                          onChange={handleInputChange}
                          placeholder="WhatsApp API anahtarınızı girin"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          // WhatsApp API testi
                          if (formData.whatsappApiKey) {
                            setMessage('WhatsApp API bağlantısı test edildi');
                          } else {
                            setError('API anahtarı gerekli');
                          }
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Bağlantıyı Test Et
                      </button>
                    </div>
                  </div>

                  {/* U-ETDS */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🚌</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">U-ETDS Entegrasyonu</h4>
                          <p className="text-sm text-gray-600">Ulaştırma Elektronik Takip Denetim Sistemi</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.uetdsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.uetdsEnabled ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="uetdsEnabled"
                          checked={formData.uetdsEnabled || false}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">U-ETDS entegrasyonunu etkinleştir</label>
                      </div>
                      
                      {formData.uetdsEnabled && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                            <input
                              type="text"
                              name="uetdsUsername"
                              value={formData.uetdsUsername || ''}
                              onChange={handleInputChange}
                              placeholder="U-ETDS kullanıcı adı"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                            <input
                              type="password"
                              name="uetdsPassword"
                              value={formData.uetdsPassword || ''}
                              onChange={handleInputChange}
                              placeholder="U-ETDS şifresi"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UNET Numarası</label>
                            <input
                              type="text"
                              name="uetdsUnetNo"
                              value={formData.uetdsUnetNo || ''}
                              onChange={handleInputChange}
                              placeholder="UNET numarası"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="uetdsTestMode"
                              checked={formData.uetdsTestMode || false}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">Test modu (geliştirme ortamı)</label>
                          </div>
                          
                          <button
                            onClick={() => {
                              // U-ETDS bağlantı testi
                              if (formData.uetdsUsername && formData.uetdsPassword) {
                                setMessage('U-ETDS bağlantısı test edildi');
                              } else {
                                setError('Kullanıcı adı ve şifre gerekli');
                              }
                            }}
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Bağlantıyı Test Et
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Google Maps */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🗺️</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Google Maps API</h4>
                          <p className="text-sm text-gray-600">Harita servisleri ve navigasyon</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.googleMapsApiKey ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.googleMapsApiKey ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Anahtarı</label>
                        <input
                          type="password"
                          name="googleMapsApiKey"
                          value={formData.googleMapsApiKey || ''}
                          onChange={handleInputChange}
                          placeholder="Google Maps API anahtarınızı girin"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          // Google Maps API testi
                          if (formData.googleMapsApiKey) {
                            setMessage('Google Maps API bağlantısı test edildi');
                          } else {
                            setError('API anahtarı gerekli');
                          }
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Bağlantıyı Test Et
                      </button>
                    </div>
                  </div>

                  {/* Yandex Maps */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🌍</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Yandex Maps</h4>
                          <p className="text-sm text-gray-600">Yandex harita servisleri</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.yandexMapsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.yandexMapsEnabled ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="yandexMapsEnabled"
                          checked={formData.yandexMapsEnabled || false}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Yandex Maps entegrasyonunu aktifleştir</label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Yandex Maps entegrasyonu için ek API anahtarı gerekmez.
                      </p>
                    </div>
                  </div>

                  {/* Payment Gateway Placeholder */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💳</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Ödeme Gateway'leri</h4>
                          <p className="text-sm text-gray-600">Ödeme entegrasyonları</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Yakında
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Ödeme gateway entegrasyonları yakında eklenecek</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Kullanıcı Sayısı</label>
                    <input
                      type="number"
                      name="maxUsers"
                      value={formData.maxUsers || 10}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Acente başına maksimum kullanıcı sayısı</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eş Zamanlı Oturum Limiti</label>
                    <input
                      type="number"
                      name="maxConcurrentSessions"
                      value={formData.maxConcurrentSessions || 5}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kullanıcı başına eş zamanlı oturum sayısı</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Şifre Uzunluğu</label>
                    <input
                      type="number"
                      name="passwordMinLength"
                      value={formData.passwordMinLength || 8}
                      onChange={handleInputChange}
                      min="6"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kullanıcı şifrelerinin minimum karakter sayısı</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şifre Geçerlilik Süresi (Gün)</label>
                    <input
                      type="number"
                      name="passwordExpiryDays"
                      value={formData.passwordExpiryDays || 90}
                      onChange={handleInputChange}
                      min="30"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Şifrelerin kaç günde bir yenilenmesi gerektiği</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reporting' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Raporlama & Analitik</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Veri Saklama Süresi (Gün)</label>
                    <input
                      type="number"
                      name="dataRetentionDays"
                      value={formData.dataRetentionDays || 365}
                      onChange={handleInputChange}
                      min="30"
                      max="1095"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rezervasyon verilerinin kaç gün saklanacağı</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Otomatik Arşivleme</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="autoArchiveEnabled"
                        checked={formData.autoArchiveEnabled || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Eski verileri otomatik arşivle</label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Belirtilen süre sonunda verileri arşivle</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Raporlarda Logo</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="reportLogoEnabled"
                        checked={formData.reportLogoEnabled || true}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Raporlarda şirket logosunu göster</label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PDF ve Excel raporlarında logo kullan</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Güvenlik & İzinler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Anahtar Geçerlilik Süresi (Gün)</label>
                    <input
                      type="number"
                      name="apiKeyExpiryDays"
                      value={formData.apiKeyExpiryDays || 30}
                      onChange={handleInputChange}
                      min="7"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">API anahtarlarının kaç günde bir yenilenmesi gerektiği</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Audit Log Saklama Süresi (Gün)</label>
                    <input
                      type="number"
                      name="auditLogRetentionDays"
                      value={formData.auditLogRetentionDays || 180}
                      onChange={handleInputChange}
                      min="30"
                      max="1095"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sistem loglarının kaç gün saklanacağı</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Veri Şifreleme Seviyesi</label>
                    <select
                      name="dataEncryptionLevel"
                      value={formData.dataEncryptionLevel || 'standard'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="basic">Temel</option>
                      <option value="standard">Standart</option>
                      <option value="high">Yüksek</option>
                      <option value="enterprise">Kurumsal</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Veri şifreleme güvenlik seviyesi</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
