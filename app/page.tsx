'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Domain'e göre farklı yönlendirme
    const hostname = window.location.hostname;
    
    let redirectPath = '/admin-login'; // Default
    
    if (hostname.includes('proacente.com')) {
      // ProAcente domain - CRM sistemi
      redirectPath = '/admin-login';
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
          <p className="text-xl opacity-90">Acente Yönetim Sistemi</p>
          <p className="text-sm opacity-75 mt-2">proacente.com</p>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span>Yönlendiriliyor...</span>
          </div>
        )}
        
        <div className="mt-8 text-sm opacity-75">
          <p>Admin giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
        
        <div className="mt-6 text-xs opacity-60">
          <p>ProTransfer: <a href="https://www.protransfer.com.tr" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">protransfer.com.tr</a></p>
        </div>
      </div>
    </main>
  );
}
