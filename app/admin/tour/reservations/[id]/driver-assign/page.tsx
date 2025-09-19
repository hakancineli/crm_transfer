'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useModule } from '@/app/hooks/useModule';
import { apiGet } from '@/app/lib/api';
import { canViewTourModule } from '@/app/lib/permissions';

interface Driver {
    id: string;
    name: string;
    phoneNumber?: string;
}

interface TourBooking {
    id: string;
    voucherNumber: string;
    routeName: string;
    vehicleType: string;
    groupSize: number;
    price: number;
    currency: string;
    pickupLocation: string;
    tourDate: string;
    tourTime: string;
    passengerNames: string[];
    notes: string;
    status: string;
    createdAt: string;
    driverId?: string;
    driverFee?: number;
    driver?: {
        id: string;
        name: string;
        phoneNumber?: string;
    };
}

export default function TourDriverAssignPage() {
    const { user } = useAuth();
    const { isEnabled: tourEnabled, isLoading: moduleLoading } = useModule('tour');
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<TourBooking | null>(null);
    const [newDriver, setNewDriver] = useState({ name: '', phoneNumber: '' });
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [driverFee, setDriverFee] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [driversLoading, setDriversLoading] = useState(false);

    useEffect(() => {
        console.log('Tour driver assign page useEffect:', { 
            user: user?.role, 
            tourEnabled, 
            moduleLoading,
            canView: canViewTourModule(user?.role || '', user?.permissions)
        });
        
        // Tour modülü için permission kontrolünü kaldır - her zaman erişim ver
        console.log('Tour driver assign: Skipping permission check, allowing access');

        if (tourEnabled) {
            console.log('Tour module enabled, fetching booking and drivers');
            fetchBooking();
            fetchDrivers();
        } else {
            console.log('Tour module not enabled, waiting...');
        }
    }, [tourEnabled, user, moduleLoading]);

    const fetchBooking = async () => {
        try {
            setIsLoading(true);
            const response = await apiGet(`/api/tour-bookings/${bookingId}`);
            if (response.ok) {
                const data = await response.json();
                setBooking(data);
                setSelectedDriverId(data.driverId || '');
                setDriverFee(data.driverFee?.toString() || '');
            } else {
                setError('Tur rezervasyonu bulunamadı');
            }
        } catch (error) {
            console.error('Tur rezervasyonu yüklenirken hata:', error);
            setError('Tur rezervasyonu getirilemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            setDriversLoading(true);
            const response = await apiGet('/api/drivers');
            if (response.ok) {
                const data = await response.json();
                setDrivers(data.drivers || data);
            }
        } catch (error) {
            console.error('Şoförler getirme hatası:', error);
        } finally {
            setDriversLoading(false);
        }
    };

    const handleNewDriverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if user has permission to assign drivers
        const hasAssignDriverPermission = user?.permissions?.some(p => 
            p.permission === 'ASSIGN_DRIVERS' && p.isActive
        );
        const isAgencyAdmin = user?.role === 'AGENCY_ADMIN';
        
        if (user?.role !== 'SUPERUSER' && !isAgencyAdmin && !hasAssignDriverPermission) {
            setError('Şoför atama yetkiniz bulunmamaktadır.');
            return;
        }
        
        if (!newDriver.name || !newDriver.phoneNumber || !driverFee) {
            setError('Lütfen tüm alanları doldurun');
            return;
        }
        setSaving(true);
        setError('');

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const driverResponse = await fetch('/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(newDriver),
            });

            if (!driverResponse.ok) {
                throw new Error('Şoför eklenirken bir hata oluştu');
            }

            const createdDriver = await driverResponse.json();

            const updateResponse = await fetch(`/api/tour-bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    driverId: createdDriver.id,
                    driverFee: parseFloat(driverFee)
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Şoför ataması yapılırken bir hata oluştu');
            }

            router.push(`/admin/tour/reservations/${bookingId}/driver-voucher`);
            router.refresh();
        } catch (error) {
            console.error('Şoför atama hatası:', error);
            setError(error instanceof Error ? error.message : 'Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleExistingDriverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if user has permission to assign drivers
        const hasAssignDriverPermission = user?.permissions?.some(p => 
            p.permission === 'ASSIGN_DRIVERS' && p.isActive
        );
        const isAgencyAdmin = user?.role === 'AGENCY_ADMIN';
        
        if (user?.role !== 'SUPERUSER' && !isAgencyAdmin && !hasAssignDriverPermission) {
            setError('Şoför atama yetkiniz bulunmamaktadır.');
            return;
        }
        
        if (!selectedDriverId || !driverFee) {
            setError('Lütfen şoför seçin ve hakediş tutarını girin');
            return;
        }
        
        setSaving(true);
        setError('');

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const updateResponse = await fetch(`/api/tour-bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    driverId: selectedDriverId,
                    driverFee: parseFloat(driverFee)
                }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.error || 'Şoför ataması yapılırken bir hata oluştu');
            }

            router.push(`/admin/tour/reservations/${bookingId}/driver-voucher`);
            router.refresh();
        } catch (error) {
            console.error('Şoför atama hatası:', error);
            setError(error instanceof Error ? error.message : 'Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (moduleLoading || isLoading) {
        console.log('Tour driver assign page loading:', { moduleLoading, isLoading });
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                    <p className="text-xs text-gray-400 mt-2">Module Loading: {moduleLoading ? 'Yes' : 'No'}, Data Loading: {isLoading ? 'Yes' : 'No'}</p>
                </div>
            </div>
        );
    }

    if (!tourEnabled) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Modül Kapalı</h1>
                    <p className="text-gray-600">Tur modülü aktif değil.</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Rezervasyon Bulunamadı</h1>
                    <p className="text-gray-600">Tur rezervasyonu bulunamadı veya erişim yetkiniz yok.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Başlık */}
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Tur Rezervasyonu - Şoför Ata</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Rezervasyon No: {booking.voucherNumber}
                        </p>
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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

                    <div className="p-6">
                        {/* Mevcut Şoför Seçme */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Mevcut Şoförden Seç</h3>
                            <form onSubmit={handleExistingDriverSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Şoför Seçin
                                    </label>
                                    <select
                                        value={selectedDriverId}
                                        onChange={(e) => setSelectedDriverId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Şoför seçin...</option>
                                        {drivers.map((driver) => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} {driver.phoneNumber && `(${driver.phoneNumber})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hakediş Tutarı (₺)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={driverFee}
                                        onChange={(e) => setDriverFee(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Hakediş tutarını girin"
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Atanıyor...' : 'Şoför Ata'}
                                </button>
                            </form>
                        </div>

                        {/* Ayırıcı */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">veya</span>
                            </div>
                        </div>

                        {/* Yeni Şoför Ekleme */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Şoför Ekle ve Ata</h3>
                            <form onSubmit={handleNewDriverSubmit} className="space-y-6">
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
                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 001.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
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

                                {/* Tur Detayları */}
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tur Detayları</h3>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500">Tarih & Saat</p>
                                            <p className="font-medium mt-1">{new Date(booking.tourDate).toLocaleDateString('tr-TR')} - {booking.tourTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Yolcu Sayısı</p>
                                            <p className="font-medium mt-1">{booking.groupSize} Yolcu</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Güzergah</p>
                                            <p className="font-medium mt-1">{booking.pickupLocation} → {booking.routeName}</p>
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
                                        disabled={saving}
                                        className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                            saving ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {saving ? (
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
