'use client';

import { useState, useEffect } from 'react';
import { useEmoji } from '@/app/contexts/EmojiContext';

interface ModuleSettings {
  transfer: boolean;
  accommodation: boolean;
  flight: boolean;
}

export default function SettingsPage() {
  const { emojisEnabled, toggleEmojis } = useEmoji();
  const [isClient, setIsClient] = useState(false);
  const [modules, setModules] = useState<ModuleSettings>({
    transfer: true, // Transfer her zaman aktif
    accommodation: false,
    flight: false
  });
  const [loading, setLoading] = useState(false);

  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // LocalStorage'dan modül ayarlarını yükle
    const saved = localStorage.getItem('moduleSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModules(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Modül ayarları yüklenirken hata:', error);
      }
    }
  }, []);

  const toggleModule = async (moduleName: keyof ModuleSettings) => {
    if (moduleName === 'transfer') return; // Transfer modülü kapatılamaz
    
    setLoading(true);
    try {
      const newModules = {
        ...modules,
        [moduleName]: !modules[moduleName]
      };
      
      setModules(newModules);
      localStorage.setItem('moduleSettings', JSON.stringify(newModules));
      
      // Sayfayı yenile (modül değişikliklerini uygulamak için)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Modül durumu güncellenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleInfo = (moduleName: keyof ModuleSettings) => {
    const moduleInfo = {
      transfer: {
        name: 'Transfer Modülü',
        description: 'Temel transfer işlemleri (her zaman aktif)',
        icon: '🚗',
        color: 'green'
      },
      accommodation: {
        name: 'Konaklama Modülü',
        description: 'Otel rezervasyon ve fiyat havuzu',
        icon: '🏨',
        color: 'blue'
      },
      flight: {
        name: 'Uçuş Modülü',
        description: 'Uçuş rezervasyon ve takip',
        icon: '✈️',
        color: 'purple'
      }
    };
    
    return moduleInfo[moduleName];
  };

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

  return (
    <div className="min-h-screen bg-gray-50" id="settings-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {isClient && emojisEnabled ? '⚙️ ' : ''}Sistem Ayarları
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sistem genelinde ayarları yönetin
            </p>
          </div>
          
          <div className="p-6">
            {/* Emoji Toggle Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isClient && emojisEnabled ? '🎨 ' : ''}Görsel Ayarlar
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      emojisEnabled 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isClient && emojisEnabled ? '😊' : '😐'}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        emojisEnabled ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        Emoji Gösterimi
                      </h3>
                      <p className={`text-sm ${
                        emojisEnabled ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {emojisEnabled 
                          ? 'Emojiler aktif - Tüm arayüzde emojiler görünür' 
                          : 'Emojiler pasif - Sadece metin görünür'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleEmojis}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                      emojisEnabled 
                        ? 'bg-yellow-600' 
                        : 'bg-gray-200'
                    } cursor-pointer`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emojisEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {emojisEnabled && (
                  <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span>{isClient && emojisEnabled ? '✅' : '✓'}</span>
                      <span>Emojiler aktif - Arayüz daha renkli ve eğlenceli</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* User Management Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isClient && emojisEnabled ? '👥 ' : ''}Kullanıcı Yönetimi
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-100 text-blue-600">
                      {isClient && emojisEnabled ? '👥' : '👤'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Kullanıcılar</h3>
                      <p className="text-sm text-gray-600">
                        Sistem kullanıcılarını yönetin ve izinlerini düzenleyin
                      </p>
                    </div>
                  </div>
                  <a
                    href="/admin/users"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {isClient && emojisEnabled ? '⚙️ ' : ''}Kullanıcıları Yönet
                  </a>
                </div>
                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <span>{isClient && emojisEnabled ? 'ℹ️' : 'i'}</span>
                    <span>Kullanıcı ekleme, düzenleme ve izin yönetimi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Settings Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {isClient && emojisEnabled ? '📦 ' : ''}Modül Ayarları
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Hangi modüllerin aktif olacağını belirleyin
              </p>
            </div>
            
            <div className="space-y-6">
              {Object.keys(modules).map((moduleName) => {
                const module = moduleName as keyof ModuleSettings;
                const info = getModuleInfo(module);
                const isEnabled = modules[module];
                const isDisabled = module === 'transfer';
                
                return (
                  <div
                    key={module}
                    className={`border rounded-lg p-6 transition-all duration-200 ${
                      isEnabled 
                        ? `border-${info.color}-200 bg-${info.color}-50` 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                          isEnabled 
                            ? `bg-${info.color}-100 text-${info.color}-600` 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isClient && emojisEnabled ? info.icon : '📦'}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            isEnabled ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {info.name}
                          </h3>
                          <p className={`text-sm ${
                            isEnabled ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {info.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {isDisabled && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Zorunlu
                          </span>
                        )}
                        
                        <button
                          onClick={() => toggleModule(module)}
                          disabled={isDisabled || loading}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-${info.color}-500 focus:ring-offset-2 ${
                            isEnabled 
                              ? `bg-${info.color}-600` 
                              : 'bg-gray-200'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {isEnabled && (
                      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <span>{isClient && emojisEnabled ? '✅' : '✓'}</span>
                          <span>Modül aktif - Tüm özellikler kullanılabilir</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 text-lg">{isClient && emojisEnabled ? '💡' : 'ℹ️'}</div>
                <div>
                  <h4 className="font-medium text-blue-900">Modül Yönetimi</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Modül durumunu değiştirdikten sonra sayfa otomatik olarak yenilenecek. 
                    Deaktif edilen modüller menüde görünmeyecek ve erişilemeyecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}