'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { canViewTourModule } from '@/app/lib/permissions';
import Link from 'next/link';
import TourModal from './TourModal';

export default function ScheduledToursPage() {
    const { user } = useAuth();
    const { isEnabled: tourEnabled, isLoading } = useModule('tour');

    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTour, setSelectedTour] = useState<any>(null);

    useEffect(() => {
        if (tourEnabled) {
            fetchTours();
        }
    }, [tourEnabled]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/tours', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setTours(data);
            }
        } catch (error) {
            console.error('Tours fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) return <div className="p-8">Yükleniyor...</div>;
    if (!user || !canViewTourModule(user.role, user.permissions)) return <div>Yetkisiz erişim</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Planlı Turlar</h1>
                        <p className="mt-2 text-gray-600">Tur hareketlerini ve araç planlamasını yönetin</p>
                    </div>
                    <button
                        onClick={() => { setSelectedTour(null); setShowModal(true); }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        + Yeni Planla
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {tours.length > 0 ? tours.map((tour) => (
                            <li key={tour.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedTour(tour); setShowModal(true); }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-lg font-medium text-blue-600 truncate">{tour.route?.name}</p>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <span className="mr-4">📅 {new Date(tour.startDate).toLocaleDateString('tr-TR')} {tour.startTime}</span>
                                                <span>🚌 {tour.vehicle ? `${tour.vehicle.licensePlate} (${tour.vehicle.capacity})` : 'Araç Atanmamış'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tour.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {tour.status}
                                            </span>
                                            <span className="text-sm text-gray-500 mt-1">
                                                Doluluk: {tour.occupancy} / {tour.capacity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        )) : (
                            <li className="px-4 py-8 text-center text-gray-500">Planlanmış tur bulunamadı.</li>
                        )}
                    </ul>
                </div>

                <TourModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={() => fetchTours()}
                    tour={selectedTour}
                />
            </div>
        </div>
    );
}
