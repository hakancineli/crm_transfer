import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı | ProTransfer',
  description: 'Aradığınız sayfa bulunamadı. İstanbul transfer hizmetlerimiz için ana sayfaya dönebilirsiniz.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sayfa Bulunamadı</h2>
          <p className="text-gray-600 mb-8">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        </div>
        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
          <Link 
            href="/customer-reservation" 
            className="inline-block w-full bg-white text-green-600 border border-green-200 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Transfer Rezervasyonu Yap
          </Link>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>Yardıma mı ihtiyacınız var?</p>
          <a 
            href="https://wa.me/905545812034" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-green-600 hover:underline"
          >
            WhatsApp'tan iletişime geçin
          </a>
        </div>
      </div>
    </div>
  );
}
