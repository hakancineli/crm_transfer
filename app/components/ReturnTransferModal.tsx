'use client';

import { useState } from 'react';

interface ReturnTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalReservation: {
        voucherNumber: string;
        from: string;
        to: string;
        date: string;
        time: string;
    };
    onSuccess: () => void;
}

export default function ReturnTransferModal({ 
    isOpen, 
    onClose, 
    originalReservation, 
    onSuccess 
}: ReturnTransferModalProps) {
    const [returnDate, setReturnDate] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Set default return date to tomorrow
    useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setReturnDate(tomorrow.toISOString().split('T')[0]);
        setReturnTime('09:00'); // Default time
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!returnDate || !returnTime) {
            setError('Lütfen tarih ve saat seçin');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch('/api/reservations/return-transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    originalVoucherNumber: originalReservation.voucherNumber,
                    returnDate,
                    returnTime
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Dönüş transferi oluşturulamadı');
            }

            const result = await response.json();
            
            onSuccess();
            onClose();
            // Rezervasyon listesine dön
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/reservations';
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl dark:shadow-none max-w-md w-full border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        Dönüş Transferi Ekle
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        {originalReservation.voucherNumber} için dönüş transferi
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4">
                    {/* Route Preview */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors duration-200">
                        <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">Güzergah:</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            <div className="text-green-600">🔄 {originalReservation.to}</div>
                            <div className="text-blue-600">➡️ {originalReservation.from}</div>
                        </div>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Dönüş Tarihi *
                            </label>
                            <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                Dönüş Saati *
                            </label>
                            <input
                                type="time"
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm font-medium text-gray-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors duration-200"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Oluşturuluyor...' : 'Dönüş Transferi Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
