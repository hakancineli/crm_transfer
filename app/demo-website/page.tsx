'use client';

import { useState } from 'react';

export default function DemoWebsitePage() {
  const [domain, setDomain] = useState('demo-acente');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Demo Website</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain/Subdomain:
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="demo-acente"
            />
          </div>

          <div className="mb-6">
            <a 
              href={`/website/${domain}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Website'i Görüntüle →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Çalışan Özellikler</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Database schema</li>
                <li>• API endpoints</li>
                <li>• Website renderer</li>
                <li>• Domain routing</li>
                <li>• Error handling</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Test Edilecek</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Website oluşturma</li>
                <li>• Settings güncelleme</li>
                <li>• Domain binding</li>
                <li>• Content management</li>
                <li>• Multi-tenant isolation</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">📝 Not</h3>
            <p className="text-sm text-yellow-700">
              Bu demo sayfası, website modülünün temel fonksiyonlarını test etmek için oluşturulmuştur. 
              Gerçek kullanım için admin panelinden giriş yapmanız gerekmektedir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

