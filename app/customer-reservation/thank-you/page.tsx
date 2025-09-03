'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThankYouPage() {
  const [voucher, setVoucher] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const v = new URLSearchParams(window.location.search).get('voucher') || '';
      setVoucher(v);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-green-700 mb-2">Teşekkürler!</h1>
        <p className="text-gray-700 mb-4">Rezervasyon talebiniz başarıyla alındı.</p>
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="text-sm text-gray-600">Voucher numaranız</div>
          <div className="text-xl font-bold text-green-700">{voucher || '-'}</div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Rezervasyon durumunuzu voucher numarası veya telefon numaranız ile sorgulayabilirsiniz.
        </p>
        <div className="flex gap-2">
          <button onClick={() => router.push('/reservation-lookup')} className="px-4 py-2 rounded-md bg-blue-600 text-white">
            Rezervasyon Sorgulama
          </button>
          <button onClick={() => router.push('/')} className="px-4 py-2 rounded-md border">
            Ana sayfa
          </button>
        </div>
      </div>
    </div>
  );
}


