'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from './contexts/LanguageContext';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Domain'e göre farklı yönlendirme
    const hostname = window.location.hostname;
    
    let redirectPath = '/admin-login'; // Varsayılan: CRM girişi

    if (hostname.includes('proacente.com')) {
      // ProAcente domain - CRM
      redirectPath = '/admin-login';
    } else if (hostname.includes('protransfer.com.tr')) {
      // ProTransfer domain - müşteri web sitesi (Şeref Vural teması)
      redirectPath = '/website/demo';
    }
    
    const timer = setTimeout(() => {
      router.push(redirectPath);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">ProAcente</h1>
          <p className="text-xl opacity-90">{t('header.title') || 'Acente Yönetim Sistemi'}</p>
          <p className="text-sm opacity-75 mt-2">proacente.com</p>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span>{t('common.loading') || 'Yönlendiriliyor...'}</span>
          </div>
        )}
        
        <div className="mt-8 text-sm opacity-75">
          <p>{language === 'tr' ? 'Admin giriş sayfasına yönlendiriliyorsunuz...' : t('admin.navigation.allReservations') || 'Redirecting to admin login...'}</p>
        </div>
        
        <div className="mt-6 text-xs opacity-60">
          <p>ProTransfer: <a href="https://www.protransfer.com.tr" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">protransfer.com.tr</a></p>
        </div>
      </div>
    </main>
  );
}
