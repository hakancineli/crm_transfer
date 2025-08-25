'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { formatLocation, formatPassengerName } from '@/app/utils/textFormatters';

interface CustomerReservation {
    id: string;
    voucherNumber: string;
    date: string;
    time: string;
    from: string;
    to: string;
    flightCode?: string;
    luggageCount?: number;
    passengerNames: string[];
    phoneNumber?: string;
    price?: number | null;
    currency?: string | null;
    email?: string;
    specialRequests?: string;
    status: string;
    isReturn: boolean;
    returnTransfer?: {
        voucherNumber: string;
        date: string;
        time: string;
    } | null;
    originalTransfer?: {
        voucherNumber: string;
        date: string;
        time: string;
    } | null;
}

export default function CustomerPanelPage() {
    const { t } = useLanguage();
    const [reservations, setReservations] = useState<CustomerReservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<CustomerReservation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneCountryCode, setPhoneCountryCode] = useState('+90');
    const [phoneLocal, setPhoneLocal] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const translateWithFallback = (key: string, fallback: string) => {
        const val = t(key) as unknown as string;
        if (!val || typeof val !== 'string') return fallback;
        // Eğer çeviri anahtarının kendisi dönüyorsa (nokta içeriyorsa) fallback kullan
        if (val.includes('.') || val.toLowerCase().includes('placeholder')) return fallback;
        return val;
    };

    const formatPassengers = (passengerNames: string[] | string) => {
        let names: string[] = [];
        try {
            names = typeof passengerNames === 'string' ? JSON.parse(passengerNames) : passengerNames;
        } catch {
            names = Array.isArray(passengerNames) ? passengerNames : [];
        }
        return names
            .map((n) => String(n).trim())
            .filter(Boolean)
            .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
            .join(', ');
    };

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredReservations(reservations);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        
        // Tarih formatını kontrol et (YYYY-MM-DD)
        const isDateSearch = /^\d{4}-\d{2}-\d{2}$/.test(query);
        
        const filtered = reservations.filter(reservation => {
            if (isDateSearch) {
                return reservation.date === query;
            }

            // Yolcu isimlerini kontrol et
            const passengerNames = (() => {
                try {
                    return typeof reservation.passengerNames === 'string' 
                        ? JSON.parse(reservation.passengerNames)
                        : reservation.passengerNames;
                } catch {
                    return Array.isArray(reservation.passengerNames) ? reservation.passengerNames : [];
                }
            })() as string[];

            return (
                reservation.voucherNumber.toLowerCase().includes(lowercaseQuery) ||
                reservation.from.toLowerCase().includes(lowercaseQuery) ||
                reservation.to.toLowerCase().includes(lowercaseQuery) ||
                passengerNames.some(name => name.toLowerCase().includes(lowercaseQuery)) ||
                (reservation.flightCode && reservation.flightCode.toLowerCase().includes(lowercaseQuery))
            );
        });

        setFilteredReservations(filtered);
    };

    // Filtreler müşteri panelinde gösterilmez; yalnızca arama kullanılabilir

    const searchByPhone = async () => {
        const composedPhone = `${phoneCountryCode} ${phoneLocal}`.trim();
        if (!phoneLocal.trim()) return;
        
        setIsSearching(true);
        setIsLoading(true);
        try {
            const response = await fetch(`/api/customer-reservations?phone=${encodeURIComponent(composedPhone)}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setReservations(data);
                setFilteredReservations(data);
            } else {
                setReservations([]);
                setFilteredReservations([]);
            }
        } catch (error) {
            console.error('Telefon ile arama hatası:', error);
            setReservations([]);
            setFilteredReservations([]);
        } finally {
            setIsSearching(false);
            setIsLoading(false);
        }
    };

    // Ülke telefon kodları
    const COUNTRY_DIAL_CODES = [
        { code: '+90', label: 'Türkiye (+90)' },
        { code: '+44', label: 'United Kingdom (+44)' },
        { code: '+1', label: 'United States (+1)' },
        { code: '+971', label: 'United Arab Emirates (+971)' },
        { code: '+966', label: 'Saudi Arabia (+966)' },
        { code: '+49', label: 'Germany (+49)' },
        { code: '+33', label: 'France (+33)' },
        { code: '+39', label: 'Italy (+39)' },
        { code: '+34', label: 'Spain (+34)' },
        { code: '+31', label: 'Netherlands (+31)' },
        { code: '+41', label: 'Switzerland (+41)' },
        { code: '+43', label: 'Austria (+43)' },
        { code: '+7', label: 'Russia (+7)' },
        { code: '+380', label: 'Ukraine (+380)' },
        { code: '+30', label: 'Greece (+30)' },
        { code: '+48', label: 'Poland (+48)' },
        { code: '+36', label: 'Hungary (+36)' },
        { code: '+40', label: 'Romania (+40)' },
        { code: '+994', label: 'Azerbaijan (+994)' },
        { code: '+995', label: 'Georgia (+995)' },
        { code: '+973', label: 'Bahrain (+973)' },
        { code: '+974', label: 'Qatar (+974)' },
        { code: '+965', label: 'Kuwait (+965)' },
        { code: '+968', label: 'Oman (+968)' },
        { code: '+962', label: 'Jordan (+962)' },
        { code: '+961', label: 'Lebanon (+961)' }
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR');
    };

    const formatTime = (timeStr: string) => {
        return timeStr;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string, price?: number | null) => {
        if (typeof price === 'number' && !isNaN(price)) {
            return 'Onaylandı';
        }
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'Tamamlandı';
            case 'cancelled':
                return 'İptal Edildi';
            case 'pending':
                return 'Bekliyor';
            default:
                return 'Bilinmiyor';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-end mb-4">
                        <LanguageSelector />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('customerPanel.title')}</h1>
                    <p className="text-xl text-gray-600">{t('customerPanel.subtitle')}</p>
                </div>

                {/* Telefon ile Arama */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('customerPanel.searchByPhone')}</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={phoneCountryCode}
                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                            className="w-full sm:w-44 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {COUNTRY_DIAL_CODES.map(({ code, label }) => (
                                <option key={code} value={code}>{label}</option>
                            ))}
                        </select>
                        <input
                            type="tel"
                            placeholder={translateWithFallback('customerPanel.phonePlaceholder', '5XX XXX XX XX')}
                            value={phoneLocal}
                            onChange={(e) => setPhoneLocal(e.target.value)}
                            className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={searchByPhone}
                            disabled={isSearching || !phoneLocal.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSearching ? t('customerPanel.searching') : t('customerPanel.search')}
                        </button>
                    </div>
                </div>

                {/* Yalnızca arama kutusu */}
                <div className="mb-6">
                    <div className="max-w-lg">
                        <input
                            type="text"
                            placeholder={translateWithFallback('customerPanel.searchPlaceholder', 'Voucher, güzergah veya yolcu ara...')}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Rezervasyon Listesi */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('customerPanel.voucher')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('customerPanel.date')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('customerPanel.time')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('customerPanel.route')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('customerPanel.passengers')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('customerPanel.status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            {t('customerPanel.noReservations')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservations.map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {reservation.voucherNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(reservation.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatTime(reservation.time)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium">{formatLocation(reservation.from)}</div>
                                                    <div className="text-gray-400">→</div>
                                                    <div className="font-medium">{formatLocation(reservation.to)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatPassengers(reservation.passengerNames)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                                        {getStatusText(reservation.status, reservation.price)}
                                                    </span>
                                                    {typeof reservation.price === 'number' && !isNaN(reservation.price) && (
                                                        <span className="text-sm font-semibold text-emerald-700">
                                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (reservation.currency || 'USD') as any }).format(reservation.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
