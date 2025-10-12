'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { ArrowLeft, Save, Plus, Edit, Trash2, Image, Car, MapPin, Building } from 'lucide-react';

export default function WebsiteContentPage() {
  const { user } = useAuth();
  const { isEnabled: websiteEnabled, isLoading } = useModule('website');
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  // Load content and tenant info on component mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Load tenant info
        const tenantResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          setTenantInfo(tenantData);
        }

        // Load content
        const response = await fetch('/api/website/content', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setContent(JSON.parse(data.content));
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();
  }, []);

  // Website content state
  const [content, setContent] = useState({
    hero: {
      title: "Şeref Vural Travel",
      subtitle: "İstanbul Havalimanı Transfer Hizmeti",
      description: "İstanbul Havalimanı'ndan şehir merkezine konforlu ve güvenli transfer hizmeti. Profesyonel şoförlerimiz ve Mercedes Vito araçlarımızla 7/24 hizmetinizdeyiz.",
      whatsapp: "+905319458931",
      phone: "+905319458931",
      email: "info@serefvuraltravel.com",
      metaTitle: "",
      metaDescription: "",
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
      logoUrl: "",
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    },
    vehicles: [
      {
        id: 1,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-1.jpg"
      },
      {
        id: 2,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-2.jpg"
      },
      {
        id: 3,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-3.jpg"
      },
      {
        id: 4,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-4.jpg"
      },
      {
        id: 5,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-5.jpg"
      },
      {
        id: 6,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-6.jpg"
      },
      {
        id: 7,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-7.jpg"
      },
      {
        id: 8,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-8.jpg"
      },
      {
        id: 9,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-9.jpg"
      },
      {
        id: 10,
        name: "Mercedes Vito",
        capacity: "7 kişilik kapasite",
        features: "Klima • WiFi • Profesyonel şoför",
        image: "/vehicles/vito-10.jpg"
      }
    ],
    tours: [
      {
        id: 1,
        name: "İstanbul Tarihi Yarımada Turu",
        description: "İstanbul'un en önemli tarihi mekanlarını keşfedin. Ayasofya, Sultanahmet Camii, Topkapı Sarayı ve daha fazlası.",
        duration: "8 saat",
        capacity: "7 kişilik kapasite",
        rating: 4.8,
        image: "/seref-vural-tours/istanbul/1.svg",
        prices: {
          TRY: 4500,
          USD: 150,
          EUR: 140
        },
        showPrice: true
      },
      {
        id: 2,
        name: "Sapanca Doğa Turu",
        description: "Sapanca Gölü çevresinde doğa yürüyüşü ve piknik. Temiz hava ve muhteşem manzara.",
        duration: "6 saat",
        capacity: "7 kişilik kapasite",
        rating: 4.6,
        image: "/seref-vural-tours/sapanca/1.svg",
        prices: {
          TRY: 3600,
          USD: 120,
          EUR: 110
        },
        showPrice: true
      },
      {
        id: 3,
        name: "Bursa Tarihi ve Kültürel Tur",
        description: "Osmanlı İmparatorluğu'nun ilk başkenti Bursa'yı keşfedin. Ulu Camii, Yeşil Türbe ve daha fazlası.",
        duration: "10 saat",
        capacity: "7 kişilik kapasite",
        rating: 4.7,
        image: "/seref-vural-tours/bursa/1.svg",
        prices: {
          TRY: 5400,
          USD: 180,
          EUR: 165
        },
        showPrice: true
      },
      {
        id: 4,
        name: "Abant Gölü Doğa Turu",
        description: "Abant Gölü'nde doğa yürüyüşü ve fotoğraf çekimi. Muhteşem doğa manzaraları.",
        duration: "7 saat",
        capacity: "7 kişilik kapasite",
        rating: 4.5,
        image: "/seref-vural-tours/abant/1.svg",
        prices: {
          TRY: 4200,
          USD: 140,
          EUR: 130
        },
        showPrice: true
      }
    ],
    hotels: [
      {
        id: 1,
        name: "Grand Hotel İstanbul",
        location: "Sultanahmet, İstanbul",
        description: "Sultanahmet'te lüks konaklama. Tarihi yarımadaya yürüme mesafesi.",
        rating: 4.9,
        features: ["WiFi", "Klima", "Oda Servisi", "Spa", "Fitness"],
        image: "/seref-vural-images/hotels/sultanahmet-palace.svg",
        prices: {
          TRY: 6000,
          USD: 200,
          EUR: 185
        },
        showPrice: true
      },
      {
        id: 2,
        name: "Sapanca Resort Hotel",
        location: "Sapanca, Sakarya",
        description: "Sapanca Gölü manzaralı doğa oteli. Huzurlu ve sakin bir tatil.",
        rating: 4.6,
        features: ["WiFi", "Klima", "Havuz", "Restoran", "Park Alanı"],
        image: "/seref-vural-images/hotels/modern-istanbul.svg",
        prices: {
          TRY: 4500,
          USD: 150,
          EUR: 140
        },
        showPrice: true
      }
    ],
    features: [
      {
        id: 1,
        title: "7/24 Hizmet",
        description: "Her zaman yanınızdayız",
        icon: "clock"
      },
      {
        id: 2,
        title: "Sabit Fiyat",
        description: "Sürpriz yok",
        icon: "dollar"
      },
      {
        id: 3,
        title: "Profesyonel Şoför",
        description: "Deneyimli kadro",
        icon: "user"
      }
    ]
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!websiteEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Website Modülü Kapalı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Website modülünü kullanmak için lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call to save content
      const response = await fetch('/api/website/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setSaveMessage('İçerik başarıyla kaydedildi!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Kaydetme sırasında hata oluştu');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      setSaveMessage('Kaydetme sırasında hata oluştu');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'hero', name: 'Ana Sayfa', icon: Image },
    { id: 'vehicles', name: 'Araçlar', icon: Car },
    { id: 'tours', name: 'Turlar', icon: MapPin },
    { id: 'hotels', name: 'Oteller', icon: Building },
    { id: 'features', name: 'Özellikler', icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <a
              href="/admin/website"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Geri Dön
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">İçerik Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Website içeriklerinizi düzenleyin ve yönetin
          </p>
          {tenantInfo && (
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {tenantInfo.tenant?.companyName || 'Acente'}
              </span>
              <span className="text-gray-500">
                Domain: {tenantInfo.tenant?.subdomain || 'demo'}.localhost:3000
              </span>
            </div>
          )}
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes('başarıyla') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Forms */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'hero' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Ana Sayfa İçeriği</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="hero-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı
                  </label>
                  <input
                    id="hero-title"
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    placeholder="Şirket adı"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="hero-subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Başlık
                  </label>
                  <input
                    id="hero-subtitle"
                    type="text"
                    value={content.hero.subtitle}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    placeholder="Alt başlık"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="hero-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    id="hero-description"
                    rows={4}
                    value={content.hero.description}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, description: e.target.value }
                    }))}
                    placeholder="Kısa açıklama"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="hero-whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    id="hero-whatsapp"
                    type="text"
                    value={content.hero.whatsapp}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, whatsapp: e.target.value }
                    }))}
                    placeholder="+90..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="hero-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    id="hero-phone"
                    type="text"
                    value={content.hero.phone}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, phone: e.target.value }
                    }))}
                    placeholder="+90..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="hero-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="hero-email"
                    type="email"
                    value={content.hero.email}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="info@sirketiniz.com"
                  />
                </div>
              </div>

              {/* SEO Ayarları */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Başlık
                    </label>
                    <input
                      type="text"
                      value={content.hero.metaTitle || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, metaTitle: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="SEO için başlık (60 karakter)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {content.hero.metaTitle?.length || 0}/60 karakter
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Açıklama
                    </label>
                    <textarea
                      rows={3}
                      value={content.hero.metaDescription || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, metaDescription: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="SEO için açıklama (160 karakter)"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {content.hero.metaDescription?.length || 0}/160 karakter
                    </p>
                  </div>
                </div>
              </div>

              {/* Tasarım Ayarları */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tasarım Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ana Renk
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.hero.primaryColor || '#16a34a'}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, primaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={content.hero.primaryColor || '#16a34a'}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, primaryColor: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="#16a34a"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İkincil Renk
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={content.hero.secondaryColor || '#6b7280'}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, secondaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={content.hero.secondaryColor || '#6b7280'}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          hero: { ...prev.hero, secondaryColor: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="#6b7280"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={content.hero.logoUrl || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, logoUrl: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>

              {/* Sosyal Medya */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sosyal Medya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={content.hero.facebook || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, facebook: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://facebook.com/sirketiniz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={content.hero.instagram || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, instagram: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://instagram.com/sirketiniz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={content.hero.twitter || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, twitter: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://twitter.com/sirketiniz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={content.hero.youtube || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, youtube: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://youtube.com/@sirketiniz"
                    />
                  </div>
                </div>
              </div>

              {/* Önizleme */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Önizleme</h3>
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4" style={{ color: content.hero.primaryColor || '#16a34a' }}>
                        {content.hero.title || 'Şirket Adı'}
                      </h1>
                      <h2 className="text-2xl text-gray-600 mb-4">
                        {content.hero.subtitle || 'Alt Başlık'}
                      </h2>
                      <p className="text-lg text-gray-600 mb-6">
                        {content.hero.description || 'Açıklama metni burada görünecek...'}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button 
                          className="px-6 py-3 rounded-lg text-white font-semibold"
                          style={{ backgroundColor: content.hero.primaryColor || '#16a34a' }}
                        >
                          Rezervasyon Yap
                        </button>
                        <button 
                          className="px-6 py-3 border-2 rounded-lg font-semibold"
                          style={{ 
                            borderColor: content.hero.primaryColor || '#16a34a',
                            color: content.hero.primaryColor || '#16a34a'
                          }}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Araçlar</h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Araç
                </button>
              </div>
              <div className="space-y-6">
                {content.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sol Kolon - Temel Bilgiler */}
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`vehicle-name-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                            Araç Adı
                          </label>
                          <input
                            id={`vehicle-name-${vehicle.id}`}
                            type="text"
                            value={vehicle.name}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              vehicles: prev.vehicles.map(v => 
                                v.id === vehicle.id ? { ...v, name: e.target.value } : v
                              )
                            }))}
                            placeholder="Araç adı"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`vehicle-capacity-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                            Kapasite
                          </label>
                          <input
                            id={`vehicle-capacity-${vehicle.id}`}
                            type="text"
                            value={vehicle.capacity}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              vehicles: prev.vehicles.map(v => 
                                v.id === vehicle.id ? { ...v, capacity: e.target.value } : v
                              )
                            }))}
                            placeholder="7 kişilik"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`vehicle-features-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                            Özellikler
                          </label>
                          <input
                            id={`vehicle-features-${vehicle.id}`}
                            type="text"
                            value={vehicle.features}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              vehicles: prev.vehicles.map(v => 
                                v.id === vehicle.id ? { ...v, features: e.target.value } : v
                              )
                            }))}
                            placeholder="Klima, WiFi, ..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Sağ Kolon - Fotoğraf */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Araç Fotoğrafı
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {vehicle.image ? (
                                <img 
                                  src={vehicle.image} 
                                  alt={vehicle.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageUrl = event.target?.result as string;
                                      setContent(prev => ({
                                        ...prev,
                                        vehicles: prev.vehicles.map(v => 
                                          v.id === vehicle.id ? { ...v, image: imageUrl } : v
                                        )
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id={`vehicle-image-${vehicle.id}`}
                              />
                              <label
                                htmlFor={`vehicle-image-${vehicle.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer inline-flex items-center"
                              >
                                <Image className="h-4 w-4 mr-2" />
                                Fotoğraf Seç
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alt Butonlar */}
                    <div className="mt-6 flex justify-end space-x-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Turlar</h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Tur
                </button>
              </div>
              <div className="space-y-6">
                {content.tours.map((tour) => (
                  <div key={tour.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sol Kolon - Temel Bilgiler */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tur Adı
                          </label>
                          <input
                            type="text"
                            value={tour.name}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              tours: prev.tours.map(t => 
                                t.id === tour.id ? { ...t, name: e.target.value } : t
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Süre
                          </label>
                          <input
                            type="text"
                            value={tour.duration}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              tours: prev.tours.map(t => 
                                t.id === tour.id ? { ...t, duration: e.target.value } : t
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kapasite
                          </label>
                          <input
                            type="text"
                            value={tour.capacity}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              tours: prev.tours.map(t => 
                                t.id === tour.id ? { ...t, capacity: e.target.value } : t
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama
                          </label>
                          <textarea
                            rows={4}
                            value={tour.description}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              tours: prev.tours.map(t => 
                                t.id === tour.id ? { ...t, description: e.target.value } : t
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Sağ Kolon - Fotoğraf ve Fiyat */}
                      <div className="space-y-4">
                        {/* Fotoğraf Yükleme */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tur Fotoğrafı
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {tour.image ? (
                                <img 
                                  src={tour.image} 
                                  alt={tour.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageUrl = event.target?.result as string;
                                      setContent(prev => ({
                                        ...prev,
                                        tours: prev.tours.map(t => 
                                          t.id === tour.id ? { ...t, image: imageUrl } : t
                                        )
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id={`tour-image-${tour.id}`}
                              />
                              <label
                                htmlFor={`tour-image-${tour.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer inline-flex items-center"
                              >
                                <Image className="h-4 w-4 mr-2" />
                                Fotoğraf Seç
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Fiyat Yönetimi */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Fiyatlar
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={tour.showPrice}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  tours: prev.tours.map(t => 
                                    t.id === tour.id ? { ...t, showPrice: e.target.checked } : t
                                  )
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label className="text-sm text-gray-700">
                                Fiyatı Göster
                              </label>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">TRY</label>
                              <input
                                type="number"
                                value={tour.prices?.TRY || ''}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  tours: prev.tours.map(t => 
                                    t.id === tour.id ? { 
                                      ...t, 
                                      prices: { ...t.prices, TRY: parseFloat(e.target.value) || 0 }
                                    } : t
                                  )
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">USD</label>
                              <input
                                type="number"
                                value={tour.prices?.USD || ''}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  tours: prev.tours.map(t => 
                                    t.id === tour.id ? { 
                                      ...t, 
                                      prices: { ...t.prices, USD: parseFloat(e.target.value) || 0 }
                                    } : t
                                  )
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">EUR</label>
                              <input
                                type="number"
                                value={tour.prices?.EUR || ''}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  tours: prev.tours.map(t => 
                                    t.id === tour.id ? { 
                                      ...t, 
                                      prices: { ...t.prices, EUR: parseFloat(e.target.value) || 0 }
                                    } : t
                                  )
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fiyat Önizleme */}
                        {tour.showPrice && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Fiyat Önizleme:</p>
                            <div className="flex space-x-4 text-sm">
                              {tour.prices?.TRY > 0 && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                  {tour.prices.TRY} TRY
                                </span>
                              )}
                              {tour.prices?.USD > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                  ${tour.prices.USD} USD
                                </span>
                              )}
                              {tour.prices?.EUR > 0 && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  €{tour.prices.EUR} EUR
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alt Butonlar */}
                    <div className="mt-6 flex justify-end space-x-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Oteller</h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Otel
                </button>
              </div>
              <div className="space-y-6">
                {content.hotels.map((hotel) => (
                  <div key={hotel.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sol Kolon - Temel Bilgiler */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Otel Adı
                          </label>
                          <input
                            type="text"
                            value={hotel.name}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              hotels: prev.hotels.map(h => 
                                h.id === hotel.id ? { ...h, name: e.target.value } : h
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Konum
                          </label>
                          <input
                            type="text"
                            value={hotel.location}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              hotels: prev.hotels.map(h => 
                                h.id === hotel.id ? { ...h, location: e.target.value } : h
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Puan
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={hotel.rating}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              hotels: prev.hotels.map(h => 
                                h.id === hotel.id ? { ...h, rating: parseFloat(e.target.value) || 0 } : h
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama
                          </label>
                          <textarea
                            rows={4}
                            value={hotel.description}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              hotels: prev.hotels.map(h => 
                                h.id === hotel.id ? { ...h, description: e.target.value } : h
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Özellikler (virgülle ayırın)
                          </label>
                          <input
                            type="text"
                            value={hotel.features.join(', ')}
                            onChange={(e) => setContent(prev => ({
                              ...prev,
                              hotels: prev.hotels.map(h => 
                                h.id === hotel.id ? { 
                                  ...h, 
                                  features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                } : h
                              )
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="WiFi, Klima, Oda Servisi, Spa, Fitness"
                          />
                        </div>
                      </div>

                      {/* Sağ Kolon - Fotoğraf ve Fiyat */}
                      <div className="space-y-4">
                        {/* Fotoğraf Yükleme */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Otel Fotoğrafı
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {hotel.image ? (
                                <img 
                                  src={hotel.image} 
                                  alt={hotel.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const imageUrl = event.target?.result as string;
                                      setContent(prev => ({
                                        ...prev,
                                        hotels: prev.hotels.map(h => 
                                          h.id === hotel.id ? { ...h, image: imageUrl } : h
                                        )
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id={`hotel-image-${hotel.id}`}
                              />
                              <label
                                htmlFor={`hotel-image-${hotel.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer inline-flex items-center"
                              >
                                <Image className="h-4 w-4 mr-2" />
                                Fotoğraf Seç
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Fiyat Yönetimi */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Fiyatlar (Gece başına)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={hotel.showPrice}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  hotels: prev.hotels.map(h => 
                                    h.id === hotel.id ? { ...h, showPrice: e.target.checked } : h
                                  )
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label className="text-sm text-gray-700">
                                Fiyatı Göster
                              </label>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">TRY</label>
                              <input
                                type="number"
                                value={hotel.prices?.TRY || ''}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  hotels: prev.hotels.map(h => 
                                    h.id === hotel.id ? { 
                                      ...h, 
                                      prices: { ...h.prices, TRY: parseFloat(e.target.value) || 0 }
                                    } : h
                                  )
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">USD</label>
                              <input
                                type="number"
                                value={hotel.prices?.USD || ''}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  hotels: prev.hotels.map(h => 
                                    h.id === hotel.id ? { 
                                      ...h, 
                                      prices: { ...h.prices, USD: parseFloat(e.target.value) || 0 }
                                    } : h
                                  )
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">EUR</label>
                              <input
                                type="number"
                                value={hotel.prices?.EUR || ''}
                                onChange={(e) => setContent(prev => ({
                                  ...prev,
                                  hotels: prev.hotels.map(h => 
                                    h.id === hotel.id ? { 
                                      ...h, 
                                      prices: { ...h.prices, EUR: parseFloat(e.target.value) || 0 }
                                    } : h
                                  )
                                }))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fiyat Önizleme */}
                        {hotel.showPrice && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Fiyat Önizleme (Gece başına):</p>
                            <div className="flex space-x-4 text-sm">
                              {hotel.prices?.TRY > 0 && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                  {hotel.prices.TRY} TRY
                                </span>
                              )}
                              {hotel.prices?.USD > 0 && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                  ${hotel.prices.USD} USD
                                </span>
                              )}
                              {hotel.prices?.EUR > 0 && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  €{hotel.prices.EUR} EUR
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Özellikler Önizleme */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Özellikler:</p>
                          <div className="flex flex-wrap gap-2">
                            {hotel.features.map((feature, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alt Butonlar */}
                    <div className="mt-6 flex justify-end space-x-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Özellikler</h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Özellik
                </button>
              </div>
              <div className="space-y-4">
                {content.features.map((feature) => (
                  <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlık
                        </label>
                        <input
                          type="text"
                          value={feature.title}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <input
                          type="text"
                          value={feature.description}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
