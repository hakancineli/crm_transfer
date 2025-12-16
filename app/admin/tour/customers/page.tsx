'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import Link from 'next/link';
import TourCustomerModal from './TourCustomerModal';

interface Customer {
    id: string;
    name: string;
    surname?: string;
    email?: string;
    phone?: string;
    passportNumber?: string;
    nationality?: string;
    createdAt: string;
    _count?: {
        tourBookings: number;
    };
}

export default function TourCustomersPage() {
    const { user } = useAuth();
    const { isEnabled, isLoading: moduleLoading } = useModule('tour');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (isEnabled) {
            fetchCustomers();
        }
    }, [isEnabled]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isEnabled) {
                fetchCustomers(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, isEnabled]);

    const fetchCustomers = async (search = '') => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await fetch(`/api/tour-customers?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (moduleLoading) return <div className="p-8">Yükleniyor...</div>;
    if (!isEnabled) return <div className="p-8">Modül kapalı.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
                        <p className="mt-2 text-gray-600">Tur müşterilerini görüntüleyin ve yönetin</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Yeni Müşteri Ekle
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <input
                        type="text"
                        placeholder="İsim, e-posta, telefon veya pasaport no ile ara..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim Soyisim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İletişim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasaport / Uyruk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tur Geçmişi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                                <th className="px-6 py-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Yükleniyor...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Müşteri bulunamadı.</td></tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{customer.name} {customer.surname}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                                            <div className="text-sm text-gray-500">{customer.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.passportNumber || '-'}</div>
                                            <div className="text-sm text-gray-500">{customer.nationality}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                {customer._count?.tourBookings || 0} Tur
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/admin/tour/customers/${customer.id}`} className="text-blue-600 hover:text-blue-900">
                                                Detay
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Placeholder - will implement separately if needed or redirect to new page */}

            <TourCustomerModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={() => fetchCustomers()}
            />
        </div>
    );
}
