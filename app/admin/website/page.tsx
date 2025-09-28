'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { Settings, Globe, Image, FileText, MessageSquare } from 'lucide-react';

export default function WebsiteAdminPage() {
  const { user } = useAuth();
  const { isEnabled: websiteEnabled, isLoading } = useModule('website');

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
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Website Modülü Kapalı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Website modülünü kullanmak için lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  const websiteFeatures = [
    {
      id: 'settings',
      name: 'Website Ayarları',
      description: 'Site başlığı, açıklama, logo ve temel ayarları yönetin',
      icon: Settings,
      href: '/admin/website/settings',
      color: 'bg-blue-500'
    },
    {
      id: 'pages',
      name: 'Sayfa Yönetimi',
      description: 'Ana sayfa, hakkımızda, iletişim sayfalarını düzenleyin',
      icon: FileText,
      href: '/admin/website/pages',
      color: 'bg-green-500'
    },
    {
      id: 'content',
      name: 'İçerik Yönetimi',
      description: 'Turlar, oteller, araçlar ve diğer içerikleri yönetin',
      icon: Image,
      href: '/admin/website/content',
      color: 'bg-purple-500'
    },
    {
      id: 'reservations',
      name: 'Rezervasyonlar',
      description: 'Website üzerinden gelen rezervasyon taleplerini görüntüleyin',
      icon: MessageSquare,
      href: '/admin/website/reservations',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Website Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Website modülünüzü yönetin ve içeriklerinizi düzenleyin
          </p>
        </div>

        {/* Website Preview */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Website Önizleme</h2>
              <p className="text-gray-600">Müşterilerinizin gördüğü website</p>
            </div>
            <a
              href={`/website/demo`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Website'yi Görüntüle
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {websiteFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <a
                key={feature.id}
                href={feature.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`${feature.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </a>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Website Durumu</p>
                <p className="text-2xl font-bold text-green-600">Aktif</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rezervasyon Talepleri</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Sayfalar</p>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
