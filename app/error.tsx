'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-300 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-8">
            Üzgünüz, bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Tekrar Dene
          </button>
          
          <Link 
            href="/"
            className="inline-block w-full bg-white text-green-600 border border-green-200 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Sorun devam ediyor mu?</p>
          <a 
            href="https://wa.me/905545812034"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            WhatsApp'tan destek alın
          </a>
        </div>
      </div>
    </div>
  );
}
