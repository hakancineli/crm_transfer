'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EditReservationForm from '@/app/components/EditReservationForm';

export default function EditReservationPage() {
    const params = useParams();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const voucherNumber = params.voucherNumber as string;

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/reservations/${voucherNumber}`);
                
                if (!response.ok) {
                    throw new Error('Rezervasyon bulunamadı');
                }
                
                const data = await response.json();
                setReservation(data);
            } catch (err) {
                console.error('Rezervasyon getirme hatası:', err);
                setError(err instanceof Error ? err.message : 'Rezervasyon yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        if (voucherNumber) {
            fetchReservation();
        }
    }, [voucherNumber]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Rezervasyon Bulunamadı</h1>
                    <p className="text-gray-600">{error || 'Bu voucher numarasına ait rezervasyon bulunamadı.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Rezervasyon Düzenle</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Voucher No: {voucherNumber}
                </p>
            </div>
            <EditReservationForm
                voucherNumber={voucherNumber}
                initialData={reservation}
            />
        </div>
    );
} 