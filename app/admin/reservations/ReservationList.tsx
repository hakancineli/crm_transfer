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
import FlightStatus from '@/app/components/FlightStatus';
import { useAuth } from '@/app/contexts/AuthContext';
import { canViewAllReservations, canViewOwnSales } from '@/app/lib/permissions';
import { useModule } from '@/app/hooks/useModule';

interface ReservationListProps {
    onFilterChange: (filter: string) => void;
}

export default function ReservationList({ onFilterChange }: ReservationListProps) {
    const { user } = useAuth();
    const flightEnabled = useModule('flight');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<string>('all');
    const [tenants, setTenants] = useState<Array<{id: string, companyName: string, subdomain: string}>>([]);
    const [returnTransferModal, setReturnTransferModal] = useState<{
        isOpen: boolean;
        reservation: any;
    }>({ isOpen: false, reservation: null });

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
            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            const data = await response.json();
            
            // Eğer hata objesi dönerse veya veri dizi değilse, boş dizi kullan
            const sortedData = Array.isArray(data)
                ? data.map((reservation: any) => ({
                    ...reservation,
                    passengerNames: typeof reservation.passengerNames === 'string' 
                        ? JSON.parse(reservation.passengerNames || '[]')
                        : reservation.passengerNames || []
                })).sort((a: Reservation, b: Reservation) => {
                    const timeA = new Date(`${a.date} ${a.time}`).getTime();
                    const timeB = new Date(`${b.date} ${b.time}`).getTime();
                    // Yeni → Eski
                    return timeB - timeA;
                })
                : [];

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

    const fetchTenants = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch('/api/tenants', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setTenants(data);
            }
        } catch (error) {
            console.error('Tenant\'ları getirme hatası:', error);
        }
    };

    // Format phone number with country code detection
    const formatPhoneNumber = (phone: string): string => {
        if (!phone) return '';
        
        // Remove all non-digit characters except +
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
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
        return `+90${cleanPhone}`;
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
        let filtered = [...reservations];
        
        // Apply permission-based filtering first (role-aware)
        if (user) {
            const canViewAll = (user.role === 'SUPERUSER') || ['SUPERUSER','AGENCY_ADMIN','AGENCY_USER','OPERATION','ACCOUNTANT','MANAGER'].includes(user.role);
            if (canViewAll) {
                filtered = [...reservations];
            } else if (['SELLER'].includes(user.role)) {
                filtered = reservations.filter(reservation => reservation.userId === user.id);
            } else {
                filtered = [];
            }
        } else {
            // If no user, show all reservations (for debugging)
            filtered = [...reservations];
        }

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
            default:
                break;
        }
        
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
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    // Transfer sayılarını hesapla
    const karsilamaCount = filteredReservations.filter(r => r.from.includes('IST') || r.from.includes('SAW')).length;
    const cikisCount = filteredReservations.filter(r => r.to.includes('IST') || r.to.includes('SAW')).length;
    const araTransferCount = filteredReservations.filter(r => 
        (!r.from.includes('IST') && !r.from.includes('SAW')) && 
        (!r.to.includes('IST') && !r.to.includes('SAW'))
    ).length;

    return (<>
        <div className="w-full">
            {/* Transfer Özeti (sticky) */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 sticky top-4 z-50 border border-gray-200">
                <div className="text-sm text-gray-600">
                    <span className="font-medium">Toplam {filteredReservations.length} Transfer</span>
                    {filteredReservations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                {karsilamaCount} Karşılama
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                                {cikisCount} Çıkış
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                {araTransferCount} Ara Transfer
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Acente Filtreleme - Sadece Superuser için */}
            {user?.role === 'SUPERUSER' && tenants.length > 0 && (
                <div className="mb-4">
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Acente Filtresi:
                            </label>
                            <select
                                value={selectedTenant}
                                onChange={(e) => setSelectedTenant(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
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
                                <label className="block text-xs text-gray-500 mb-1">Sayfa Boyutu</label>
                                <select value={pageSize} onChange={(e)=>setPageSize(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <button onClick={()=>fetchReservations()} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Uygula</button>
                        </div>
                    }
                />
            </div>

            {/* Desktop Tablo */}
            <div className="hidden lg:block bg-white shadow-lg rounded-xl border border-gray-200 overflow-x-auto">
                <div>
                    <table className="w-full min-w-[1200px] xl:min-w-[1360px] table-auto">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                                    Voucher
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                                    Tip
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                    Tarih
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Güzergah
                                </th>
                                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Müşteri
                                </th>
                                {user?.role === 'SUPERUSER' && (
                                    <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                        Acente
                                    </th>
                                )}
                                {(user?.role === 'SUPERUSER' || user?.role === 'AGENCY_ADMIN') && (
                                    <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                        Kullanıcı
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                                    Fiyat
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">
                                    Şoför
                                </th>
                                {(user?.role === 'SUPERUSER' || flightEnabled) && (
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                        Uçuş Durumu
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">
                                    Durum
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                    Ödeme
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-44">
                                    İşlem
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredReservations.length === 0 ? (
                                <tr>
                                    <td colSpan={
                                        (user?.role === 'SUPERUSER' ? 1 : 0) + // Acente sütunu
                                        (user?.role === 'SUPERUSER' || user?.role === 'AGENCY_ADMIN' ? 1 : 0) + // Kullanıcı sütunu
                                        6 + // VOUCHER, TİP, TARİH, GÜZERGAH, MÜŞTERİ, FİYAT
                                        1 + // Şoför
                                        ((user?.role === 'SUPERUSER' || flightEnabled) ? 1 : 0) + // Uçuş Durumu
                                        3 + // Durum, Ödeme, İşlem
                                        0
                                    } className="px-3 py-4 text-center text-gray-500">
                                        Rezervasyon bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredReservations.map((reservation) => {
                                    const isUrgent = isWithinTwoHours(reservation.date, reservation.time);
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
                                            className={`transition-all duration-200 cursor-pointer ${
                                                isUrgent ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' : 'hover:bg-gray-50 hover:shadow-sm'
                                            }`}>
                                            <td className="px-6 py-4 text-sm font-bold text-purple-700 align-middle">
                                                <div className="text-purple-700 font-mono text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200 inline-block">
                                                    {reservation.voucherNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 align-middle">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold min-w-[80px] ${
                                                        reservation.from.includes('IST') || reservation.from.includes('SAW') 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}>
                                                        {reservation.from.includes('IST') || reservation.from.includes('SAW') 
                                                            ? 'Karşılama'
                                                            : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                                ? 'Çıkış'
                                                                : 'Ara Transfer'
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 align-middle">
                                                {new Date(reservation.date).toLocaleDateString('tr-TR')}
                                                <div className={`text-xs ${isUrgent ? 'text-red-600 font-medium animate-pulse' : 'text-gray-500'}`}>
                                                    {reservation.time}
                                                    {isUrgent && ' ⚠️'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words align-top">
                                                <div className="flex flex-col space-y-2">
                                                    {/* Güzergah Bilgisi - Temiz ve Düzenli */}
                                                    <div className="flex items-start">
                                                        <div className="flex flex-col flex-1">
                                                            <div className="text-sm font-medium text-gray-900 whitespace-normal break-words leading-tight" title={formattedFrom}>
                                                                {formattedFrom}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-center w-8 px-1">
                                                            <span className="text-gray-400 text-lg">→</span>
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <div className="text-sm font-medium text-gray-900 whitespace-normal break-words leading-tight" title={formattedTo}>
                                                                {formattedTo}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Uçuş Kodu - Ayrı Bir Bölümde */}
                                                    {reservation.flightCode && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-blue-600 text-xs font-medium">✈️ Uçuş:</span>
                                                                <span className="text-blue-800 text-xs font-mono bg-blue-100 px-2 py-1 rounded">
                                                                    {reservation.flightCode.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 align-top">
                                                <div className="flex flex-col">
                                                    <div className="font-medium whitespace-normal break-words leading-tight" title={formattedPassengerNames.join(', ')}>
                                                        {formattedPassengerNames.join(', ')}
                                                    </div>
                                                    {reservation.phoneNumber && (
                                                        <div className="text-xs text-gray-500 mt-1 whitespace-normal break-words" title={formatPhoneNumber(reservation.phoneNumber)}>
                                                            {formatPhoneNumber(reservation.phoneNumber)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {user?.role === 'SUPERUSER' && (
                                                <td className="px-6 py-4 text-sm text-gray-900 align-middle">
                                                    <div className="font-medium text-blue-600">
                                                        {reservation.tenant?.companyName || 'Bilinmiyor'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {reservation.tenant?.subdomain || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            {(user?.role === 'SUPERUSER' || user?.role === 'AGENCY_ADMIN') && (
                                                <td className="px-6 py-4 text-sm text-gray-900 align-middle">
                                                    <div className="font-medium text-green-600">
                                                        {reservation.user?.name || reservation.user?.username || 'Bilinmiyor'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {reservation.user?.username || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-gray-900 align-middle">
                                                <div className="font-semibold text-green-600">{reservation.price} {reservation.currency}</div>
                                                {reservation.distanceKm && (
                                                    <div className="text-xs text-gray-500">
                                                        {reservation.distanceKm.toFixed(1)} km
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 align-middle">
                                                {reservation.driver ? (
                                                    <div>
                                                        <div className="font-medium">{reservation.driver.name}</div>
                                                        <div className="text-xs text-gray-500">{reservation.driver.phoneNumber}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            {(user?.role === 'SUPERUSER' || flightEnabled) && (
                                                <td className="px-6 py-4 text-sm align-middle">
                                                    {reservation.flightCode ? (
                                                        <FlightStatus 
                                                            flightCode={reservation.flightCode}
                                                            reservationDate={reservation.date}
                                                            reservationTime={reservation.time}
                                                            isArrival={reservation.from.includes('IST') || reservation.from.includes('SAW')}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm align-middle">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    reservation.driver ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                    {reservation.driver ? 'Atandı' : 'Bekliyor'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm align-middle">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        reservation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                        reservation.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                        'bg-red-100 text-red-800 border border-red-200'
                                                    }` }>
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
                                                                onClick={() => window.location.href = `/admin/reservations/${reservation.voucherNumber}?edit=driver`}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm transition-colors"
                                                            >
                                                                Şoför Ata
                                                            </button>
                                                            <button
                                                                onClick={() => setReturnTransferModal({ isOpen: true, reservation })}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors"
                                                                title="Dönüş Transferi Ekle"
                                                            >
                                                                🔄
                                                            </button>
                                                            <Link 
                                                                href={`/admin/reservations/${reservation.voucherNumber}/customer-voucher`}
                                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                title="Müşteri Voucherı"
                                                            >
                                                                🎫
                                                            </Link>
                                                            <Link 
                                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                title="Rezervasyonu Düzenle"
                                                            >
                                                                ✏️
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => setReturnTransferModal({ isOpen: true, reservation })}
                                                                className="w-8 h-8 flex items-center justify-center border border-transparent text-lg font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
                                                                title="Dönüş Transferi Ekle"
                                                            >
                                                                🔄
                                                            </button>
                                                            <Link 
                                                                href={`/admin/reservations/${reservation.voucherNumber}/driver-voucher`}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-xl font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                                                                title="Şoför Voucherı"
                                                            >
                                                                👨‍✈️
                                                            </Link>
                                                            <Link 
                                                                href={`/admin/reservations/${reservation.voucherNumber}/customer-voucher`}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-xl font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                                                                title="Müşteri Voucherı"
                                                            >
                                                                🎫
                                                            </Link>
                                                            <Link 
                                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 text-xl font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
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
                    <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
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
                                className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-colors duration-150 ${
                                    isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-blue-600">
                                                {reservation.voucherNumber}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                reservation.from.includes('IST') || reservation.from.includes('SAW') 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {reservation.from.includes('IST') || reservation.from.includes('SAW') 
                                                    ? 'Karşılama'
                                                    : reservation.to.includes('IST') || reservation.to.includes('SAW')
                                                        ? 'Çıkış'
                                                        : 'Ara Transfer'
                                                }
                                            </span>
                                        </div>
                                        <div className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
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
                                    <div className="text-sm text-gray-600 mb-1">Güzergah:</div>
                                    <div className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="flex-1">{formattedFrom}</span>
                                            <span className="text-gray-400">→</span>
                                            <span className="flex-1">{formattedTo}</span>
                                        </div>
                                        {reservation.flightCode && (
                                            <div className="mt-1">
                                                <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200 mb-1">
                                                    ✈️ {reservation.flightCode.toUpperCase()}
                                                </div>
                                                <FlightStatus 
                                                    flightCode={reservation.flightCode}
                                                    reservationDate={reservation.date}
                                                    reservationTime={reservation.time}
                                                    isArrival={reservation.from.includes('IST') || reservation.from.includes('SAW')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Müşteri */}
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 mb-1">Müşteri:</div>
                                    <div className="text-sm font-medium">{formattedPassengerNames.join(', ')}</div>
                                    {reservation.phoneNumber && (
                                        <div className="text-xs text-gray-500">
                                            {formatPhoneNumber(reservation.phoneNumber)}
                                        </div>
                                    )}
                                </div>

                                {/* Şoför ve Durum */}
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Şoför:</div>
                                        {reservation.driver ? (
                                            <div className="text-sm">
                                                <div className="font-medium">{reservation.driver.name}</div>
                                                <div className="text-xs text-gray-500">{reservation.driver.phoneNumber}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            reservation.driver ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {reservation.driver ? 'Atandı' : 'Bekliyor'}
                                        </span>
                                    </div>
                                </div>

                                {/* Ödeme Durumu */}
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Ödeme:</div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            reservation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                            reservation.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
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
                                                className="text-xs text-gray-500 hover:text-gray-700 p-1"
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
                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                    {!reservation.driver ? (
                                        <>
                                            <button
                                                onClick={() => window.location.href = `/admin/reservations/${reservation.voucherNumber}?edit=driver`}
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
                                                href={`/admin/reservations/${reservation.voucherNumber}/customer-voucher`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Müşteri
                                            </Link>
                                            <Link 
                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
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
                                                href={`/admin/reservations/${reservation.voucherNumber}/driver-voucher`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Şoför
                                            </Link>
                                            <Link 
                                                href={`/admin/reservations/${reservation.voucherNumber}/customer-voucher`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Müşteri
                                            </Link>
                                            <Link 
                                                href={`/admin/reservations/${reservation.voucherNumber}/edit`}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
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
                    onClick={() => { if (page > 1) { setPage(page-1); fetchReservations(); } }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
                    disabled={page === 1}
                >Önceki</button>
                <div className="text-sm text-gray-600">Sayfa {page}</div>
                <button
                    onClick={() => { setPage(page+1); fetchReservations(); }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
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