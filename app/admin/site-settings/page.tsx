'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface WebsiteSettings {
  id: string;
  companyName: string;
  logo?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  seoSettings: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customCSS?: string;
  analyticsCode?: string;
}

export default function SiteSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchWebsiteSettings();
  }, []);

  const fetchWebsiteSettings = async () => {
    try {
      // Token'ı localStorage'dan al
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch websites');
      }
      
      const websites = await response.json();
      
      if (Array.isArray(websites) && websites.length > 0) {
        const websiteId = websites[0].id;
        const settingsResponse = await fetch(`/api/websites/${websiteId}/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }
      }
    } catch (error) {
      console.error('Error fetching website settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const websitesResponse = await fetch('/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!websitesResponse.ok) {
        throw new Error('Failed to fetch websites');
      }
      
      const websites = await websitesResponse.json();
      const websiteId = websites[0].id;
      
      const response = await fetch(`/api/websites/${websiteId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Ayarlar başarıyla kaydedildi!');
      } else {
        alert('Ayarlar kaydedilirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: string, value: any) => {
    if (!settings) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...(settings[parent as keyof WebsiteSettings] as any || {}),
          [child]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Website ayarları bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
            <p className="text-gray-600 mt-1">Website içeriklerinizi ve ayarlarınızı yönetin</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'general', name: 'Genel', icon: '⚙️' },
                { id: 'homepage', name: 'Anasayfa', icon: '🏠' },
                { id: 'contact', name: 'İletişim', icon: '📞' },
                { id: 'social', name: 'Sosyal Medya', icon: '📱' },
                { id: 'seo', name: 'SEO', icon: '🔍' },
                { id: 'design', name: 'Tasarım', icon: '🎨' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => updateSettings('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={settings.logo || ''}
                    onChange={(e) => updateSettings('logo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analytics Kodu
                  </label>
                  <textarea
                    value={settings.analyticsCode || ''}
                    onChange={(e) => updateSettings('analyticsCode', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Google Analytics veya diğer tracking kodları"
                  />
                </div>
              </div>
            )}

            {activeTab === 'homepage' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Başlık
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => updateSettings('heroTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Başlık
                  </label>
                  <textarea
                    value={settings.heroSubtitle}
                    onChange={(e) => updateSettings('heroSubtitle', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Görsel URL
                  </label>
                  <input
                    type="url"
                    value={settings.heroImage || ''}
                    onChange={(e) => updateSettings('heroImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/hero-image.jpg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={settings.contactInfo.phone}
                    onChange={(e) => updateSettings('contactInfo.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => updateSettings('contactInfo.email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={settings.contactInfo.address}
                    onChange={(e) => updateSettings('contactInfo.address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={settings.contactInfo.whatsapp}
                    onChange={(e) => updateSettings('contactInfo.whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+90 555 123 45 67"
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.facebook}
                    onChange={(e) => updateSettings('socialMedia.facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.instagram}
                    onChange={(e) => updateSettings('socialMedia.instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.twitter}
                    onChange={(e) => updateSettings('socialMedia.twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={settings.socialMedia.linkedin}
                    onChange={(e) => updateSettings('socialMedia.linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Başlığı
                  </label>
                  <input
                    type="text"
                    value={settings.seoSettings.title}
                    onChange={(e) => updateSettings('seoSettings.title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Açıklaması
                  </label>
                  <textarea
                    value={settings.seoSettings.description}
                    onChange={(e) => updateSettings('seoSettings.description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anahtar Kelimeler
                  </label>
                  <input
                    type="text"
                    value={settings.seoSettings.keywords}
                    onChange={(e) => updateSettings('seoSettings.keywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="transfer, seyahat, rezervasyon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Görseli
                  </label>
                  <input
                    type="url"
                    value={settings.seoSettings.ogImage}
                    onChange={(e) => updateSettings('seoSettings.ogImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Renk
                  </label>
                  <input
                    type="color"
                    value={settings.colorScheme.primary}
                    onChange={(e) => updateSettings('colorScheme.primary', e.target.value)}
                    className="w-20 h-10 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={settings.colorScheme.primary}
                    onChange={(e) => updateSettings('colorScheme.primary', e.target.value)}
                    className="ml-2 w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İkincil Renk
                  </label>
                  <input
                    type="color"
                    value={settings.colorScheme.secondary}
                    onChange={(e) => updateSettings('colorScheme.secondary', e.target.value)}
                    className="w-20 h-10 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={settings.colorScheme.secondary}
                    onChange={(e) => updateSettings('colorScheme.secondary', e.target.value)}
                    className="ml-2 w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vurgu Rengi
                  </label>
                  <input
                    type="color"
                    value={settings.colorScheme.accent}
                    onChange={(e) => updateSettings('colorScheme.accent', e.target.value)}
                    className="w-20 h-10 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={settings.colorScheme.accent}
                    onChange={(e) => updateSettings('colorScheme.accent', e.target.value)}
                    className="ml-2 w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel CSS
                  </label>
                  <textarea
                    value={settings.customCSS || ''}
                    onChange={(e) => updateSettings('customCSS', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="/* Özel CSS kodlarınızı buraya yazın */"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
