'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Airport, AIRPORTS, Currency, CURRENCIES } from '../types';
import { HOTELS } from '@/app/types';

export default function ReservationForm() {
    const router = useRouter();

    // Bugünün tarihini YYYY-MM-DD formatında al
    const today = new Date().toISOString().split('T')[0];
    
    // Son saati ayarla (23:59)
    const defaultTime = '23:59';

    const [formData, setFormData] = useState({
        date: today,
        time: defaultTime,
        from: '' as Airport | string,
        to: '' as Airport | string,
        flightCode: '',
        passengerNames: [''],
        luggageCount: 0,
        price: 0,
        currency: 'USD' as Currency,
        phoneNumber: ''
    });

    const [customFrom, setCustomFrom] = useState(true);
    const [customTo, setCustomTo] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: formData.date,
                    time: formData.time,
                    from: formData.from,
                    to: formData.to,
                    flightCode: formData.flightCode,
                    passengerNames: formData.passengerNames,
                    luggageCount: formData.luggageCount,
                    price: formData.price,
                    currency: formData.currency,
                    phoneNumber: formData.phoneNumber
                }),
            });

            if (!response.ok) {
                throw new Error('Rezervasyon oluşturulamadı');
            }

            const result = await response.json();
            setSuccess(true);
            
            // Sunucuyu yeniden başlat
            try {
                await fetch('/api/restart', {
                    method: 'POST',
                });
            } catch (error) {
                console.error('Sunucu yeniden başlatılamadı:', error);
            }

            router.push(`/reservations/${result.voucherNumber}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
            console.error('Form gönderme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateVoucherNumber = () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `VIP${dateStr}-${randomStr}`;
    };

    const addPassenger = () => {
        setFormData(prev => ({
            ...prev,
            passengerNames: [...prev.passengerNames, '']
        }));
    };

    const updatePassengerName = (index: number, value: string) => {
        const newPassengerNames = [...formData.passengerNames];
        newPassengerNames[index] = value;
        setFormData(prev => ({
            ...prev,
            passengerNames: newPassengerNames
        }));
    };

    const removePassenger = (index: number) => {
        if (formData.passengerNames.length > 1) {
            const newPassengerNames = formData.passengerNames.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                passengerNames: newPassengerNames
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-1.5">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tarih ve Saat */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <span role="img" aria-label="calendar" className="text-xl">📅</span>
                            Transfer Zamanı
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Tarih</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Saat</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Güzergah */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <span role="img" aria-label="route" className="text-xl">🚗</span>
                            Transfer Güzergahı
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Nereden</label>
                                <div className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={!customFrom}
                                        onChange={() => {
                                            setCustomFrom(!customFrom);
                                            if (customFrom) {
                                                setFormData(prev => ({ ...prev, from: '' }));
                                            } else {
                                                setFormData(prev => ({ ...prev, from: '' }));
                                            }
                                        }}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-600">Havalimanı/Otel Seç</span>
                                </div>
                                {!customFrom ? (
                                    <select
                                        value={formData.from}
                                        onChange={e => setFormData(prev => ({ ...prev, from: e.target.value }))}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                        required
                                    >
                                        <option value="">Konum Seçin</option>
                                        <optgroup label="Havalimanları">
                                            {Object.entries(AIRPORTS).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Taksim Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('TAKSIM') || key.includes('CVK') || key.includes('HYATT'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Beşiktaş/Boğaz Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('BOSPHORUS') || key.includes('CIRAGAN') || key.includes('SHANGRI') || key.includes('RITZ') || key.includes('SWISSOTEL') || key.includes('CONRAD'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Şişli/Levent Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('SISLI') || key.includes('LEVENT') || key.includes('DEDEMAN') || key.includes('POINT') || key.includes('FAIRMONT') || key.includes('RAFFLES'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Bakırköy Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('BAKIRKOY') || key.includes('FLORYA') || key.includes('YESILKOY'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Sultanahmet Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('SULTANAHMET') || key.includes('SURA') || key.includes('ARMADA') || key.includes('YASMAK') || key.includes('LEVNI'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={formData.from}
                                        onChange={e => setFormData(prev => ({ ...prev, from: e.target.value }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Özel adres giriniz"
                                        required
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Nereye</label>
                                <div className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={!customTo}
                                        onChange={() => {
                                            setCustomTo(!customTo);
                                            if (customTo) {
                                                setFormData(prev => ({ ...prev, to: '' }));
                                            } else {
                                                setFormData(prev => ({ ...prev, to: '' }));
                                            }
                                        }}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-600">Havalimanı/Otel Seç</span>
                                </div>
                                {!customTo ? (
                                    <select
                                        value={formData.to}
                                        onChange={e => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                        required
                                    >
                                        <option value="">Konum Seçin</option>
                                        <optgroup label="Havalimanları">
                                            {Object.entries(AIRPORTS).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Taksim Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('TAKSIM') || key.includes('CVK') || key.includes('HYATT'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Beşiktaş/Boğaz Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('BOSPHORUS') || key.includes('CIRAGAN') || key.includes('SHANGRI') || key.includes('RITZ') || key.includes('SWISSOTEL') || key.includes('CONRAD'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Şişli/Levent Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('SISLI') || key.includes('LEVENT') || key.includes('DEDEMAN') || key.includes('POINT') || key.includes('FAIRMONT') || key.includes('RAFFLES'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Bakırköy Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('BAKIRKOY') || key.includes('FLORYA') || key.includes('YESILKOY'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                        <optgroup label="Sultanahmet Bölgesi">
                                            {Object.entries(HOTELS)
                                                .filter(([key]) => key.includes('SULTANAHMET') || key.includes('SURA') || key.includes('ARMADA') || key.includes('YASMAK') || key.includes('LEVNI'))
                                                .map(([key, value]) => (
                                                    <option key={key} value={key}>{String(value)}</option>
                                                ))
                                            }
                                        </optgroup>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={formData.to}
                                        onChange={e => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Özel adres giriniz"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        {/* Uçuş Kodu */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">Uçuş Kodu</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span role="img" aria-label="airplane" className="text-gray-400">✈️</span>
                                </div>
                                <input
                                    type="text"
                                    value={formData.flightCode}
                                    onChange={e => setFormData(prev => ({ ...prev, flightCode: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="TK1234"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Yolcu Bilgileri */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <span role="img" aria-label="passengers" className="text-xl">👥</span>
                            Yolcu Bilgileri
                        </h3>
                        <div className="space-y-2">
                            {formData.passengerNames.map((name, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => updatePassengerName(index, e.target.value)}
                                        className="flex-1 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder={`${index + 1}. Yolcu`}
                                        required
                                    />
                                    {formData.passengerNames.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePassenger(index)}
                                            className="mt-1 inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addPassenger}
                                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Yolcu Ekle
                            </button>
                        </div>

                        {/* İletişim Numarası */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">
                                İletişim Numarası
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span role="img" aria-label="phone" className="text-gray-400">📱</span>
                                </div>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="0555 555 5555"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagaj ve Ödeme */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <span role="img" aria-label="payment" className="text-xl">💰</span>
                            Bagaj ve Ödeme Bilgileri
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Bagaj Sayısı</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span role="img" aria-label="luggage" className="text-gray-400">🧳</span>
                                    </div>
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
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Fiyat</label>
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
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Para Birimi</label>
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value as Currency }))}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                    required
                                >
                                    {Object.entries(CURRENCIES).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Gönder Butonu */}
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                loading 
                                    ? 'bg-green-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    İşleniyor...
                                </>
                            ) : (
                                <>
                                    <span role="img" aria-label="save" className="text-xl">💾</span>
                                    Rezervasyon Oluştur
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 