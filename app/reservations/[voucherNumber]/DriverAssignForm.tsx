'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Driver {
    id: string;
    name: string;
    phoneNumber?: string;
}

interface DriverAssignFormProps {
    reservation: {
        id: string;
        voucherNumber: string;
        date: string;
        time: string;
        from: string;
        to: string;
        passengerNames: string | string[]; // Dizi veya string tipi olacak şekilde değiştirildi
        luggageCount?: number | null;
    };
    onAssign?: (driverId: string, driverFee: number) => Promise<void>;
}

export default function DriverAssignForm({ reservation, onAssign }: DriverAssignFormProps) {
    const [newDriver, setNewDriver] = useState({ name: '', phoneNumber: '' });
    const [driverFee, setDriverFee] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Yolcu sayısını güvenli bir şekilde hesapla
    const getPassengerCount = () => {
        try {
            // Eğer passengerNames bir string ise, JSON.parse ile diziye dönüştür.
            const names = Array.isArray(reservation.passengerNames) 
                ? reservation.passengerNames 
                : JSON.parse(reservation.passengerNames); 
            return names.length; 
        } catch (e) {
            return 1; // Eğer parse edilemezse, 1 olarak kabul et
        }
    };

    const handleNewDriverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDriver.name || !newDriver.phoneNumber || !driverFee) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const driverResponse = await fetch('/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDriver),
            });

            if (!driverResponse.ok) {
                throw new Error('Şoför eklenirken bir hata oluştu');
            }

            const createdDriver = await driverResponse.json();

            const updateResponse = await fetch(`/api/reservations/${reservation.voucherNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    driverId: createdDriver.id,
                    driverFee: parseFloat(driverFee)
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Şoför ataması yapılırken bir hata oluştu');
            }

            if (onAssign) {
                await onAssign(createdDriver.id, parseFloat(driverFee));
            }

            router.push(`/reservations/${reservation.voucherNumber}/driver-voucher`);
            router.refresh();
        } catch (error) {
            console.error('Şoför atama hatası:', error);
            setError(error instanceof Error ? error.message : 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Başlık */}
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Yeni Şoför Ekle ve Ata</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Rezervasyon No: {reservation.voucherNumber}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleNewDriverSubmit} className="p-6">
                    {/* Hata Mesajı */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Şoför Bilgileri */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Şoför Bilgileri</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Şoför Adı
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newDriver.name}
                                        onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Ad Soyad"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefon Numarası
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 001.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="tel"
                                            value={newDriver.phoneNumber}
                                            onChange={(e) => setNewDriver(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            placeholder="0555 555 5555"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hakediş Bilgisi */}
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Hakediş Bilgisi</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hakediş Tutarı
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₺</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={driverFee}
                                        onChange={(e) => setDriverFee(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 pl-8 pr-12 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="0.00"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">TL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transfer Detayları */}
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Detayları</h3>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">Tarih & Saat</p>
                                    <p className="font-medium mt-1">{reservation.date} - {reservation.time}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Yolcu & Bagaj</p>
                                    <p className="font-medium mt-1">{getPassengerCount()} Yolcu, {reservation.luggageCount ?? 0} Bagaj</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Güzergah</p>
                                    <p className="font-medium mt-1">{reservation.from} → {reservation.to}</p>
                                </div>
                            </div>
                        </div>

                        {/* Butonlar */}
                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    'Şoför Ata'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
