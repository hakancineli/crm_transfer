'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { ArrowLeft, Save, Plus, Edit, Trash2, FileText, Globe } from 'lucide-react';

interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export default function WebsitePagesPage() {
  const { user } = useAuth();
  const { isEnabled: websiteEnabled, isLoading } = useModule('website');
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WebsitePage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const defaultPages = [
    {
      id: '1',
      title: 'Ana Sayfa',
      slug: 'home',
      content: 'Ana sayfa içeriği burada yer alacak...',
      isActive: true,
      metaTitle: 'Şeref Vural Travel - İstanbul Transfer Hizmeti',
      metaDescription: 'İstanbul Havalimanı transfer hizmeti, profesyonel şoförler ve konforlu araçlar.'
    },
    {
      id: '2',
      title: 'Hakkımızda',
      slug: 'about',
      content: 'Hakkımızda sayfası içeriği burada yer alacak...',
      isActive: true,
      metaTitle: 'Hakkımızda - Şeref Vural Travel',
      metaDescription: 'Şeref Vural Travel hakkında bilgi alın.'
    },
    {
      id: '3',
      title: 'İletişim',
      slug: 'contact',
      content: 'İletişim sayfası içeriği burada yer alacak...',
      isActive: true,
      metaTitle: 'İletişim - Şeref Vural Travel',
      metaDescription: 'Bizimle iletişime geçin.'
    }
  ];

  useEffect(() => {
    if (websiteEnabled) {
      setPages(defaultPages);
    }
  }, [websiteEnabled]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call to save pages
      const response = await fetch('/api/website/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pages }),
      });

      if (response.ok) {
        setSaveMessage('Sayfalar başarıyla kaydedildi!');
        setTimeout(() => setSaveMessage(''), 3000);
        setIsEditing(false);
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

  const handleEditPage = (page: WebsitePage) => {
    setSelectedPage(page);
    setIsEditing(true);
  };

  const handleUpdatePage = (updatedPage: WebsitePage) => {
    setPages(prev => prev.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    ));
    setSelectedPage(updatedPage);
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      if (selectedPage?.id === pageId) {
        setSelectedPage(null);
        setIsEditing(false);
      }
    }
  };

  const handleAddPage = () => {
    const newPage: WebsitePage = {
      id: Date.now().toString(),
      title: 'Yeni Sayfa',
      slug: 'new-page',
      content: 'Yeni sayfa içeriği...',
      isActive: true,
      metaTitle: '',
      metaDescription: ''
    };
    setPages(prev => [...prev, newPage]);
    setSelectedPage(newPage);
    setIsEditing(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Sayfa Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Website sayfalarınızı düzenleyin ve yönetin
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Sayfalar</h2>
                <button
                  onClick={handleAddPage}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Yeni Sayfa
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedPage?.id === page.id ? 'bg-green-50 border-r-4 border-green-500' : ''
                    }`}
                    onClick={() => setSelectedPage(page)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{page.title}</h3>
                          <p className="text-xs text-gray-500">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          page.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPage(page);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {selectedPage ? (
                <>
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {isEditing ? 'Sayfa Düzenle' : 'Sayfa Önizleme'}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/website/demo/${selectedPage.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Önizle
                      </a>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sayfa Başlığı
                            </label>
                            <input
                              type="text"
                              value={selectedPage.title}
                              onChange={(e) => handleUpdatePage({
                                ...selectedPage,
                                title: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL Slug
                            </label>
                            <input
                              type="text"
                              value={selectedPage.slug}
                              onChange={(e) => handleUpdatePage({
                                ...selectedPage,
                                slug: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Başlık (SEO)
                          </label>
                          <input
                            type="text"
                            value={selectedPage.metaTitle || ''}
                            onChange={(e) => handleUpdatePage({
                              ...selectedPage,
                              metaTitle: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Açıklama (SEO)
                          </label>
                          <textarea
                            rows={2}
                            value={selectedPage.metaDescription || ''}
                            onChange={(e) => handleUpdatePage({
                              ...selectedPage,
                              metaDescription: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sayfa İçeriği
                          </label>
                          <textarea
                            rows={10}
                            value={selectedPage.content}
                            onChange={(e) => handleUpdatePage({
                              ...selectedPage,
                              content: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Sayfa içeriğinizi buraya yazın..."
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={selectedPage.isActive}
                            onChange={(e) => handleUpdatePage({
                              ...selectedPage,
                              isActive: e.target.checked
                            })}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                            Sayfa aktif
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedPage.title}</h3>
                          <p className="text-sm text-gray-500">/{selectedPage.slug}</p>
                        </div>
                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700">
                            {selectedPage.content}
                          </div>
                        </div>
                        {selectedPage.metaTitle && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">SEO Bilgileri</h4>
                            <p className="text-sm text-gray-600">
                              <strong>Meta Başlık:</strong> {selectedPage.metaTitle}
                            </p>
                            {selectedPage.metaDescription && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Meta Açıklama:</strong> {selectedPage.metaDescription}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sayfa seçin</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Düzenlemek için sol taraftan bir sayfa seçin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-8 flex justify-end">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
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
        )}
      </div>
    </div>
  );
}
