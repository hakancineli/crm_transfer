'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Airport, AIRPORTS, Currency, CURRENCIES } from '../types';
import { formatLocation, formatPassengerName, formatHotelName } from '@/app/utils/textFormatters';

interface EditReservationFormProps {
    voucherNumber: string;
    initialData: any;
}

export default function EditReservationForm({ voucherNumber, initialData }: EditReservationFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        date: initialData.date,
        time: initialData.time,
        from: formatLocation(initialData.from),
        to: formatLocation(initialData.to),
        flightCode: initialData.flightCode?.toUpperCase() || '',
        luggageCount: initialData.luggageCount || 0,
        passengerNames: Array.isArray(initialData.passengerNames) 
            ? initialData.passengerNames.map((name: string) => formatPassengerName(name))
            : typeof initialData.passengerNames === 'string'
                ? JSON.parse(initialData.passengerNames).map((name: string) => formatPassengerName(name))
                : [''],
        price: initialData.price,
        currency: initialData.currency,
        driverFee: initialData.driverFee || 0,
        phoneNumber: initialData.phoneNumber || '',
        isReturn: initialData.isReturn || false,
        paymentStatus: initialData.paymentStatus || 'PENDING'
    });
    const [customFrom, setCustomFrom] = useState(!Object.keys(AIRPORTS).includes(initialData.from));
    const [customTo, setCustomTo] = useState(!Object.keys(AIRPORTS).includes(initialData.to));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleCancel = () => {
        router.back();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Form verilerini formatla
        const formattedData = {
            ...formData,
            from: formatLocation(formData.from),
            to: formatLocation(formData.to),
            flightCode: formData.flightCode?.toUpperCase(),
            passengerNames: formData.passengerNames.map((name: string) => formatPassengerName(name))
        };

        try {
            const response = await fetch(`/api/reservations/${voucherNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Rezervasyon güncellenemedi');
            }

            router.push('/admin/reservations');
        } catch (error) {
            console.error('Rezervasyon güncelleme hatası:', error);
            setError(error instanceof Error ? error.message : 'Rezervasyon güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Check if user has permission to delete reservations
        const hasDeletePermission = user?.permissions?.some(p => 
            p.permission === 'DELETE_RESERVATIONS' && p.isActive
        );
        
        if (user?.role !== 'SUPERUSER' && !hasDeletePermission) {
            setError('Bu rezervasyonu silme yetkiniz bulunmamaktadır.');
            return;
        }

        if (!window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/reservations/${voucherNumber}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Rezervasyon silinemedi');
            }

            router.push('/admin/reservations');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
            console.error('Silme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePassengerNameChange = (index: number, value: string) => {
        const newPassengerNames = [...formData.passengerNames];
        newPassengerNames[index] = value;
        setFormData(prev => ({
            ...prev,
            passengerNames: newPassengerNames
        }));
    };

    const addPassenger = () => {
        setFormData(prev => ({
            ...prev,
            passengerNames: [...prev.passengerNames, '']
        }));
    };

    const removePassenger = (index: number): void => {
        setFormData(prev => ({
            ...prev,
            passengerNames: prev.passengerNames.filter((_: unknown, i: number) => i !== index)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    Rezervasyon başarıyla güncellendi!
                </div>
            )}

            <div className="overflow-x-hidden w-full">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Tarih</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-2">Saat</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Nereden</label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={!customFrom}
                                    onChange={() => {
                                        setCustomFrom(!customFrom);
                                        if (customFrom) {
                                            setFormData(prev => ({ ...prev, from: 'IST' }));
                                        } else {
                                            setFormData(prev => ({ ...prev, from: '' }));
                                        }
                                    }}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-600">Havalimanı Seç</span>
                            </div>
                            {customFrom ? (
                                <input
                                    type="text"
                                    value={formData.from}
                                    onChange={e => setFormData(prev => ({ ...prev, from: e.target.value }))}
                                    placeholder="Adres giriniz"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            ) : (
                                <select
                                    value={formData.from}
                                    onChange={e => setFormData(prev => ({ ...prev, from: e.target.value }))}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Havalimanı Seçiniz</option>
                                    {Object.entries(AIRPORTS).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">Nereye</label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={!customTo}
                                    onChange={() => {
                                        setCustomTo(!customTo);
                                        if (customTo) {
                                            setFormData(prev => ({ ...prev, to: 'IST' }));
                                        } else {
                                            setFormData(prev => ({ ...prev, to: '' }));
                                        }
                                    }}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-600">Havalimanı Seç</span>
                            </div>
                            {customTo ? (
                                <input
                                    type="text"
                                    value={formData.to}
                                    onChange={e => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                    placeholder="Adres giriniz"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            ) : (
                                <select
                                    value={formData.to}
                                    onChange={e => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Havalimanı Seçiniz</option>
                                    {Object.entries(AIRPORTS).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block mb-2">Uçuş Kodu</label>
                    <input
                        type="text"
                        value={formData.flightCode}
                        onChange={e => setFormData(prev => ({ ...prev, flightCode: e.target.value }))}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Yolcu İsimleri</label>
                    {formData.passengerNames.map((name: string, index: number) => (
                        <div key={index} className="mb-2 flex items-center gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handlePassengerNameChange(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Yolcu Adı"
                            />
                            {formData.passengerNames.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePassenger(index)}
                                    className="p-2 text-red-600 hover:text-red-800"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addPassenger}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        + Yolcu Ekle
                    </button>
                </div>

                <div>
                    <label className="block mb-2">Bagaj Sayısı</label>
                    <input
                        type="number"
                        value={Number.isNaN(formData.luggageCount) ? 0 : formData.luggageCount}
                        onChange={e => {
                            const raw = e.target.value;
                            const parsed = parseInt(raw, 10);
                            setFormData(prev => ({
                                ...prev,
                                luggageCount: Number.isNaN(parsed) ? 0 : parsed
                            }));
                        }}
                        className="w-full p-2 border rounded"
                        min="0"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Fiyat</label>
                        <input
                            type="number"
                            value={Number.isNaN(formData.price) ? 0 : formData.price}
                            onChange={e => {
                                const raw = e.target.value;
                                const parsed = parseFloat(raw);
                                setFormData(prev => ({
                                    ...prev,
                                    price: Number.isNaN(parsed) ? 0 : parsed
                                }));
                            }}
                            className="w-full p-2 border rounded"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Para Birimi</label>
                        <select
                            value={formData.currency}
                            onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full p-2 border rounded"
                            required
                        >
                            {Object.entries(CURRENCIES).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-between space-x-4">
                {/* Show delete button only if user has permission */}
                {(user?.role === 'SUPERUSER' || user?.permissions?.some(p => 
                    p.permission === 'DELETE_RESERVATIONS' && p.isActive
                )) && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
                        disabled={loading}
                    >
                        Rezervasyonu Sil
                    </button>
                )}
                
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={loading}
                    >
                        İptal
                    </button>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 text-white rounded ${
                            loading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>
                </div>
            </div>
        </form>
    );
} 