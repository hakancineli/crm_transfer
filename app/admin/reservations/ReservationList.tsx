'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchAndFilter } from '@/app/components/ui/SearchAndFilter';
import { AIRPORTS } from '@/app/types';

interface Reservation {
    id: string;
    date: string;
    time: string;
    from: string;
    to: string;
    flightCode: string;
    passengerNames: string;
    luggageCount: number;
    price: number;
    currency: string;
    distanceKm?: number;
    voucherNumber: string;
    userId?: string;
    tenantId?: string;
    createdAt: Date;
    phoneNumber?: string;
    paymentStatus: string;
    type?: string;
    source?: string;
    driver?: {
        id: string;
        name: string;
        phoneNumber?: string;
    } | null;
    user?: {
        id: string;
        username: string;
        name?: string;
    };
    tenant?: {
        id: string;
        companyName: string;
        subdomain: string;
    };
}
import { formatLocation, formatPassengerName, formatHotelName, toTitleCase } from '@/app/utils/textFormatters';
import ReturnTransferModal from '@/app/components/ReturnTransferModal';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTenant } from '@/app/contexts/TenantContext';
import { canViewAllReservations, canViewOwnSales } from '@/app/lib/permissions';
import { useModule } from '@/app/hooks/useModule';

interface ReservationListProps {
    onFilterChange: (filter: string) => void;
}

