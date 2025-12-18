'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/app/lib/api';
import SeatMap from '../../components/SeatMap';

interface PassengerDetail {
    seatNumber: string;
    name: string;
    surname: string;
    paymentStatus?: string;
    amount?: number;
}

interface TourBooking {
    id: string;
    voucherNumber: string;
    routeName: string;
    vehicleType: string;
    groupSize: number;
    price: number;
    currency: string;
    pickupLocation: string;
    tourDate: string;
    tourTime: string;
    status: string;
    passengerNames: string[];
    passengerDetails: PassengerDetail[];
    notes: string;
    createdAt: string;
    customer?: {
        name: string;
        surname: string;
        phone: string;
    };
    driver?: {
        id: string;
        name: string;
        phoneNumber: string;
    };
}

const VEHICLE_TYPES = [
    { id: 'VITO', name: 'Mercedes Vito', capacity: 6 },
    { id: 'SPRINTER_SHORT', name: 'Mercedes Sprinter (Kısa)', capacity: 12 },
    { id: 'SPRINTER_LONG', name: 'Mercedes Sprinter (Uzun)', capacity: 16 },
    { id: 'BUS_MID', name: 'Midibüs', capacity: 27 },
    { id: 'BUS_LARGE', name: 'Otobüs', capacity: 46 }
];

export default function TourBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;
    const [booking, setBooking] = useState<TourBooking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`/api/tour-bookings/${bookingId}`);
            if (response.ok) {
                const data = await response.json();
                setBooking(data);
            } else {
                console.error('Rezervasyon bulunamadı');
            }
        } catch (error) {
            console.error('Hata:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Rezervasyon Bulunamadı</h1>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline">Geri Dön</button>
            </div>
        );
    }

    const occupiedSeats = (booking.passengerDetails || []).map(p => p.seatNumber);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/admin/tour/reservations" className="text-gray-500 hover:text-gray-700">
                                ← Geri
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Detayı</h1>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
                                {booking.voucherNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {booking.status === 'CONFIRMED' ? 'Onaylandı' : 'Beklemede'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/admin/tour/reservations/${booking.id}/edit`}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-2"
                        >
                            <span>✏️</span> Düzenle
                        </Link>
                        <Link
                            href={`/admin/tour/reservations/${booking.id}/customer-voucher`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                        >
                            <span>🎫</span> Müşteri Voucherı
                        </Link>
                        <Link
                            href={`/admin/tour/reservations/${booking.id}/driver-voucher`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"
                        >
                            <span>👨‍✈️</span> Şoför Voucherı
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tour & Customer Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Tur ve Müşteri Bilgileri</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tur Detayları</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rota:</span>
                                            <span className="font-medium text-gray-900">{booking.routeName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tarih:</span>
                                            <span className="font-medium text-gray-900">{new Date(booking.tourDate).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Saat:</span>
                                            <span className="font-medium text-gray-900">{booking.tourTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Araç:</span>
                                            <span className="font-medium text-gray-900">{booking.vehicleType}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Müşteri Detayları</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ad Soyad:</span>
                                            <span className="font-medium text-gray-900">
                                                {booking.customer ? `${booking.customer.name} ${booking.customer.surname}` : 'Belirtilmedi'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Telefon:</span>
                                            <span className="font-medium text-blue-600">{booking.customer?.phone || 'Belirtilmedi'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Grup Boyutu:</span>
                                            <span className="font-medium text-gray-900">{booking.groupSize} Kişi</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Alınacak Yer:</span>
                                            <span className="font-medium text-gray-900">{booking.pickupLocation || 'Belirtilmedi'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Passenger & Seating List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">Yolcu ve Koltuk Listesi</h2>
                                <span className="text-sm text-gray-500">{booking.passengerDetails?.length || 0} Yolcu</span>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {(booking.passengerDetails || []).map((passenger) => (
                                        <div key={passenger.seatNumber} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white font-bold rounded-full shadow-sm flex-shrink-0">
                                                {passenger.seatNumber}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="font-bold text-gray-900 text-lg uppercase">{passenger.name} {passenger.surname}</div>
                                                <div className="flex items-center gap-4 mt-1 text-sm">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${passenger.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {passenger.paymentStatus === 'PAID' ? 'Ödendi' : 'Ödenmedi'}
                                                    </span>
                                                    {passenger.amount && (
                                                        <span className="text-gray-600 font-medium">{passenger.amount} {booking.currency}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const phone = booking.customer?.phone;
                                                        if (!phone) {
                                                            alert('Müşteri telefon numarası bulunamadı.');
                                                            return;
                                                        }
                                                        const baseUrl = window.location.origin;
                                                        const voucherUrl = `${baseUrl}/admin/tour/reservations/${booking.id}/customer-voucher?seat=${passenger.seatNumber}`;
                                                        const date = new Date(booking.tourDate).toLocaleDateString('tr-TR');
                                                        const msg = `Sayın ${passenger.name} ${passenger.surname},\n\n${date} tarihli ${booking.routeName} turu için biniş kartınız (Koltuk: ${passenger.seatNumber}) hazırdır.\n\nBiniş Kartı: ${voucherUrl}`;
                                                        const waUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
                                                        window.open(waUrl, '_blank');
                                                    }}
                                                    className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 flex items-center gap-1 shadow-sm"
                                                    title="WhatsApp ile biniş kartı gönder"
                                                >
                                                    <span>📱</span> Gönder
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!booking.passengerDetails || booking.passengerDetails.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            Yolcu detayları bulunmuyor.
                                            <div className="text-xs mt-2">
                                                {booking.passengerNames?.join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        {booking.notes && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-lg font-semibold text-gray-900">Notlar</h2>
                                </div>
                                <div className="p-6 text-gray-700 whitespace-pre-wrap">
                                    {booking.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Seat Map Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Koltuk Yerleşimi</h2>
                            </div>
                            <div className="p-6 flex flex-col items-center">
                                <div className="scale-75 origin-top mb-4">
                                    <SeatMap
                                        capacity={VEHICLE_TYPES.find(v => v.id === booking.vehicleType)?.capacity || 16}
                                        selectedSeats={occupiedSeats}
                                        onSelect={() => { }}
                                        occupiedSeats={[]} // Show all selected seats as blue in this view
                                        vehicleType={booking.vehicleType}
                                    />
                                </div>
                                <div className="w-full space-y-2 mt-4 text-sm px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                        <span>Dolu Koltuk</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                                        <span>Boş Koltuk</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Ödeme Özeti</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Toplam Tutar:</span>
                                    <span className="text-green-600">{booking.price} {booking.currency}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-600">Kişi Başı:</span>
                                    <span className="font-medium">{(booking.price / (booking.groupSize || 1)).toFixed(2)} {booking.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
