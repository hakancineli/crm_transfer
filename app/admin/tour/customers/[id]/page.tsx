'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useModule } from '@/app/hooks/useModule';
import Link from 'next/link';
import TourCustomerModal from '../TourCustomerModal';

interface TourBooking {
    id: string;
    voucherNumber: string;
    routeName: string;
    tourDate: string;
    vehicleType: string;
    price: number;
    currency: string;
    status: string;
}

interface Customer {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    passportNumber: string;
    nationality: string;
    notes: string;
    createdAt: string;
    tourBookings?: TourBooking[];
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { isEnabled, isLoading: moduleLoading } = useModule('tour');

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (isEnabled && id) {
            fetchCustomer();
        }
    }, [isEnabled, id]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tour-customers/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCustomer(data);
            } else {
                alert('Müşteri bulunamadı');
                router.push('/admin/tour/customers');
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tour-customers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                router.push('/admin/tour/customers');
            } else {
                alert('Silinirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    if (moduleLoading || loading) return <div className="p-8">Yükleniyor...</div>;
    if (!customer) return <div className="p-8">Müşteri bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/tour/customers" className="text-gray-500 hover:text-gray-700">← Geri</Link>
                        <h1 className="text-3xl font-bold text-gray-900">{customer.name} {customer.surname}</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Düzenle
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Sil
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow h-fit">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Müşteri Bilgileri</h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-500 block">E-posta</span>
                                <span className="font-medium">{customer.email || '-'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Telefon</span>
                                <span className="font-medium">{customer.phone || '-'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Pasaport No</span>
                                <span className="font-medium">{customer.passportNumber || '-'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Uyruk</span>
                                <span className="font-medium">{customer.nationality || '-'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Notlar</span>
                                <p className="text-gray-700 text-sm">{customer.notes || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">Kayıt Tarihi</span>
                                <span className="text-sm">{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bookings History */}
                    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Tur Geçmişi ({customer.tourBookings?.length || 0})</h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Voucher</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {customer.tourBookings && customer.tourBookings.length > 0 ? (
                                        customer.tourBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {new Date(booking.tourDate).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {booking.routeName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-blue-600">
                                                    <Link href={`/admin/reservations/${booking.voucherNumber}`}>
                                                        {booking.voucherNumber}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {booking.price} {booking.currency}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                Henüz tur kaydı yok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <TourCustomerModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={() => fetchCustomer()}
                    customer={customer}
                />
            </div>
        </div>
    );
}