export default function ReservationList({ onFilterChange }: ReservationListProps) {
    const { user } = useAuth();
    const { selectedTenantId, tenants } = useTenant();
    // const flightEnabled = useModule('flight');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<string>('all');
    const [returnTransferModal, setReturnTransferModal] = useState<{
        isOpen: boolean;
        reservation: any;
    }>({ isOpen: false, reservation: null });
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Sayfalama ve tarih filtreleri
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    // Tarih aralığı kaldırıldı (yalnızca sayfa boyutu kaldı)

    useEffect(() => {
        fetchReservations();
        if (user?.role === 'SUPERUSER') {
            fetchTenants();
        }
    }, [user]);

    // Default filter to all reservations
    useEffect(() => {
        if (reservations.length > 0) {
            handleFilter('all');
        }
    }, [reservations]);

    // Re-filter when tenant selection changes
    useEffect(() => {
        if (reservations.length > 0) {
            handleFilter('all');
        }
    }, [selectedTenant]);

    const fetchReservations = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('pageSize', String(pageSize));
            const url = `/api/reservations?${params.toString()}`;

            console.log('Frontend: Rezervasyonlar getiriliyor...', { page, pageSize, url, hasToken: !!token });

            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            const data = await response.json();

            console.log('Frontend: API Response:', { status: response.status, dataLength: Array.isArray(data) ? data.length : 'not array', data: data });

            // Eğer hata objesi dönerse veya veri dizi değilse, boş dizi kullan
            const sortedData = Array.isArray(data)
                ? data.map((reservation: any) => ({
                    ...reservation,
                    passengerNames: typeof reservation.passengerNames === 'string'
                        ? JSON.parse(reservation.passengerNames || '[]')
                        : reservation.passengerNames || []
                })).sort((a: Reservation, b: Reservation) => {
                    // Önce kırmızı alarm (son 1 saat) olanlar üste
                    const now = new Date();
                    const aTime = new Date(`${a.date}T${a.time}`);
                    const bTime = new Date(`${b.date}T${b.time}`);
                    const aDiffHours = (aTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    const bDiffHours = (bTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    const aUrgent = aDiffHours >= 0 && aDiffHours <= 1;
                    const bUrgent = bDiffHours >= 0 && bDiffHours <= 1;
                    if (aUrgent !== bUrgent) return aUrgent ? -1 : 1;

                    // Sonra yeni → eski (varsayılan)
                    return bTime.getTime() - aTime.getTime();
                })
                : [];

            console.log('Frontend: Setting reservations:', sortedData);
            setReservations(sortedData);
            setFilteredReservations(sortedData);
        } catch (error) {
            console.error('Rezervasyonları getirme hatası:', error);
            setReservations([]);
            setFilteredReservations([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Sayfa boyutu değiştiğinde 1. sayfadan çek
    useEffect(() => {
        setPage(1);
        fetchReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    // Sayfa değiştiğinde rezervasyonları yeniden getir
    useEffect(() => {
        fetchReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchTenants = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch('/api/tenants', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                // Tenants are now managed by TenantContext
            }
        } catch (error) {
            console.error('Tenant\'ları getirme hatası:', error);
        }
    };

    // Format phone number with country code detection
    const formatPhoneNumber = (phone: string): string => {
        if (!phone) return '';

        // Remove all non-digit characters except + and strip hidden Unicode marks (LTR/RTL embeddings)
        const cleanPhone = phone
            .replace(/[\u202A\u202B\u202C\u202D\u202E\u200B\u200C\u200D\u200E\u200F]/g, '')
            .replace(/[^\d+]/g, '');

        // If already has country code, return as is
        if (cleanPhone.startsWith('+')) {
            return cleanPhone;
        }

        // If starts with 0, remove it and add +90 (Turkey)
        if (cleanPhone.startsWith('0')) {
            return `+90${cleanPhone.substring(1)}`;
        }

        // If 10 digits (Turkish mobile), add +90
        if (cleanPhone.length === 10) {
            return `+90${cleanPhone}`;
        }

        // If 11 digits and starts with 5 (Turkish mobile), add +90
        if (cleanPhone.length === 11 && cleanPhone.startsWith('5')) {
            return `+90${cleanPhone}`;
        }

        // Default: assume Turkish number and add +90
        return cleanPhone.length > 5 ? `+90${cleanPhone}` : cleanPhone;
    };

    const handleSearch = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        // Tarih formatını kontrol et (YYYY-MM-DD)
        const isDateSearch = /^\d{4}-\d{2}-\d{2}$/.test(query);

        const filtered = reservations.filter(reservation => {
            if (isDateSearch) {
                return reservation.date === query;
            }

            // Yolcu isimlerini kontrol et
            let passengerNames: string[] = [];
            try {
                passengerNames = typeof reservation.passengerNames === 'string'
                    ? JSON.parse(reservation.passengerNames)
                    : reservation.passengerNames;
            } catch (e) {
                passengerNames = Array.isArray(reservation.passengerNames)
                    ? reservation.passengerNames
                    : [];
            }

            return reservation.voucherNumber.toLowerCase().includes(lowercaseQuery) ||
                reservation.from.toLowerCase().includes(lowercaseQuery) ||
                reservation.to.toLowerCase().includes(lowercaseQuery) ||
                passengerNames.some(name =>
                    name.toLowerCase().includes(lowercaseQuery)
                );
        });

        setFilteredReservations(filtered);
    };

    const handleFilter = (filter: string) => {

        // API'de zaten kullanıcı filtrelemesi yapıldığı için burada ek filtreleme yapmaya gerek yok
        let filtered = [...reservations];

        // Apply tenant filtering for SUPERUSER
        if (user?.role === 'SUPERUSER' && selectedTenant !== 'all') {
            filtered = filtered.filter(reservation => reservation.tenantId === selectedTenant);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        switch (filter) {
            case 'all':
                // Tüm rezervasyonları göster
                break;
            case 'assigned':
                filtered = filtered.filter(r => r.driver);
                break;
            case 'unassigned':
                filtered = filtered.filter(r => !r.driver);
                break;
            case 'today':
                filtered = filtered.filter(r => {
                    const reservationDate = new Date(r.date);
                    return reservationDate.toDateString() === today.toDateString();
                });
                break;
            case 'tomorrow':
                filtered = filtered.filter(r => {
                    const reservationDate = new Date(r.date);
                    return reservationDate.toDateString() === tomorrow.toDateString();
                });
                break;
            case 'thisWeek':
                filtered = filtered.filter(r => {
                    const reservationDate = new Date(r.date);
                    return reservationDate >= today && reservationDate < nextWeek;
                });
                break;
            case 'karsilama':
                filtered = filtered.filter(r =>
                    (r.type !== 'tur' && !r.voucherNumber.startsWith('TUR-')) && // Tur rezervasyonlarını hariç tut
                    (r.from.includes('IST') || r.from.includes('SAW'))
                );
                break;
            case 'cikis':
                filtered = filtered.filter(r =>
                    (r.type !== 'tur' && !r.voucherNumber.startsWith('TUR-')) && // Tur rezervasyonlarını hariç tut
                    (r.to.includes('IST') || r.to.includes('SAW'))
                );
                break;
            case 'araTransfer':
                filtered = filtered.filter(r =>
                    r.type !== 'tur' && !r.voucherNumber.startsWith('TUR-') && // Tur rezervasyonlarını hariç tut
                    !r.from.includes('IST') && !r.from.includes('SAW') &&
                    !r.to.includes('IST') && !r.to.includes('SAW')
                );
                break;
            case 'tur':
                filtered = filtered.filter(r => r.type === 'tur' || r.voucherNumber.startsWith('TUR-'));
                break;
            default:
                break;
        }

        console.log('Final filtered count:', filtered.length, 'filtered reservations:', filtered.map(r => ({ type: r.type, voucher: r.voucherNumber })));
        setFilteredReservations(filtered);
        onFilterChange(filter);
    };

    const handlePaymentStatusUpdate = async (voucherNumber: string, newStatus: string) => {
        setUpdateLoading(voucherNumber);
        try {
            const response = await fetch(`/api/reservations/${voucherNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentStatus: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Ödeme durumu güncellenemedi');
            }

            // Sadece local state'i güncelle, sayfayı yenileme
            setReservations(prevReservations =>
                prevReservations.map(reservation =>
                    reservation.voucherNumber === voucherNumber
                        ? { ...reservation, paymentStatus: newStatus }
                        : reservation
                )
            );

            // Filtrelenmiş listeyi de güncelle
            setFilteredReservations(prevFiltered =>
                prevFiltered.map(reservation =>
                    reservation.voucherNumber === voucherNumber
                        ? { ...reservation, paymentStatus: newStatus }
                        : reservation
                )
            );
        } catch (error) {
            console.error('Ödeme durumu güncelleme hatası:', error);
            alert('Ödeme durumu güncellenirken bir hata oluştu');
        } finally {
            setUpdateLoading(null);
        }
    };

    const isWithinTwoHours = (dateStr: string, timeStr: string) => {
        const transferTime = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diffInHours = (transferTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        // 1 saat kala uyarı
        return diffInHours >= 0 && diffInHours <= 1;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950/60 flex items-center justify-center transition-colors duration-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Transfer sayılarını hesapla
    const karsilamaCount = filteredReservations.filter(r =>
        (r.type !== 'tur' && !r.voucherNumber.startsWith('TUR-')) &&
        (r.from.includes('IST') || r.from.includes('SAW'))
    ).length;
    const cikisCount = filteredReservations.filter(r =>
        (r.type !== 'tur' && !r.voucherNumber.startsWith('TUR-')) &&
        (r.to.includes('IST') || r.to.includes('SAW'))
    ).length;
    const araTransferCount = filteredReservations.filter(r =>
        r.type !== 'tur' && !r.voucherNumber.startsWith('TUR-') && // Tur rezervasyonlarını hariç tut
        (!r.from.includes('IST') && !r.from.includes('SAW')) &&
        (!r.to.includes('IST') && !r.to.includes('SAW'))
    ).length;
    const turCount = filteredReservations.filter(r => r.type === 'tur' || r.voucherNumber.startsWith('TUR-')).length;

    return (<>
        <div className="w-full">
            {/* Transfer Özeti (sticky) */}
            <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg shadow mb-6 sticky top-4 z-10 border border-gray-200 dark:border-slate-700 dark:shadow-none transition-colors duration-200">
                <div className="text-sm text-gray-600 dark:text-slate-300">
                    <span className="font-medium">Toplam {filteredReservations.length} Rezervasyon</span>
                    <div className="text-xs text-red-500 mt-1">
                    </div>
                    {filteredReservations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                            <button
                                onClick={() => handleFilter('karsilama')}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'karsilama'
                                        ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                        : 'bg-[#1E293B] text-[#E2E8F0] border-[#334155] hover:bg-[#273449]'
                                    }`}
                            >
                                {karsilamaCount} Karşılama
                            </button>
                            <button
                                onClick={() => handleFilter('cikis')}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'cikis'
                                        ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                        : 'bg-[#1E293B] text-[#E2E8F0] border-[#334155] hover:bg-[#273449]'
                                    }`}
                            >
                                {cikisCount} Çıkış
                            </button>
                            <button
                                onClick={() => handleFilter('araTransfer')}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap ${activeFilter === 'araTransfer'
                                        ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                        : 'bg-[#1E293B] text-[#E2E8F0] border-[#334155] hover:bg-[#273449]'
                                    }`}
                            >
                                {araTransferCount} Ara Transfer
                            </button>
                            <button
                                onClick={() => handleFilter('tur')}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'tur'
                                        ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                        : 'bg-[#1E293B] text-[#E2E8F0] border-[#334155] hover:bg-[#273449]'
                                    }`}
                            >
                                {turCount} Tur
                            </button>
                            <button
                                onClick={() => handleFilter('all')}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${activeFilter === 'all'
                                        ? 'bg-[#16A34A] text-white border-[#16A34A]'
                                        : 'bg-[#1E293B] text-[#E2E8F0] border-[#334155] hover:bg-[#273449]'
                                    }`}
                            >
                                Tümü
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Acente Filtreleme - Sadece Superuser için */}
            {user?.role === 'SUPERUSER' && tenants.length > 0 && (
                <div className="mb-4">
                    <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-700 dark:shadow-none transition-colors duration-200 text-gray-900 dark:text-slate-100">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                Acente Filtresi:
                            </label>
                            <select
                                value={selectedTenant}
                                onChange={(e) => setSelectedTenant(e.target.value)}
                                title="Acente filtresi"
                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="all">Tüm Acenteler</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.companyName}
                                    </option>
                                ))}
                            </select>
                            {selectedTenant !== 'all' && (
                                <button
                                    onClick={() => setSelectedTenant('all')}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                >
                                    Filtreyi Temizle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Arama ve Filtreleme */}
            <div className="mb-6">
                <SearchAndFilter
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    pageSizeControl={
                        <div className="flex items-end gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Sayfa Boyutu</label>
                                <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))} title="Sayfa boyutu" className="px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md text-sm transition-colors duration-200">
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <button onClick={() => fetchReservations()} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Uygula</button>
                        </div>
                    }
                />
            </div>

            {/* Desktop Tablo */}
            <div className="hidden lg:block bg-white dark:bg-slate-900/90 shadow-lg rounded-xl border border-gray-200 dark:border-slate-700 overflow-x-auto transition-colors duration-200">
                <div>
                    <table className="w-full min-w-[1200px] xl:min-w-[1360px] table-auto">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 transition-colors duration-200">
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-28">
                                    Voucher
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-28">
                                    Tip
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-32">
                                    Tarih
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                    Güzergah
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                    Müşteri
                                </th>
                                {user?.role === 'SUPERUSER' && (
                                    <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-32">
                                        Acente
                                    </th>
                                )}
                                {(user?.role === 'SUPERUSER' || user?.role === 'AGENCY_ADMIN') && (
                                    <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-32">
                                        Kullanıcı
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-24">
                                    Fiyat
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-36">
                                    Şoför
                                </th>
                                {/* Uçuş Durumu sütunu kaldırıldı */}
                                {/* Durum sütunu kaldırıldı */}
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-32">
                                    Ödeme
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider w-44">
                                    İşlem
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900/90 divide-y divide-gray-100 dark:divide-slate-800 transition-colors duration-200">
                            {filteredReservations.length === 0 ? (
                                <tr>
                                    <td colSpan={
                                        (user?.role === 'SUPERUSER' ? 1 : 0) + // Acente sütunu
                                        (user?.role === 'SUPERUSER' || user?.role === 'AGENCY_ADMIN' ? 1 : 0) + // Kullanıcı sütunu
                                        6 + // VOUCHER, TİP, TARİH, GÜZERGAH, MÜŞTERİ, FİYAT
                                        1 + // Şoför
                                        0 + // Uçuş Durumu kaldırıldı
                                        2 // Ödeme, İşlem (Durum kaldırıldı)
                                    } className="px-3 py-4 text-center text-gray-500 dark:text-slate-400">
                                        Rezervasyon bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredReservations.map((reservation) => {
                                    const isUrgent = isWithinTwoHours(reservation.date, reservation.time);
                                    const isPast = new Date(`${reservation.date}T${reservation.time}`) < new Date();
                                    // Kısa güzergah gösterimi: Havalimanı adı + ilçe
                                    const isFromAirport = reservation.from.includes('IST') || reservation.from.includes('SAW');
                                    const isToAirport = reservation.to.includes('IST') || reservation.to.includes('SAW');

                                    const extractDistrict = (text: string) => {
                                        // virgül veya '/' ile ayrılmış son parça ilçe/semte işaret eder
                                        const parts = text.split(/[,/]/).map(p => p.trim()).filter(Boolean);
                                        return toTitleCase(parts[0] || text);
                                    };

                                    const airportLabel = (text: string) => {
                                        if (text.includes('IST')) return 'IST';
                                        if (text.includes('SAW')) return 'SAW';
                                        return formatLocation(text);
                                    };

                                    const formattedFrom = isFromAirport
                                        ? airportLabel(reservation.from)
                                        : extractDistrict(reservation.from);
                                    const formattedTo = isToAirport
                                        ? airportLabel(reservation.to)
                                        : extractDistrict(reservation.to);
                                    const formattedPassengerNames = Array.isArray(reservation.passengerNames)
                                        ? reservation.passengerNames.map(name => formatPassengerName(name))
                                        : typeof reservation.passengerNames === 'string'
                                            ? JSON.parse(reservation.passengerNames).map((name: string) => formatPassengerName(name))
                                            : [];

                                    return (
                                        <tr key={reservation.id}
                                            onClick={(e) => {
                                                if (!(e.target as HTMLElement).closest('button, a, select')) {
                                                    window.location.href = `/admin/reservations/${reservation.voucherNumber}`;
                                                }
                                            }}
                                            className={`transition-all duration-200 cursor-pointer ${isUrgent
                                                    ? 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/40 border-l-4 border-red-500'
                                                    : isPast
                                                        ? 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                        : 'hover:bg-gray-50 dark:hover:bg-slate-800 hover:shadow-sm'
                                                }`}>
                                            <td className="px-6 py-4 text-sm font-bold align-middle text-gray-900 dark:text-slate-100">
                                                <div className="font-mono text-xs px-2 py-1 rounded border inline-block whitespace-nowrap text-gray-700 bg-gray-100 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                    {reservation.voucherNumber.startsWith('TUR-')
                                                        ? `TUR${new Date(reservation.date).toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9) + 1}`
                                                        : reservation.voucherNumber
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-middle">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold min-w-[80px] whitespace-nowrap border ${reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')
                                                                ? 'bg-blue-500/12 text-blue-300 border-blue-500/25'
                                                                : reservation.type === 'Konaklama' || reservation.voucherNumber.startsWith('HOTEL-')
                                                                    ? 'bg-fuchsia-500/12 text-fuchsia-300 border-fuchsia-500/25'
                                                                    : reservation.from.includes('IST') || reservation.from.includes('SAW')
                                                                        ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25'
                                                                        : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                                            ? 'bg-amber-500/12 text-amber-300 border-amber-500/25'
                                                                            : 'bg-violet-500/12 text-violet-300 border-violet-500/25'
                                                            }`}>
                                                            {reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')
                                                                ? 'Tur'
                                                                : reservation.type === 'Konaklama' || reservation.voucherNumber.startsWith('HOTEL-')
                                                                    ? 'Konaklama'
                                                                    : reservation.from.includes('IST') || reservation.from.includes('SAW')
                                                                        ? 'Karşılama'
                                                                        : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                                            ? 'Çıkış'
                                                                            : 'Ara Transfer'
                                                            }
                                                        </span>
                                                        {/* Rezervasyon kaynağı badge'i */}
                                                        {reservation.source === 'website' && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30 transition-colors duration-200">
                                                                🌐 Website
                                                            </span>
                                                        )}
                                                        {/* Admin etiketi istenmiyor */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-middle">
                                                {new Date(reservation.date).toLocaleDateString('tr-TR')}
                                                <div className={`text-xs ${isUrgent ? 'text-red-600 dark:text-red-400 font-medium animate-pulse' : 'text-gray-500 dark:text-slate-400'}`}>
                                                    {reservation.time}
                                                    {isUrgent && ' ⚠️'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 whitespace-normal break-words align-top">
                                                <div className="flex flex-col space-y-2">
                                                    {/* Güzergah Bilgisi - Temiz ve Düzenli */}
                                                    <div className="flex items-start">
                                                        <div className="flex flex-col flex-1">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100 whitespace-normal break-words leading-tight" title={formattedFrom}>
                                                                {formattedFrom}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center w-8 px-1">
                                                            <span className="text-gray-400 dark:text-slate-500 text-lg">→</span>
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100 whitespace-normal break-words leading-tight" title={formattedTo}>
                                                                {formattedTo}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Uçuş Kodu - Ayrı Bir Bölümde */}
                                                    {reservation.flightCode && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 dark:bg-blue-500/10 dark:border-blue-500/20 transition-colors duration-200">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">✈️ Uçuş:</span>
                                                                <span className="text-blue-800 dark:text-blue-200 text-xs font-mono bg-blue-100 dark:bg-blue-500/15 px-2 py-1 rounded transition-colors duration-200">
                                                                    {reservation.flightCode.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-top max-w-[200px]">
                                                <div className="flex flex-col">
                                                    <div className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight" title={formattedPassengerNames.join(', ')}>
                                                        {formattedPassengerNames.join(', ')}
                                                    </div>
                                                    {reservation.phoneNumber && (
                                                        <div className="text-xs text-gray-500 dark:text-[#94A3B8] mt-1 truncate" title={formatPhoneNumber(reservation.phoneNumber)}>
                                                            {formatPhoneNumber(reservation.phoneNumber)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {user?.role === 'SUPERUSER' && (
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-middle">
                                                    <div className="font-medium text-blue-600 dark:text-[#60A5FA] hover:text-blue-700 dark:hover:text-[#93C5FD] transition-colors">
                                                        {reservation.tenant?.companyName ||
                                                            (selectedTenantId ? tenants.find(t => t.id === selectedTenantId)?.companyName : 'Bilinmiyor')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-[#94A3B8]">
                                                        {reservation.tenant?.subdomain ||
                                                            (selectedTenantId ? tenants.find(t => t.id === selectedTenantId)?.subdomain : 'N/A')}
                                                    </div>
                                                </td>
                                            )}
                                            {(user?.role === 'SUPERUSER' || user?.role === 'AGENCY_ADMIN') && (
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-middle">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {reservation.user?.name || reservation.user?.username || 'Bilinmiyor'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-[#94A3B8]">
                                                        {reservation.user?.username || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-middle">
                                                <div className="font-semibold text-[#16A34A]">{reservation.price} {reservation.currency}</div>
                                                {reservation.distanceKm && (
                                                    <div className="text-xs text-gray-500 dark:text-[#94A3B8]">
                                                        {reservation.distanceKm.toFixed(1)} km
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100 align-middle">
                                                {reservation.driver ? (
                                                    <div>
                                                        <div className="font-medium">{reservation.driver.name}</div>
                                                        <div className="text-xs text-gray-500">{reservation.driver.phoneNumber}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm align-middle">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${reservation.paymentStatus === 'PAID' ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25' :
                                                            reservation.paymentStatus === 'PENDING' ? 'bg-amber-500/12 text-amber-300 border-amber-500/25' :
                                                                'bg-red-500/12 text-red-300 border-red-500/25'
                                                        }`}>
                                                        {reservation.paymentStatus === 'PAID' ? 'Ödendi' :
                                                            reservation.paymentStatus === 'PENDING' ? 'Bekliyor' : 'Ödenmedi'}
                                                    </span>
                                                    {reservation.paymentStatus === 'PENDING' ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handlePaymentStatusUpdate(reservation.voucherNumber, 'PAID')}
                                                                className="text-xs text-green-600 hover:text-green-800"
                                                                disabled={updateLoading === reservation.voucherNumber}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentStatusUpdate(reservation.voucherNumber, 'UNPAID')}
                                                                className="text-xs text-red-600 hover:text-red-800"
                                                                disabled={updateLoading === reservation.voucherNumber}
                                                            >
                                                                ✗
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const newStatus = reservation.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
                                                                handlePaymentStatusUpdate(reservation.voucherNumber, newStatus);
                                                            }}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                            disabled={updateLoading === reservation.voucherNumber}
                                                        >
                                                            {reservation.paymentStatus === 'PAID' ? '✗' : '✓'}
                                                        </button>
                                                    )}
                                                    {updateLoading === reservation.voucherNumber && (
                                                        <span className="ml-1 animate-spin">⌛</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium align-middle">
                                                <div className="flex items-center space-x-2 justify-end">
                                                    {!reservation.driver ? (
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => {
                                                                    if (reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')) {
                                                                        window.location.href = `/admin/tour/reservations/${reservation.id}/driver-assign`;
                                                                    } else {
                                                                        window.location.href = `/admin/reservations/${reservation.voucherNumber}?edit=driver`;
                                                                    }
                                                                }}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm transition-colors"
                                                            >
                                                                Şoför Ata
                                                            </button>
                                                            <button
                                                                onClick={() => setReturnTransferModal({ isOpen: true, reservation })}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-lg font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Dönüş Transferi Ekle"
                                                            >
                                                                🔄
                                                            </button>
                                                            <Link
                                                                href={reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')
                                                                    ? `/admin/tour/reservations/${reservation.id}/driver-voucher`
                                                                    : `/admin/reservations/${reservation.voucherNumber}/driver-voucher`
                                                                }
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Şoför Voucherı"
                                                            >
                                                                👨‍✈️
                                                            </Link>
                                                            <Link
                                                                href={reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')
                                                                    ? `/admin/tour/reservations/${reservation.id}/customer-voucher`
                                                                    : `/admin/reservations/${reservation.voucherNumber}/customer-voucher`
                                                                }
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Müşteri Voucherı"
                                                            >
                                                                🎫
                                                            </Link>
                                                            <Link
                                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Rezervasyonu Düzenle"
                                                            >
                                                                ✏️
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => setReturnTransferModal({ isOpen: true, reservation })}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-lg font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Dönüş Transferi Ekle"
                                                            >
                                                                🔄
                                                            </button>
                                                            <Link
                                                                href={reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')
                                                                    ? `/admin/tour/reservations/${reservation.id}/driver-voucher`
                                                                    : `/admin/reservations/${reservation.voucherNumber}/driver-voucher`
                                                                }
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Şoför Voucherı"
                                                            >
                                                                👨‍✈️
                                                            </Link>
                                                            <Link
                                                                href={reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')
                                                                    ? `/admin/tour/reservations/${reservation.id}/customer-voucher`
                                                                    : `/admin/reservations/${reservation.voucherNumber}/customer-voucher`
                                                                }
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Müşteri Voucherı"
                                                            >
                                                                🎫
                                                            </Link>
                                                            <Link
                                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-xl font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                                                                title="Rezervasyonu Düzenle"
                                                            >
                                                                ✏️
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobil Card Listesi */}
            <div className="lg:hidden space-y-4">
                {filteredReservations.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/90 p-4 rounded-lg shadow text-center text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                        Rezervasyon bulunamadı
                    </div>
                ) : (
                    filteredReservations.map((reservation) => {
                        const isUrgent = isWithinTwoHours(reservation.date, reservation.time);
                        const isFromAirport = reservation.from.includes('IST') || reservation.from.includes('SAW');
                        const isToAirport = reservation.to.includes('IST') || reservation.to.includes('SAW');
                        const extractDistrict = (text: string) => {
                            const parts = text.split(/[,/]/).map(p => p.trim()).filter(Boolean);
                            return toTitleCase(parts[0] || text);
                        };
                        const airportLabel = (text: string) => {
                            if (text.includes('IST')) return 'IST';
                            if (text.includes('SAW')) return 'SAW';
                            return formatLocation(text);
                        };
                        const formattedFrom = isFromAirport ? airportLabel(reservation.from) : extractDistrict(reservation.from);
                        const formattedTo = isToAirport ? airportLabel(reservation.to) : extractDistrict(reservation.to);
                        const formattedPassengerNames = Array.isArray(reservation.passengerNames)
                            ? reservation.passengerNames.map(name => formatPassengerName(name))
                            : typeof reservation.passengerNames === 'string'
                                ? JSON.parse(reservation.passengerNames).map((name: string) => formatPassengerName(name))
                                : [];

                        return (
                            <div
                                key={reservation.id}
                                onClick={(e) => {
                                    if (!(e.target as HTMLElement).closest('button, a')) {
                                        window.location.href = `/admin/reservations/${reservation.voucherNumber}`;
                                    }
                                }}
                                className={`bg-white dark:bg-slate-900/90 rounded-lg shadow-sm border p-4 cursor-pointer transition-colors duration-150 ${isUrgent ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/25' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/70'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {reservation.voucherNumber}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${reservation.from.includes('IST') || reservation.from.includes('SAW')
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
                                                    : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
                                                        : 'bg-purple-100 text-purple-800 dark:bg-violet-500/15 dark:text-violet-300'
                                                }`}>
                                                {reservation.from.includes('IST') || reservation.from.includes('SAW')
                                                    ? 'Karşılama'
                                                    : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                        ? 'Çıkış'
                                                        : 'Ara Transfer'
                                                }
                                            </span>
                                        </div>
                                        <div className={`text-sm ${isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-slate-100'}`}>
                                            {new Date(reservation.date).toLocaleDateString('tr-TR')} {reservation.time}
                                            {isUrgent && ' ⚠️'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-sm">{reservation.price} {reservation.currency}</div>
                                    </div>
                                </div>

                                {/* Güzergah */}
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Güzergah:</div>
                                    <div className="text-sm text-gray-900 dark:text-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="flex-1">{formattedFrom}</span>
                                            <span className="text-gray-400 dark:text-slate-500">→</span>
                                            <span className="flex-1">{formattedTo}</span>
                                        </div>
                                        {reservation.flightCode && (
                                            <div className="mt-1 text-xs text-blue-600 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded border border-blue-200 dark:border-blue-500/20 transition-colors duration-200">
                                                ✈️ {reservation.flightCode.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Müşteri */}
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Müşteri:</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{formattedPassengerNames.join(', ')}</div>
                                    {reservation.phoneNumber && (
                                        <div className="text-xs text-gray-500 dark:text-slate-400">
                                            {formatPhoneNumber(reservation.phoneNumber)}
                                        </div>
                                    )}
                                </div>

                                {/* Acente (SUPERUSER için) */}
                                {user?.role === 'SUPERUSER' && (
                                    <div className="mb-3">
                                        <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Acente:</div>
                                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {reservation.tenant?.companyName ||
                                                (selectedTenantId ? tenants.find(t => t.id === selectedTenantId)?.companyName : 'Bilinmiyor')}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-slate-400">
                                            {reservation.tenant?.subdomain ||
                                                (selectedTenantId ? tenants.find(t => t.id === selectedTenantId)?.subdomain : 'N/A')}
                                        </div>
                                    </div>
                                )}

                                {/* Şoför ve Durum */}
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Şoför:</div>
                                        {reservation.driver ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 dark:text-slate-100">{reservation.driver.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-slate-400">{reservation.driver.phoneNumber}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-slate-500">-</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reservation.driver ? 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300'
                                            }`}>
                                            {reservation.driver ? 'Atandı' : 'Bekliyor'}
                                        </span>
                                    </div>
                                </div>

                                {/* Ödeme Durumu */}
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">Ödeme:</div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reservation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300' :
                                                reservation.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'
                                            }`}>
                                            {reservation.paymentStatus === 'PAID' ? 'Ödendi' :
                                                reservation.paymentStatus === 'PENDING' ? 'Bekliyor' : 'Ödenmedi'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {reservation.paymentStatus === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handlePaymentStatusUpdate(reservation.voucherNumber, 'PAID')}
                                                    className="text-xs text-green-600 hover:text-green-800 p-1"
                                                    disabled={updateLoading === reservation.voucherNumber}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => handlePaymentStatusUpdate(reservation.voucherNumber, 'UNPAID')}
                                                    className="text-xs text-red-600 hover:text-red-800 p-1"
                                                    disabled={updateLoading === reservation.voucherNumber}
                                                >
                                                    ✗
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const newStatus = reservation.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
                                                    handlePaymentStatusUpdate(reservation.voucherNumber, newStatus);
                                                }}
                                                className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-1 transition-colors"
                                                disabled={updateLoading === reservation.voucherNumber}
                                            >
                                                {reservation.paymentStatus === 'PAID' ? '✗' : '✓'}
                                            </button>
                                        )}
                                        {updateLoading === reservation.voucherNumber && (
                                            <span className="animate-spin">⌛</span>
                                        )}
                                    </div>
                                </div>

                                {/* Aksiyon Butonları */}
                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                                    {!reservation.driver ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    console.log('Şoför Ata butonuna tıklandı:', {
                                                        type: reservation.type,
                                                        voucherNumber: reservation.voucherNumber,
                                                        id: reservation.id
                                                    });
                                                    if (reservation.type === 'tur' || reservation.voucherNumber.startsWith('TUR-')) {
                                                        console.log('Tur rezervasyonu - yönlendiriliyor:', `/admin/tour/reservations/${reservation.id}/driver-assign`);
                                                        window.location.href = `/admin/tour/reservations/${reservation.id}/driver-assign`;
                                                    } else {
                                                        console.log('Transfer rezervasyonu - yönlendiriliyor:', `/admin/reservations/${reservation.voucherNumber}?edit=driver`);
                                                        window.location.href = `/admin/reservations/${reservation.voucherNumber}?edit=driver`;
                                                    }
                                                }}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-white bg-purple-600 hover:bg-purple-700"
                                            >
                                                Şoför Ata
                                            </button>
                                            <button
                                                onClick={() => setReturnTransferModal({ isOpen: true, reservation })}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                            >
                                                🔄 Dönüş
                                            </button>
                                            <Link
                                                href={reservation.type === 'Tur'
                                                    ? `/admin/tour/reservations/${reservation.id}/customer-voucher`
                                                    : `/admin/reservations/${reservation.voucherNumber}/customer-voucher`
                                                }
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Müşteri
                                            </Link>
                                            <Link
                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Düzenle
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setReturnTransferModal({ isOpen: true, reservation })}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                            >
                                                🔄 Dönüş
                                            </button>
                                            <Link
                                                href={reservation.type === 'Tur'
                                                    ? `/admin/tour/reservations/${reservation.id}/driver-voucher`
                                                    : `/admin/reservations/${reservation.voucherNumber}/driver-voucher`
                                                }
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Şoför
                                            </Link>
                                            <Link
                                                href={reservation.type === 'Tur'
                                                    ? `/admin/tour/reservations/${reservation.id}/customer-voucher`
                                                    : `/admin/reservations/${reservation.voucherNumber}/customer-voucher`
                                                }
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Müşteri
                                            </Link>
                                            <Link
                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Düzenle
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* Sayfalama Kontrolleri */}
            <div className="mt-6 flex items-center justify-between">
                <button
                    onClick={() => { if (page > 1) { setPage(page - 1); fetchReservations(); } }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-slate-900/90 hover:bg-gray-50 disabled:opacity-50"
                    disabled={page === 1}
                >Önceki</button>
                <div className="text-sm text-gray-600">Sayfa {page}</div>
                <button
                    onClick={() => { setPage(page + 1); fetchReservations(); }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-slate-900/90 hover:bg-gray-50"
                >Sonraki</button>
            </div>
        </div>
        {returnTransferModal.isOpen && returnTransferModal.reservation ? (
            <ReturnTransferModal
                isOpen={returnTransferModal.isOpen}
                onClose={() => setReturnTransferModal({ isOpen: false, reservation: null })}
                originalReservation={returnTransferModal.reservation}
                onSuccess={() => {
                    fetchReservations();
                    setReturnTransferModal({ isOpen: false, reservation: null });
                }}
            />
        ) : null}
    </>);
}