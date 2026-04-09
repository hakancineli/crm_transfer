'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEmoji } from '../../contexts/EmojiContext';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageSelector from '../LanguageSelector';
import ReservationTypeSelector from '../ReservationTypeSelector';

interface HeaderProps {
    onSidebarToggle?: () => void;
    showSidebarToggle?: boolean;
}

export default function Header({ onSidebarToggle, showSidebarToggle = false }: HeaderProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useLanguage();
    const { user, logout, isAuthenticated } = useAuth();
    const { emojisEnabled } = useEmoji();
    const { theme, toggleTheme } = useTheme();

    // Müşteri ekranlarında yönetim linklerini gizle (ana sayfa dahil)
    const isCustomerContext = pathname === '/' || pathname.startsWith('/customer-reservation') || pathname.startsWith('/customer-panel');

    const adminNavigation = [
        { name: t('header.newReservation'), href: '/admin/new-reservation', isSpecial: true },
        { name: t('header.allReservations'), href: '/admin/reservations' },
        { name: 'Admin Panel', href: '/admin' },
    ];

    const customerNavigation: { name: string; href: string }[] = [];

    // Giriş yapılmamışsa üst çubukta admin linklerini gösterme
    const navigation = isCustomerContext ? customerNavigation : (isAuthenticated ? adminNavigation : customerNavigation);

    // Logo link'i - müşteri ekranlarında müşteri paneline/landing'e, admin ekranlarında ana sayfaya
    const logoHref = isCustomerContext ? '/' : '/';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 shadow-sm border-b border-gray-200 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/80 dark:border-slate-800 transition-colors duration-200">
            <nav className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {/* Sidebar toggle button for admin pages */}
                        {showSidebarToggle && onSidebarToggle && (
                            <button
                                type="button"
                                onClick={onSidebarToggle}
                                className="mr-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <div className="flex-shrink-0">
                            <Link href={logoHref} className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">P</span>
                                </div>
                                <span className="text-xl font-bold text-green-600 dark:text-green-400">Pro Acente</span>
                            </Link>
                        </div>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            {navigation.map((item) => {
                                // Özel component kullanılacak öğeler için
                                if ((item as any).isSpecial) {
                                    return (
                                        <div key={item.href} className="relative">
                                            <ReservationTypeSelector variant="header" />
                                        </div>
                                    );
                                }
                                
                                // Normal link öğeleri için
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                                            pathname === item.href
                                                ? 'border-green-500 text-gray-900 dark:text-white'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                            title={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <LanguageSelector />

                        {/* Kullanıcı bilgileri ve çıkış butonu */}
                        {!isCustomerContext && (
                            <div className="hidden md:flex items-center space-x-3">
                                {isAuthenticated && user ? (
                                    <>
                                        <div className="text-sm text-gray-600 dark:text-slate-300 transition-colors">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-gray-400 dark:text-slate-500 ml-1">({user.email})</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                                        >
                                            {emojisEnabled ? '🚪 ' : ''}Çıkış
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/admin-login"
                                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                                    >
                                        {emojisEnabled ? '🔑 ' : ''}Giriş
                                    </Link>
                                )}
                            </div>
                        )}
                        
                        <div className="md:hidden flex items-center">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                            >
                                <span className="sr-only">Menüyü aç</span>
                                {mobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                            {navigation.map((item) => {
                                // Özel component kullanılacak öğeler için
                                if ((item as any).isSpecial) {
                                    return (
                                        <div key={item.href} className="px-3 py-2">
                                            <ReservationTypeSelector onClose={() => setMobileMenuOpen(false)} />
                                        </div>
                                    );
                                }
                                
                                // Normal link öğeleri için
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'block px-3 py-2 rounded-md text-base font-medium',
                                            pathname === item.href
                                                ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                            
                            {/* Mobil çıkış butonu */}
                            {isAuthenticated && user && !isCustomerContext && (
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                    <div className="px-3 py-2 text-sm text-gray-600">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-gray-400 ml-1">({user.email})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        {emojisEnabled ? '🚪 ' : ''}Çıkış
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
} 