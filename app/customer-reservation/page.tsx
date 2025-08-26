'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Airport, AIRPORTS, Currency, CURRENCIES } from '../types';
import { HOTELS } from '@/app/types';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function CustomerReservationPage() {
    const router = useRouter();
    const { t } = useLanguage();

    const today = new Date().toISOString().split('T')[0];
    const defaultTime = '23:59';

    const [formData, setFormData] = useState({
        date: today,
        time: defaultTime,
        from: '' as Airport | string,
        to: '' as Airport | string,
        flightCode: '',
        passengerNames: [''],
        luggageCount: 0,
        phoneCountryCode: '+90',
        phoneLocal: '',
        email: '',
        specialRequests: ''
    });

    const [customFrom, setCustomFrom] = useState(true);
    const [customTo, setCustomTo] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Pricing calculator state
    const [distanceKm, setDistanceKm] = useState<number>(0);
    const [currency, setCurrency] = useState<Currency>('TRY' as Currency);
    const [fxTRY, setFxTRY] = useState<number>(1);
    const [calculatingDistance, setCalculatingDistance] = useState(false);

    // Fetch TRY-based FX (USD->TRY) is already in reports API; for simplicity keep static here (can be wired later)

    const basePriceTRY = useMemo(() => {
        if (distanceKm <= 10) return 700;
        if (distanceKm <= 20) return 1200;
        if (distanceKm <= 35) return 1500;
        if (distanceKm <= 50) return 2000;
        if (distanceKm <= 60) return 2500;
        return 2500;
    }, [distanceKm]);

    const priceInSelected = useMemo(() => {
        if (currency === 'TRY') return basePriceTRY;
        // simple conversion using fxTRY as TRY per selected unit
        if (currency === 'USD' && fxTRY > 0) return +(basePriceTRY / fxTRY).toFixed(2);
        if (currency === 'EUR' && fxTRY > 0) return +(basePriceTRY / fxTRY * 0.92).toFixed(2); // rough factor; to be replaced by real FX
        return basePriceTRY;
    }, [basePriceTRY, currency, fxTRY]);

    // Auto-calculate distance when both addresses are filled
    useEffect(() => {
        const calculateDistance = async () => {
            if (!customFrom && !customTo && formData.from && formData.to) {
                setCalculatingDistance(true);
                try {
                    const fromLocation = AIRPORTS[formData.from as Airport] || formData.from;
                    const toLocation = AIRPORTS[formData.to as Airport] || formData.to;
                    
                    // For now, use a simple estimation based on known routes
                    // In production, integrate with Google Maps Distance Matrix API
                    let estimatedDistance = 0;
                    
                    // Istanbul airport routes
                    if (fromLocation.includes('İstanbul') || toLocation.includes('İstanbul')) {
                        if (fromLocation.includes('Sabiha') || toLocation.includes('Sabiha')) {
                            estimatedDistance = 45; // SAW to city center
                        } else {
                            estimatedDistance = 35; // IST to city center
                        }
                    }
                    // Izmir routes
                    else if (fromLocation.includes('İzmir') || toLocation.includes('İzmir')) {
                        estimatedDistance = 25; // ADB to city center
                    }
                    // Antalya routes
                    else if (fromLocation.includes('Antalya') || toLocation.includes('Antalya')) {
                        estimatedDistance = 15; // AYT to city center
                    }
                    // Custom addresses - rough estimation
                    else {
                        estimatedDistance = 20; // Default for custom addresses
                    }
                    
                    setDistanceKm(estimatedDistance);
                } catch (error) {
                    console.error('Distance calculation error:', error);
                } finally {
                    setCalculatingDistance(false);
                }
            }
        };

        calculateDistance();
    }, [formData.from, formData.to, customFrom, customTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const phoneNumber = `${formData.phoneCountryCode} ${formData.phoneLocal}`.trim();
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
                    price: 0,
                    currency: currency,
                    phoneNumber,
                    email: formData.email,
                    specialRequests: formData.specialRequests,
                    isCustomerRequest: true
                }),
            });

            if (!response.ok) {
                let message = 'Rezervasyon talebi gönderilemedi';
                try {
                    const data = await response.json();
                    if (data?.error) message = data.error;
                } catch {
                    try {
                        const text = await response.text();
                        if (text) message = text;
                    } catch {}
                }
                throw new Error(message);
            }

            const result = await response.json();
            setSuccess(true);

            try {
                await fetch('/api/restart', { method: 'POST' });
            } catch (error) {
                console.error('Sunucu yeniden başlatılamadı:', error);
            }

            setTimeout(() => {
                router.push('/customer-reservation/thank-you');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
            console.error('Form gönderme hatası:', err);
        } finally {
            setLoading(false);
        }
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

    const formatLocation = (location: string) => {
        if (location.includes('IST') || location.includes('SAW') || location.includes('ADB') || location.includes('AYT')) {
            return location;
        }
        return location;
    };

    const COUNTRY_DIAL_CODES = [
        { code: '+90', label: 'Türkiye (+90)' },
        { code: '+44', label: 'United Kingdom (+44)' },
        { code: '+1', label: 'United States (+1)' },
        { code: '+971', label: 'United Arab Emirates (+971)' },
        { code: '+966', label: 'Saudi Arabia (+966)' },
        { code: '+49', label: 'Germany (+49)' },
        { code: '+33', label: 'France (+33)' },
        { code: '+39', label: 'Italy (+39)' },
        { code: '+34', label: 'Spain (+34)' },
        { code: '+31', label: 'Netherlands (+31)' },
        { code: '+41', label: 'Switzerland (+41)' },
        { code: '+43', label: 'Austria (+43)' },
        { code: '+7', label: 'Russia (+7)' },
        { code: '+380', label: 'Ukraine (+380)' },
        { code: '+30', label: 'Greece (+30)' },
        { code: '+48', label: 'Poland (+48)' },
        { code: '+36', label: 'Hungary (+36)' },
        { code: '+40', label: 'Romania (+40)' },
        { code: '+994', label: 'Azerbaijan (+994)' },
        { code: '+995', label: 'Georgia (+995)' },
        { code: '+374', label: 'Armenia (+374)' },
        { code: '+973', label: 'Bahrain (+973)' },
        { code: '+974', label: 'Qatar (+974)' },
        { code: '+965', label: 'Kuwait (+965)' },
        { code: '+968', label: 'Oman (+968)' },
        { code: '+962', label: 'Jordan (+962)' },
        { code: '+961', label: 'Lebanon (+961)' },
        { code: '+20', label: 'Egypt (+20)' },
        { code: '+212', label: 'Morocco (+212)' },
        { code: '+216', label: 'Tunisia (+216)' },
        { code: '+218', label: 'Libya (+218)' },
        { code: '+964', label: 'Iraq (+964)' },
        { code: '+98', label: 'Iran (+98)' },
        { code: '+92', label: 'Pakistan (+92)' },
        { code: '+91', label: 'India (+91)' }
    ];

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Teşekkürler!</h1>
                    <p className="text-gray-600 mb-6">
                        Rezervasyon talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız.
                    </p>
                    <div className="text-sm text-gray-500">
                        Takip numaranız: <span className="font-mono font-bold text-blue-600">{`${formData.phoneCountryCode} ${formData.phoneLocal}`.trim()}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-end mb-4">
                        <LanguageSelector />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('customerForm.title')}</h1>
                    <p className="text-xl text-gray-600">{t('customerForm.subtitle')}</p>
                    <p className="text-gray-500 mt-2">{t('customerForm.description')}</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tarih ve Saat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('customerForm.date')}
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    min={today}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    style={{
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        appearance: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('customerForm.time')}
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                    style={{
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        appearance: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Güzergah */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('customerForm.from')}
                                </label>
                                <div className="space-y-2">
                                    <select
                                        value={customFrom ? 'custom' : formData.from}
                                        onChange={(e) => {
                                            if (e.target.value === 'custom') {
                                                setCustomFrom(true);
                                                setFormData(prev => ({ ...prev, from: '' }));
                                            } else {
                                                setCustomFrom(false);
                                                setFormData(prev => ({ ...prev, from: e.target.value }));
                                            }
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="custom">{t('customerForm.customLocation')}</option>
                                        <optgroup label="Havalimanları">
                                            {Object.entries(AIRPORTS).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Taksim Bölgesi">
                                            {Object.entries(HOTELS).map(([key, value]) => (
                                                <option key={key} value={key}>{String(value)}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    {customFrom && (
                                        <input
                                            type="text"
                                            placeholder={t('customerForm.addressPlaceholder')}
                                            value={formData.from}
                                            onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('customerForm.to')}
                                </label>
                                <div className="space-y-2">
                                    <select
                                        value={customTo ? 'custom' : formData.to}
                                        onChange={(e) => {
                                            if (e.target.value === 'custom') {
                                                setCustomTo(true);
                                                setFormData(prev => ({ ...prev, to: '' }));
                                            } else {
                                                setCustomTo(false);
                                                setFormData(prev => ({ ...prev, to: e.target.value }));
                                            }
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="custom">{t('customerForm.customLocation')}</option>
                                        <optgroup label="Havalimanları">
                                            {Object.entries(AIRPORTS).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Taksim Bölgesi">
                                            {Object.entries(HOTELS).map(([key, value]) => (
                                                <option key={key} value={key}>{String(value)}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    {customTo && (
                                        <input
                                        type="text"
                                        placeholder={t('customerForm.addressPlaceholder')}
                                        value={formData.to}
                                        onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Calculator */}
                        <div className="rounded-xl border bg-gray-50 p-4">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesafe (km)</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min={0} 
                                            value={distanceKm} 
                                            onChange={(e)=>setDistanceKm(parseFloat(e.target.value)||0)} 
                                            className="flex-1 px-3 py-2 border rounded-lg" 
                                        />
                                        {calculatingDistance && (
                                            <div className="text-sm text-blue-600">Hesaplanıyor...</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                                    <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className="px-3 py-2 border rounded-lg">
                                        {Object.keys(CURRENCIES).map((c)=> (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-right md:w-56">
                                    <div className="text-xs text-gray-500">Tahmini Fiyat</div>
                                    <div className="text-2xl font-bold">{priceInSelected} {currency}</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">Not: Fiyat aralıkları 0-10km 700₺, 0-20km 1200₺, 0-35km 1500₺, 0-50km 2000₺, 0-60km 2500₺ şeklindedir.</div>
                        </div>

                        {/* Uçuş Bilgisi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('customerForm.flightCode')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('customerForm.flightCodePlaceholder')}
                                value={formData.flightCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, flightCode: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Yolcu Bilgileri */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('customerForm.passengers')}
                            </label>
                            {formData.passengerNames.map((name, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder={t('customerForm.passengerPlaceholder').replace('{number}', String(index + 1))}
                                        value={name}
                                        onChange={(e) => updatePassengerName(index, e.target.value)}
                                        required
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {formData.passengerNames.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePassenger(index)}
                                            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addPassenger}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                {t('customerForm.addPassenger')}
                            </button>
                        </div>

                        {/* Bagaj */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('customerForm.luggage')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.luggageCount}
                                onChange={(e) => setFormData(prev => ({ ...prev, luggageCount: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* İletişim Bilgileri */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('customerForm.phone')}
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={formData.phoneCountryCode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phoneCountryCode: e.target.value }))}
                                        className="w-full sm:w-44 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        {COUNTRY_DIAL_CODES.map(({ code, label }) => (
                                            <option key={code} value={code}>{label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder={t('customerForm.phonePlaceholder')}
                                        value={formData.phoneLocal}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phoneLocal: e.target.value }))}
                                        required
                                        className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('customerForm.email')}
                                </label>
                                <input
                                    type="email"
                                    placeholder={t('customerForm.emailPlaceholder')}
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Özel Talepler */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('customerForm.specialRequests')}
                            </label>
                            <textarea
                                placeholder={t('customerForm.specialRequestsPlaceholder')}
                                value={formData.specialRequests}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('customerForm.sending') : t('customerForm.submitButton')}
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                            <p>{t('customerForm.infoNote1')}</p>
                            <p>{t('customerForm.infoNote2')}</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
