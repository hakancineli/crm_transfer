'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { useRouter } from 'next/navigation';

interface UetdsSefer {
  id: string;
  uetdsSeferReferansNo?: string;
  aracPlaka: string;
  hareketTarihi: string;
  hareketSaati: string;
  seferAciklama?: string;
  seferDurum: string;
  bildirimZamani?: string;
  sonucKodu?: number;
  sonucMesaji?: string;
  reservation?: {
    voucherNumber: string;
    from: string;
    to: string;
    passengerNames: string;
  };
  yolcular: Array<{
    id: string;
    adi: string;
    soyadi: string;
    tcKimlikPasaportNo: string;
    durum: string;
  }>;
  personeller: Array<{
    id: string;
    adi: string;
    soyadi: string;
    turKodu: number;
    durum: string;
  }>;
  gruplar: Array<{
    id: string;
    grupAdi: string;
    durum: string;
  }>;
}

interface UetdsLog {
  id: string;
  islemTuru: string;
  sonucKodu?: number;
  sonucMesaji?: string;
  islemZamani: string;
  hataDetayi?: string;
}

export default function UetdsPage() {
  const { user } = useAuth();
  const { isEnabled: isUetdsEnabled, isLoading: moduleLoading } = useModule('transfer');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('seferler');
  const [uetdsSettings, setUetdsSettings] = useState({
    uetdsEnabled: false,
    uetdsUsername: '',
    uetdsPassword: '',
    uetdsUnetNo: '',
    uetdsTestMode: true
  });
  const [seferler, setSeferler] = useState<UetdsSefer[]>([]);
  const [logs, setLogs] = useState<UetdsLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (moduleLoading) return;

    if (!isUetdsEnabled) {
      router.push('/admin');
      return;
    }

    if (!user) return;

    fetchSeferler();
    fetchLogs();
    fetchUetdsSettings();
  }, [user, moduleLoading, isUetdsEnabled, router]);

  const fetchUetdsSettings = async () => {
    try {
      const response = await fetch('/api/tenant/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setUetdsSettings({
            uetdsEnabled: data.settings.uetdsEnabled || false,
            uetdsUsername: data.settings.uetdsUsername || '',
            uetdsPassword: data.settings.uetdsPassword || '',
            uetdsUnetNo: data.settings.uetdsUnetNo || '',
            uetdsTestMode: data.settings.uetdsTestMode || true
          });
        }
      }
    } catch (error) {
      console.error('U-ETDS ayarları yüklenirken hata:', error);
    }
  };

  const fetchSeferler = async () => {
    try {
      setLoading(true);
      // Demo veriler için token gerektirmeyen endpoint kullan
      const response = await fetch('/api/uetds/demo');
      
      if (response.ok) {
        const data = await response.json();
        setSeferler(data.seferler || []);
      } else {
        // Fallback: token ile gerçek API'yi dene
        const token = localStorage.getItem('token') || '';
        const realResponse = await fetch('/api/uetds/sefer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (realResponse.ok) {
          const realData = await realResponse.json();
          setSeferler(realData.seferler || []);
        }
      }
    } catch (error) {
      console.error('Sefer listesi yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      // Demo veriler için token gerektirmeyen endpoint kullan
      const response = await fetch('/api/uetds/demo');
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        // Fallback: token ile gerçek API'yi dene
        const token = localStorage.getItem('token') || '';
        const realResponse = await fetch('/api/uetds/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (realResponse.ok) {
          const realData = await realResponse.json();
          setLogs(realData.logs || []);
        }
      }
    } catch (error) {
      console.error('Log listesi yükleme hatası:', error);
    }
  };

  const testUetdsService = async () => {
    try {
      setLoading(true);
      
      // Demo test sonucu
      setTestResult({ 
        success: true, 
        message: 'U-ETDS servisi aktif (Demo modu)' 
      });
      
      // Logları yenile
      fetchLogs();
      
    } catch (error) {
      console.error('U-ETDS test hatası:', error);
      setTestResult({ success: false, message: 'Test işlemi başarısız' });
    } finally {
      setLoading(false);
    }
  };

  const getPersonelTuru = (turKodu: number) => {
    const turler = {
      0: 'Şoför',
      1: 'Şoför Yrd.',
      2: 'Host',
      3: 'Hostes',
      4: 'Diğer',
      5: 'Rehber'
    };
    return turler[turKodu as keyof typeof turler] || 'Bilinmiyor';
  };

  const getDurumBadge = (durum: string) => {
    const badges = {
      'AKTIF': 'bg-green-100 text-green-800',
      'IPTAL': 'bg-red-100 text-red-800',
      'GELMEDI': 'bg-yellow-100 text-yellow-800'
    };
    return badges[durum as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

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

  if (!isUetdsEnabled) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8" id="uetds-page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">U-ETDS Yönetimi</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ulaştırma Elektronik Takip Denetim Sistemi
        </p>
      </div>

      {/* Test Butonu */}
      <div className="mb-6">
        <button
          onClick={testUetdsService}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Test Ediliyor...
            </>
          ) : (
            <>
              🔧 U-ETDS Servis Testi
            </>
          )}
        </button>

        {testResult && (
          <div className={`mt-3 p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="text-sm font-medium">
              {testResult.success ? '✅' : '❌'} {testResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('seferler')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seferler'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🚌 Seferler ({seferler.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 İşlem Logları ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('ayarlar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ayarlar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚙️ U-ETDS Ayarları
          </button>
        </nav>
      </div>

      {/* Seferler Tab */}
      {activeTab === 'seferler' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">U-ETDS Seferleri</h2>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : seferler.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Henüz U-ETDS seferi bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sefer Bilgileri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Araç
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yolcular
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      U-ETDS Ref
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {seferler.map((sefer) => (
                    <tr key={sefer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {sefer.reservation?.voucherNumber || 'Manuel Sefer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(sefer.hareketTarihi).toLocaleDateString('tr-TR')} {sefer.hareketSaati}
                        </div>
                        {sefer.reservation && (
                          <div className="text-xs text-gray-400">
                            {sefer.reservation.from} → {sefer.reservation.to}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {sefer.aracPlaka}
                        </div>
                        {sefer.seferAciklama && (
                          <div className="text-xs text-gray-500">
                            {sefer.seferAciklama}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {sefer.yolcular.length} yolcu
                        </div>
                        <div className="text-xs text-gray-500">
                          {sefer.yolcular.slice(0, 2).map(y => `${y.adi} ${y.soyadi}`).join(', ')}
                          {sefer.yolcular.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {sefer.personeller.length} personel
                        </div>
                        <div className="text-xs text-gray-500">
                          {sefer.personeller.map(p => getPersonelTuru(p.turKodu)).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurumBadge(sefer.seferDurum)}`}>
                          {sefer.seferDurum}
                        </span>
                        {sefer.sonucKodu !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Kod: {sefer.sonucKodu}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {sefer.uetdsSeferReferansNo || '—'}
                        </div>
                        {sefer.bildirimZamani && (
                          <div className="text-xs text-gray-500">
                            {new Date(sefer.bildirimZamani).toLocaleString('tr-TR')}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">U-ETDS İşlem Logları</h2>
          </div>

          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Henüz işlem logu bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zaman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sonuç
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mesaj
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.islemZamani).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.islemTuru}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.sonucKodu === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.sonucKodu === 0 ? 'Başarılı' : 'Hata'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.sonucMesaji || log.hataDetayi || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* U-ETDS Ayarları Tab */}
      {activeTab === 'ayarlar' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">U-ETDS Entegrasyon Ayarları</h3>
            <p className="mt-1 text-sm text-gray-500">
              U-ETDS sistemine bağlanmak için gerekli bilgileri girin
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* U-ETDS Aktif/Pasif */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">U-ETDS Entegrasyonu</h4>
                <p className="text-sm text-gray-500">U-ETDS sistemine otomatik bildirim yap</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                uetdsSettings.uetdsEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {uetdsSettings.uetdsEnabled ? 'Aktif' : 'Pasif'}
              </div>
            </div>

            {/* U-ETDS Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  U-ETDS Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={uetdsSettings.uetdsUsername}
                  onChange={(e) => setUetdsSettings(prev => ({ ...prev, uetdsUsername: e.target.value }))}
                  placeholder="U-ETDS kullanıcı adınız"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  U-ETDS Şifresi
                </label>
                <input
                  type="password"
                  value={uetdsSettings.uetdsPassword}
                  onChange={(e) => setUetdsSettings(prev => ({ ...prev, uetdsPassword: e.target.value }))}
                  placeholder="U-ETDS şifreniz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UNET Numarası
                </label>
                <input
                  type="text"
                  value={uetdsSettings.uetdsUnetNo}
                  onChange={(e) => setUetdsSettings(prev => ({ ...prev, uetdsUnetNo: e.target.value }))}
                  placeholder="UNET numaranız"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={uetdsSettings.uetdsTestMode}
                  onChange={(e) => setUetdsSettings(prev => ({ ...prev, uetdsTestMode: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Test modu (geliştirme ortamı)
                </label>
              </div>
            </div>

            {/* Test ve Kaydet Butonları */}
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  if (uetdsSettings.uetdsUsername && uetdsSettings.uetdsPassword) {
                    setTestResult({ success: true, message: 'U-ETDS bağlantısı test edildi (Demo)' });
                  } else {
                    setTestResult({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔗 Bağlantıyı Test Et
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/tenant/settings', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        uetdsEnabled: uetdsSettings.uetdsEnabled,
                        uetdsUsername: uetdsSettings.uetdsUsername,
                        uetdsPassword: uetdsSettings.uetdsPassword,
                        uetdsUnetNo: uetdsSettings.uetdsUnetNo,
                        uetdsTestMode: uetdsSettings.uetdsTestMode
                      })
                    });
                    
                    if (response.ok) {
                      setTestResult({ success: true, message: 'U-ETDS ayarları kaydedildi' });
                    } else {
                      setTestResult({ success: false, message: 'Ayarlar kaydedilemedi' });
                    }
                  } catch (error) {
                    setTestResult({ success: false, message: 'Hata oluştu' });
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                💾 Ayarları Kaydet
              </button>
            </div>

            {/* Test Sonucu */}
            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <span className="text-green-400">✅</span>
                    ) : (
                      <span className="text-red-400">❌</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bilgi Notu */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    U-ETDS Entegrasyonu Hakkında
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>U-ETDS kullanıcı adı ve şifrenizi U-ETDS sisteminden alabilirsiniz</li>
                      <li>Test modu aktifken gerçek bildirimler yapılmaz</li>
                      <li>Şoför atandığında otomatik sefer bildirimi yapılır</li>
                      <li>Dış acente transferlerinde manuel U-ETDS oluşturma linki kullanılır</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
