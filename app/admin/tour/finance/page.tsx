'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';

interface DebtorBooking {
    id: string;
    voucherNumber: string;
    routeName: string;
    customer?: {
        name: string;
        phone: string;
    };
    tourDate: string;
    price: number;
    paidAmount: number;
    remainingAmount: number;
    currency: string;
    paymentStatus: string;
    groupSize: number;
}

export default function TourFinancePage() {
    const { user } = useAuth();
    const [debtors, setDebtors] = useState<DebtorBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && canViewTourModule(user.role, user.permissions)) {
            fetchDebtors();
        }
    }, [user]);

    const fetchDebtors = async () => {
        try {
            setLoading(true);
            // Fetch all bookings and filter client-side or use a specific API params if supported
            // Ideally we should add ?paymentStatus=PENDING,PARTIAL to the API
            // For now, let's fetch recent bookings and filter. 
            // Optimized approach: Fetch from /api/tour-bookings but we need to ensure it returns enough data.
            // Let's assume we can fetch enough or if pagination is an issue, we strictly need a 'debtors' endpoint.
            // Let's try to reuse /api/tour-bookings

            const res = await fetch('/api/tour-bookings?limit=100');
            if (res.ok) {
                const data = await res.json();
                const allBookings: any[] = data.bookings || data;

                // Enhance with 'remainingAmount' calculation if not present on API response yet (though we added it)
                const unpaid = allBookings.filter(b =>
                    b.status !== 'CANCELLED' &&
                    (b.paymentStatus === 'PENDING' || b.paymentStatus === 'PARTIAL')
                ).map(b => ({
                    ...b,
                    remainingAmount: b.remainingAmount || (b.price - (b.paidAmount || 0))
                }));

                // Sort by Tour Date (Oldest first - urgent)
                unpaid.sort((a, b) => new Date(a.tourDate).getTime() - new Date(b.tourDate).getTime());

                setDebtors(unpaid);
            }
        } catch (error) {
            console.error('Borçlu listesi hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendReminder = (booking: DebtorBooking) => {
        const phone = booking.customer?.phone;
        if (!phone) {
            alert('Müşteri telefonu kayıtlı değil.');
            return;
        }

        const msg = `Sayın ${booking.customer?.name || 'Müşteri'}, \n${new Date(booking.tourDate).toLocaleDateString('tr-TR')} tarihli ${booking.routeName} turu için kalan borcunuz: ${booking.remainingAmount} ${booking.currency}. \nLütfen ödemenizi tamamlayınız.`;
        const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 rounded-full border-t-transparent"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Finans Takibi (Borçlular)</h1>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Toplam Bekleyen Tahsilat</div>
                        <div className="text-2xl font-bold text-red-600">
                            {debtors.reduce((acc, curr) => acc + curr.remainingAmount, 0).toLocaleString('tr-TR')} (Karma)
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {debtors.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Harika! Hiç borçlu kaydı bulunmuyor. 🎉
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher / Tarih</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kalan Tutar</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {debtors.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.voucherNumber}</div>
                                                <div className="text-xs text-gray-500">{new Date(booking.tourDate).toLocaleDateString('tr-TR')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.customer?.name || 'İsimsiz'}</div>
                                                <div className="text-xs text-gray-500">{booking.customer?.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {booking.routeName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {booking.paymentStatus === 'PARTIAL' ? 'Kısmi Ödeme' : 'Bekliyor'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-red-600">
                                                {booking.remainingAmount} {booking.currency}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => sendReminder(booking)}
                                                    className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-xs flex items-center gap-1 ml-auto"
                                                >
                                                    <span>📱</span> Hatırlat
                                                </button>
                                                <Link href={`/admin/tour/reservations/${booking.id}/edit`} className="text-blue-600 hover:text-blue-900 text-xs mt-2 block">
                                                    Düzenle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
