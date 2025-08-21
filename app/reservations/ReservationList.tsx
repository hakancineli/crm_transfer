'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchAndFilter } from '@/app/components/ui/SearchAndFilter';
import { AIRPORTS, HOTELS, TRANSFER_TYPES } from '@/app/types';
import { formatLocation, formatPassengerName, formatHotelName } from '@/app/utils/textFormatters';

interface Reservation {
    id: string;
    voucherNumber: string;
    date: string;
    time: string;
    from: string;
    to: string;
    flightCode?: string;
    luggageCount?: number;
    passengerNames: string[];
    price: number;
    currency: string;
    driverFee?: number;
    phoneNumber?: string;
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
    driver?: {
        id: string;
        name: string;
        phoneNumber: string;
    } | null;
    paymentStatus: string;
}

interface ReservationListProps {
    onFilterChange: (filter: string) => void;
}

export default function ReservationList({ onFilterChange }: ReservationListProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await fetch('/api/reservations');
            const data = await response.json();
            
            // Eğer hata objesi dönerse veya veri dizi değilse, boş dizi kullan
            const sortedData = Array.isArray(data)
                ? data.sort((a: Reservation, b: Reservation) => {
                    const dateA = new Date(`${a.date} ${a.time}`).getTime();
                    const dateB = new Date(`${b.date} ${b.time}`).getTime();
                    return dateA - dateB;
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        switch (filter) {
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

            // Listeyi yenile
            await fetchReservations();
        } catch (error) {
            console.error('Ödeme durumu güncelleme hatası:', error);
        } finally {
            setUpdateLoading(null);
        }
    };

    const isWithinTwoHours = (dateStr: string, timeStr: string) => {
        const transferTime = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diffInHours = (transferTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffInHours >= 0 && diffInHours <= 2;
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

    return (
        <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Transfer Özeti */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="text-sm text-gray-600">
                    <span className="font-medium">Toplam {filteredReservations.length} Transfer</span>
                    {filteredReservations.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {karsilamaCount} Karşılama
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {cikisCount} Çıkış
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {araTransferCount} Ara Transfer
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Arama ve Filtreleme */}
            <div className="mb-6">
                <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
            </div>

            {/* Tablo Container */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-visible">
                <div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Voucher
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tip
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Güzergah
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Müşteri
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fiyat
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Şoför
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ödeme
                                </th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlem
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReservations.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-3 py-4 text-center text-gray-500">
                                        Rezervasyon bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredReservations.map((reservation) => {
                                    const isUrgent = isWithinTwoHours(reservation.date, reservation.time);
                                    const formattedFrom = formatLocation(reservation.from);
                                    const formattedTo = formatLocation(reservation.to);
                                    const formattedPassengerNames = Array.isArray(reservation.passengerNames)
                                        ? reservation.passengerNames.map(name => formatPassengerName(name))
                                        : typeof reservation.passengerNames === 'string'
                                            ? JSON.parse(reservation.passengerNames).map((name: string) => formatPassengerName(name))
                                            : [];
                                    
                                    return (
                                        <tr key={reservation.id} 
                                            onClick={(e) => {
                                                if (!(e.target as HTMLElement).closest('button, a, select')) {
                                                    window.location.href = `/reservations/${reservation.voucherNumber}`;
                                                }
                                            }}
                                            className={`transition-colors duration-150 cursor-pointer ${
                                                isUrgent ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                                            }`}>
                                            <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {reservation.voucherNumber}
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(reservation.date).toLocaleDateString('tr-TR')}
                                                <div className={`text-xs ${isUrgent ? 'text-red-600 font-medium animate-pulse' : 'text-gray-500'}`}>
                                                    {reservation.time}
                                                    {isUrgent && ' ⚠️'}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-900">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center">
                                                        <div className="flex flex-col flex-1">
                                                            <div className="whitespace-nowrap">{formattedFrom}</div>
                                                            {reservation.from.includes('IST') || reservation.from.includes('SAW') ? (
                                                                <span className="text-xs text-gray-400">
                                                                    {reservation.flightCode && `✈️ ${reservation.flightCode.toUpperCase()}`}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="flex items-center justify-center w-8">
                                                            <span className="text-gray-400">→</span>
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <div className="whitespace-nowrap">{formattedTo}</div>
                                                            {reservation.to.includes('IST') || reservation.to.includes('SAW') ? (
                                                                <span className="text-xs text-gray-400">
                                                                    {reservation.flightCode && `✈️ ${reservation.flightCode.toUpperCase()}`}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-900">
                                                <div className="flex flex-col">
                                                    <div className="font-medium whitespace-nowrap">
                                                        {formattedPassengerNames.join(', ')}
                                                    </div>
                                                    {reservation.phoneNumber && (
                                                        <div className="text-xs text-gray-500">
                                                            {reservation.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                                                <div className="font-medium">{reservation.price} {reservation.currency}</div>
                                            </td>
                                            <td className="px-2 py-2 text-sm text-gray-900">
                                                {reservation.driver ? (
                                                    <div>
                                                        <div className="font-medium">{reservation.driver.name}</div>
                                                        <div className="text-xs text-gray-500">{reservation.driver.phoneNumber}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    reservation.driver ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {reservation.driver ? 'Atandı' : 'Bekliyor'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        reservation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                                        reservation.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
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
                                            <td className="px-2 py-2 text-sm font-medium">
                                                <div className="flex items-center space-x-1">
                                                    {!reservation.driver ? (
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={() => window.location.href = `/reservations/${reservation.voucherNumber}?edit=driver`}
                                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                            >
                                                                Şoför Ata
                                                            </button>
                                                            <Link 
                                                                href={`/reservations/${reservation.voucherNumber}/edit`}
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                title="Rezervasyonu Düzenle"
                                                            >
                                                                ✏️
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="flex space-x-1">
                                                            <Link 
                                                                href={`/reservations/${reservation.voucherNumber}?view=driver`}
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                            >
                                                                👨‍✈️
                                                            </Link>
                                                            <Link 
                                                                href={`/reservations/${reservation.voucherNumber}?view=customer`}
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                            >
                                                                🎫
                                                            </Link>
                                                            <Link 
                                                                href={`/reservations/${reservation.voucherNumber}/edit`}
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
        </div>
    );
}