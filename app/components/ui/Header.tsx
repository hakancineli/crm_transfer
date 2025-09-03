'use client';

import Link from 'next/link';
import LanguageSelector from '../LanguageSelector';

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">ProTransfer</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/customer-reservation" className="text-gray-700 hover:text-black">Rezervasyon</Link>
          <Link href="/reservation-lookup" className="text-gray-700 hover:text-black">Sorgulama</Link>
          <Link href="/reports" className="text-gray-700 hover:text-black">Raporlar</Link>
          <LanguageSelector />
        </nav>
      </div>
    </header>
  );
}
