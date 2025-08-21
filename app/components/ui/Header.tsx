'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
    const pathname = usePathname();

    const navigation = [
        { name: 'Yeni Rezervasyon', href: '/' },
        { name: 'Tüm Rezervasyonlar', href: '/reservations' },
        { name: 'Raporlar', href: '/reports' },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 shadow">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-green-600">ProTransfer</Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                                        pathname === item.href
                                            ? 'border-green-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
} 